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
  A window with the brand film in it, and a ribbon that is glass where it
  crosses the film: it bends what is behind it, splits the light at its
  edges, and is silk again the moment it leaves the frame. Glass cannot
  refract an HTML page; it can refract a film — which is why the film is
  inside the same scene.

  Used two ways: as the picture in a frame, and full-bleed as the whole
  cover. `ribbon` is the band's width as a fraction of the frame; `videoAspect`
  lets the film cover-fit whatever the frame is.

  Cost, honestly: transmission renders what is behind the glass into a
  buffer once per frame. That is what made the old glass world expensive —
  there it was a whole scene behind everything. Here the scene is one plane
  and one band, at reduced buffer resolution, and only while the window is on
  screen. Low-tier devices get frosted glass and no refraction.
*/

function Film({ src, aspect }: { src: string; aspect: number }) {
  const texture = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  const { viewport, camera } = useThree();
  const ref = useRef<THREE.Mesh>(null);

  // cover-fit at the plane's own depth (it sits behind z=0, where the
  // viewport is larger), with spare so the parallax never shows an edge
  const at = viewport.getCurrentViewport(camera, [0, 0, -0.6]);
  const frameAspect = at.width / at.height;
  const w = (frameAspect > aspect ? at.width : at.height * aspect) * 1.12;
  const h = w / aspect;

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.x += (store.pointerX * 0.1 - m.position.x) * 0.06;
    m.position.y += (store.pointerY * 0.07 - m.position.y) * 0.06;
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.6]} scale={[w, h, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function GlassRibbon({ glass, tier, ribbon }: { glass: boolean; tier: DeviceTier; ribbon: number }) {
  const { viewport } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 160;
  const width = Math.min(viewport.width, viewport.height) * ribbon;

  // Top-right in, bottom-left out, through the upper half so it crosses the
  // picture rather than lying on its subject.
  const curve = useMemo(() => {
    const W = viewport.width;
    const H = viewport.height;
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(W * 0.95, H * 0.95, 0.45),
        new THREE.Vector3(W * 0.45, H * 0.4, 0.15),
        new THREE.Vector3(W * 0.05, H * 0.02, 0.5),
        new THREE.Vector3(-W * 0.4, -H * 0.3, 0.2),
        new THREE.Vector3(-W * 0.95, -H * 0.75, 0.4),
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
    const W = viewport.width;
    const H = viewport.height;
    // the pointer in this frame's world units
    const px = store.pointerX * W * 0.5;
    const py = store.pointerY * H * 0.5;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = points[i];
      // the band leans toward the pointer where it passes near it
      const dx = px - p.x;
      const dy = py - p.y;
      const dist = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - dist / (W * 0.45)) * 0.18 * W;
      const bx = dist > 0.001 ? (dx / dist) * pull : 0;
      const by = dist > 0.001 ? (dy / dist) * pull : 0;
      const twist = Math.sin(t * 9 + time * 1.0) * 0.7 + Math.sin(t * 4 - time * 0.6) * 0.35;
      side.copy(frames.binormals[i]).applyAxisAngle(frames.tangents[i], twist).multiplyScalar(width / 2);
      pos.setXYZ(i * 2, p.x + bx - side.x, p.y + by - side.y, p.z - side.z);
      pos.setXYZ(i * 2 + 1, p.x + bx + side.x, p.y + by + side.y, p.z + side.z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      {glass ? (
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.55}
          roughness={0.06}
          ior={1.32}
          chromaticAberration={0.08}
          anisotropicBlur={0.12}
          distortion={0.5}
          distortionScale={0.45}
          temporalDistortion={0.08}
          color="#ffe1ec"
          resolution={tier === "high" ? 640 : 448}
          samples={tier === "high" ? 6 : 4}
          side={THREE.DoubleSide}
        />
      ) : (
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

export default function GlassWindow({
  video,
  poster,
  alt,
  videoAspect = 540 / 960,
  ribbon = 0.13,
  priority = true,
}: {
  video: string;
  poster: string;
  alt: string;
  videoAspect?: number;
  /** band width as a fraction of the frame's shorter side */
  ribbon?: number;
  priority?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ready = useDeferredScene();
  const [visible, setVisible] = useState(true);
  const [shown, setShown] = useState(false);
  const heavyOk = typeof navigator === "undefined" ? true : !skipHeavyMedia();

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setShown(true), 400);
    return () => window.clearTimeout(t);
  }, [ready]);

  const tier: DeviceTier = store.tier;
  const glass = tier !== "low";

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-ink">
      <Image src={poster} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      {ready && heavyOk && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${shown ? "opacity-100" : "opacity-0"}`}>
          <Canvas
            key={video}
            dpr={TIER_CONFIG[tier].dpr}
            camera={{ position: [0, 0, 5], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            frameloop={visible ? "always" : "never"}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 6]} intensity={1.4} color="#fff6ee" />
            <directionalLight position={[-4, -2, 4]} intensity={0.6} color="#ff5c9e" />
            <Suspense fallback={null}>
              <Film src={video} aspect={videoAspect} />
              <GlassRibbon glass={glass} tier={tier} ribbon={ribbon} />
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
}
