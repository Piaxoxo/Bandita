"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { scene as store, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import { useDeferredScene } from "@/lib/use-deferred-scene";
import { skipHeavyMedia } from "@/lib/defer";

/*
  The cover window.

  The cover's picture frame is a window with the brand film playing in it, and
  where the ribbon crosses the window it is glass: it bends the film behind
  it, splits the light at its edges, and goes back to silk the moment it
  leaves the frame. This is the "glass that changes with what's behind it"
  effect — and it is possible here precisely because the thing behind the
  glass is inside the same WebGL scene. Glass cannot refract an HTML page;
  it can refract a film.

  Cost, honestly: transmission renders what is behind the glass into a
  buffer once per frame. That is what made the old glass world expensive —
  there it was a whole scene, full-viewport, behind everything. Here the
  scene is one plane and one short ribbon, in a frame a third of the screen
  wide, at reduced buffer resolution, and only while the cover is on screen.
  Low-tier devices get silk over film and no refraction at all.

  The poster image paints first and stays underneath; the canvas fades in
  over it once three.js has been allowed to load (after the intro, on idle).
*/

const VIDEO_ASPECT = 540 / 960;

function Film({ src }: { src: string }) {
  const texture = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  const { viewport } = useThree();
  const ref = useRef<THREE.Mesh>(null);

  // cover-fit the 9:16 film into whatever the frame is, with a little spare
  // so the parallax never shows an edge
  const frameAspect = viewport.width / viewport.height;
  const w = (frameAspect > VIDEO_ASPECT ? viewport.width : viewport.height * VIDEO_ASPECT) * 1.1;
  const h = w / VIDEO_ASPECT;

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.x += (store.pointerX * 0.12 - m.position.x) * 0.06;
    m.position.y += (store.pointerY * 0.08 - m.position.y) * 0.06;
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.6]} scale={[w, h, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function GlassRibbon({ glass, tier }: { glass: boolean; tier: DeviceTier }) {
  const { viewport } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 140;
  const width = viewport.width * 0.13;

  // Top-right in, bottom-left out — the same diagonal the page ribbon takes
  // through this region, so the two read as one band — but shifted toward
  // the upper right so it clips the corner of the picture rather than lying
  // across its subject.
  const curve = useMemo(() => {
    const W = viewport.width;
    const H = viewport.height;
    const ox = W * 0.2;
    const oy = H * 0.18;
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(W * 0.8 + ox, H * 0.8 + oy, 0.45),
        new THREE.Vector3(W * 0.3 + ox, H * 0.3 + oy, 0.15),
        new THREE.Vector3(-W * 0.1 + ox, -H * 0.08 + oy, 0.5),
        new THREE.Vector3(-W * 0.5 + ox, -H * 0.45 + oy, 0.2),
        new THREE.Vector3(-W * 0.85 + ox, -H * 0.85 + oy, 0.4),
      ],
      false,
      "centripetal",
    );
  }, [viewport.width, viewport.height]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = (segments + 1) * 2;
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const uv = new Float32Array(count * 2);
    const index: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      uv[i * 4] = 0; uv[i * 4 + 1] = t;
      uv[i * 4 + 2] = 1; uv[i * 4 + 3] = t;
      if (i < segments) {
        const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        index.push(a, c, b, b, c, d);
      }
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(index);
    return g;
  }, []);

  const frames = useMemo(() => curve.computeFrenetFrames(segments, false), [curve]);
  const points = useMemo(() => curve.getSpacedPoints(segments), [curve]);
  const side = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const time = store.reduced ? 0 : state.clock.elapsedTime;
    m.rotation.y = store.pointerX * 0.12;
    m.rotation.x = -store.pointerY * 0.08;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = points[i];
      const twist = Math.sin(t * 9 + time * 1.0) * 0.7 + Math.sin(t * 4 - time * 0.6) * 0.35;
      side.copy(frames.binormals[i]).applyAxisAngle(frames.tangents[i], twist).multiplyScalar(width / 2);
      pos.setXYZ(i * 2, p.x - side.x, p.y - side.y, p.z - side.z);
      pos.setXYZ(i * 2 + 1, p.x + side.x, p.y + side.y, p.z + side.z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      {glass ? (
        /*
          The glass. `chromaticAberration` is the colour fringing at the edges,
          `distortion` the swim in the surface; both are what make it read as
          a real material rather than a blur. The tint is the palest brand
          Rosé so the film shows through pink-warm, not grey.
        */
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.55}
          roughness={0.06}
          ior={1.32}
          chromaticAberration={0.07}
          anisotropicBlur={0.12}
          distortion={0.45}
          distortionScale={0.45}
          temporalDistortion={0.08}
          color="#ffe1ec"
          resolution={tier === "high" ? 512 : 384}
          samples={tier === "high" ? 6 : 4}
          side={THREE.DoubleSide}
        />
      ) : (
        /*
          Low tier: frosted glass instead of refraction. A plain translucent
          surface costs nothing extra and still lets the film show through
          tinted — an opaque silk band here would simply hide the picture.
        */
        <meshPhysicalMaterial
          color="#ffd0e0"
          transparent
          opacity={0.55}
          roughness={0.18}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}

export default function GlassWindow({ video, poster, alt }: { video: string; poster: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const ready = useDeferredScene();
  const [visible, setVisible] = useState(true);
  const [shown, setShown] = useState(false);
  const heavyOk = typeof navigator === "undefined" ? true : !skipHeavyMedia();

  // Pause the render loop when the cover is off screen — the film and the
  // glass buffer have nothing to do for a visitor reading chapter three.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A short beat after mount so the first frames (and the video's first
  // decode) happen under the poster rather than as a flash.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setShown(true), 400);
    return () => window.clearTimeout(t);
  }, [ready]);

  const tier: DeviceTier = store.tier;
  const glass = tier !== "low";

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-ink/5">
      <Image src={poster} alt={alt} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
      {ready && heavyOk && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${shown ? "opacity-100" : "opacity-0"}`}>
          <Canvas
            dpr={TIER_CONFIG[tier].dpr}
            camera={{ position: [0, 0, 5], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            frameloop={visible ? "always" : "never"}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 6]} intensity={1.4} color="#fff6ee" />
            <directionalLight position={[-4, -2, 4]} intensity={0.6} color="#ff5c9e" />
            <Suspense fallback={null}>
              <Film src={video} />
              <GlassRibbon glass={glass} tier={tier} />
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
}
