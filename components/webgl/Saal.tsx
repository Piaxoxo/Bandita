"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, useVideoTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { scene as store, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import KameraModel from "./KameraModel";

/*
  The hall.

  A dark room whose back wall is the film. In front of it, the cover line
  as glass letters, huge and central, bending the film behind them. The silk
  band winds through. The cinema camera stands to the right as soon as a
  real model is delivered (see KameraModel); until then its place is kept.

  What makes it a film and not a viewer: a studio environment built from
  light panels (no download), so glass and lacquer have something to
  reflect; bloom on the highlights; grain and a vignette over the frame;
  a trace of colour fringing at the edges. And it never stands still: the
  camera drifts, the letters breathe, dust hangs in the light.

  Intro: particles gather on the letter surfaces and the glass fades in
  under them. Scroll: the visitor's camera flies on, and as it passes the
  letters they let go — back into particles — while the film fills the
  frame. Low tier: lacquer instead of glass, no post-processing.
*/

const CAM_FAR = 15;
const CAM_NEAR = 7.5;
const CAM_END = -3.5;
const WALL_Z = -7;
const FOV = 35;
const TAU = Math.PI * 2;

type Lines = { line1: string; line2: string };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ── the wall is the film ───────────────────────────────────────────────── */
function Wall({ src, aspect }: { src: string; aspect: number }) {
  const texture = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  const { viewport, camera } = useThree();
  // cover-fit the film to what the arrived camera sees of the wall
  const seen = viewport.getCurrentViewport(camera, [0, 0, WALL_Z]);
  const dist = CAM_NEAR - WALL_Z;
  const h0 = 2 * dist * Math.tan((FOV * Math.PI) / 360);
  const w0 = h0 * (seen.width / seen.height);
  // generous: the camera drifts, tilts and ends close to the wall, and the
  // wall must never show an edge
  const w = (w0 / h0 > aspect ? w0 : h0 * aspect) * 1.7;
  const h = w / aspect;
  return (
    <group position={[0, -0.3, WALL_Z]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* the film lights the room */}
      <pointLight position={[0, 0, 2]} intensity={40} distance={16} decay={2} color="#ffd2b0" />
    </group>
  );
}

/* ── dust in the light, always ──────────────────────────────────────────── */
function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 16;
      p[i * 3 + 1] = (Math.random() - 0.5) * 9;
      p[i * 3 + 2] = -5 + Math.random() * 10;
      s[i] = Math.random();
    }
    return { positions: p, seeds: s };
  }, [count]);
  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;
    const a = pts.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      a.setY(i, positions[i * 3 + 1] + Math.sin(t * (0.2 + s * 0.3) + s * 9) * 0.6);
      a.setX(i, positions[i * 3] + Math.cos(t * (0.15 + s * 0.2) + s * 7) * 0.5 + store.pointerX * 0.4);
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#ffd9e4" transparent opacity={0.55} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── the letters, and the particles that form and unform them ───────────── */
function Letters({
  lines,
  tier,
  armed,
  progress,
  width,
}: {
  lines: Lines;
  tier: DeviceTier;
  armed: boolean;
  progress: MutableRefObject<number>;
  /** target width of the longer line, world units at z=0 */
  width: number;
}) {
  const upright = useLoader(FontLoader, "/fonts/bodoni-500.typeface.json") as Font;
  const italic = useLoader(FontLoader, "/fonts/bodoni-500i.typeface.json") as Font;
  const group = useRef<THREE.Group>(null);
  const line1 = useRef<THREE.Mesh>(null);
  const line2 = useRef<THREE.Mesh>(null);
  const mat1 = useRef<THREE.Material>(null);
  const mat2 = useRef<THREE.Material>(null);
  const points = useRef<THREE.Points>(null);
  const glass = tier !== "low";

  const { geo1, geo2, scale, baseline1, baseline2, offset1, offset2, particles } = useMemo(() => {
    const make = (text: string, font: Font) =>
      new TextGeometry(text, {
        font,
        size: 1,
        depth: 0.26,
        curveSegments: tier === "high" ? 10 : 6,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.014,
        bevelSegments: 3,
      });
    const g1 = make(lines.line1, upright);
    const g2 = make(lines.line2, italic);
    g1.computeBoundingBox();
    g2.computeBoundingBox();
    const w1 = g1.boundingBox!.max.x - g1.boundingBox!.min.x;
    const w2 = g2.boundingBox!.max.x - g2.boundingBox!.min.x;
    const s = width / Math.max(w1, w2);
    // centred block: each line centred on x, tight leading
    const o1 = -(g1.boundingBox!.min.x + w1 / 2) * s;
    const o2 = -(g2.boundingBox!.min.x + w2 / 2) * s;
    const b1 = 0.18 * s;
    const b2 = b1 - 1.02 * s;

    const count = Math.round(TIER_CONFIG[tier].intro * 1.8);
    const target = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const delay = new Float32Array(count);
    const sample = (geo: THREE.BufferGeometry, baseline: number, ox: number, from: number, to: number) => {
      const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
      const p = new THREE.Vector3();
      for (let i = from; i < to; i++) {
        sampler.sample(p);
        target[i * 3] = p.x * s + ox;
        target[i * 3 + 1] = p.y * s + baseline;
        target[i * 3 + 2] = p.z * s;
        const a = Math.random() * TAU;
        const el = (Math.random() - 0.5) * Math.PI;
        const r = 5 + Math.random() * 7;
        start[i * 3] = Math.cos(a) * Math.cos(el) * r;
        start[i * 3 + 1] = Math.sin(el) * r * 0.6;
        start[i * 3 + 2] = 1 + Math.sin(a) * Math.cos(el) * r;
        delay[i] = Math.random() * 0.45;
      }
    };
    const half = Math.floor(count * (w1 / (w1 + w2)));
    sample(g1, b1, o1, 0, half);
    sample(g2, b2, o2, half, count);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(target.slice(), 3));
    pg.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    pg.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    pg.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
    return { geo1: g1, geo2: g2, scale: s, baseline1: b1, baseline2: b2, offset1: o1, offset2: o2, particles: pg };
  }, [lines, upright, italic, width, tier]);

  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uOpacity: { value: 1 },
          uSize: { value: 2.8 },
          uColor: { value: new THREE.Color("#FB003F") },
          uColor2: { value: new THREE.Color("#FFC6D8") },
        },
        vertexShader: /* glsl */ `
          attribute vec3 aTarget; attribute vec3 aStart; attribute float aDelay;
          uniform float uProgress; uniform float uSize;
          varying float vMix;
          void main() {
            float k = clamp((uProgress - aDelay) / 0.55, 0.0, 1.0);
            k = 1.0 - pow(1.0 - k, 3.0);
            vec3 mid = mix(aStart, aTarget, 0.5) + vec3(0.0, 1.4, 1.8) * (1.0 - abs(aDelay - 0.2));
            vec3 p = mix(mix(aStart, mid, k), mix(mid, aTarget, k), k);
            vMix = k;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uSize * (1.0 + 1.8 * (1.0 - k)) * (9.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity; uniform vec3 uColor; uniform vec3 uColor2;
          varying float vMix;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.12, d) * uOpacity;
            gl_FragColor = vec4(mix(uColor2, uColor, vMix) * 1.4, a);
          }`,
      }),
    [],
  );

  const t0 = useRef<number | null>(null);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (armed && t0.current === null) t0.current = now;
    const form = t0.current === null ? 0 : Math.min(1, (now - t0.current) / 2.4);
    const p = progress.current;
    // the flight undoes the formation: as the camera passes, the letters
    // go back to particles
    const unform = smooth(0.28, 0.6, p);
    const prog = form * (1 - unform * 0.75);
    pointsMat.uniforms.uProgress.value = prog;
    const glassIn = smooth(0.8, 1.0, form) * (1 - smooth(0.25, 0.45, p));
    pointsMat.uniforms.uOpacity.value = (1 - glassIn) * (1 - smooth(0.7, 0.95, p));
    if (points.current) points.current.visible = pointsMat.uniforms.uOpacity.value > 0.005;

    for (const m of [mat1.current, mat2.current]) {
      if (m) { m.opacity = glassIn; m.transparent = true; }
    }
    g.visible = glassIn > 0.005;

    // alive: the block breathes, each line on its own clock, and turns to
    // the pointer
    g.position.y = Math.sin(now * 0.5) * 0.05 + (1 - glassIn) * 0.2;
    g.rotation.y += (store.pointerX * 0.18 - g.rotation.y) * 0.05;
    g.rotation.x += (-store.pointerY * 0.1 - g.rotation.x) * 0.05;
    if (line1.current) { line1.current.position.y = baseline1 + Math.sin(now * 0.7) * 0.04; line1.current.rotation.z = Math.sin(now * 0.4) * 0.008; }
    if (line2.current) { line2.current.position.y = baseline2 + Math.sin(now * 0.6 + 1.5) * 0.05; line2.current.rotation.z = Math.sin(now * 0.45 + 1) * 0.01; }
    g.scale.setScalar(0.95 + 0.05 * glassIn);
  });

  const glassProps = {
    transmission: 1,
    thickness: 0.5,
    ior: 1.45,
    chromaticAberration: 0.08,
    anisotropicBlur: 0.08,
    distortion: 0.12,
    distortionScale: 0.3,
    temporalDistortion: 0.04,
    resolution: tier === "high" ? 1024 : 640,
    samples: tier === "high" ? 8 : 5,
    backside: tier === "high",
    backsideThickness: 0.3,
    envMapIntensity: 1.6,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transparent: true,
  } as const;

  return (
    <group>
      <group ref={group}>
        <mesh ref={line1} geometry={geo1} position={[offset1, baseline1, 0]} scale={scale}>
          {glass ? (
            <MeshTransmissionMaterial ref={mat1 as never} {...glassProps} roughness={0.18} color="#fff6f8" />
          ) : (
            <meshPhysicalMaterial ref={mat1 as never} color="#ffe3ea" roughness={0.18} clearcoat={1} transparent opacity={0.92} />
          )}
        </mesh>
        <mesh ref={line2} geometry={geo2} position={[offset2, baseline2, 0]} scale={scale}>
          {glass ? (
            <MeshTransmissionMaterial ref={mat2 as never} {...glassProps} roughness={0.05} color="#ff7aa6" />
          ) : (
            <meshPhysicalMaterial ref={mat2 as never} color="#FB003F" roughness={0.18} clearcoat={1} transparent opacity={0.92} />
          )}
        </mesh>
      </group>
      <points ref={points} geometry={particles} material={pointsMat} frustumCulled={false} />
    </group>
  );
}

/* ── the silk band through the room ─────────────────────────────────────── */
function Silk({ width, portrait }: { width: number; portrait: boolean }) {
  const segments = 240;
  const W = portrait ? 0.2 : 0.36;
  const curve = useMemo(
    () =>
      // on a phone the band stays behind the letters and near the edges;
      // the letters are the headline, not the ribbon
      new THREE.CatmullRomCurve3(
        portrait
          ? [
              new THREE.Vector3(-width * 1.4, 3.6, -3),
              new THREE.Vector3(-width * 0.6, 2.4, -2.2),
              new THREE.Vector3(width * 0.2, 0.4, -2.6),
              new THREE.Vector3(width * 0.8, -1.6, -2.0),
              new THREE.Vector3(width * 1.6, -3.2, -3),
            ]
          : [
              new THREE.Vector3(-width * 0.95, 3.4, -4),
              new THREE.Vector3(-width * 0.3, 2.2, -1.6),
              new THREE.Vector3(-width * 0.05, -1.4, 1.6),
              new THREE.Vector3(width * 0.3, 1.9, -0.4),
              new THREE.Vector3(width * 0.95, -2.8, -3),
            ],
        false,
        "centripetal",
      ),
    [width, portrait],
  );
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = (segments + 1) * 2;
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const uv = new Float32Array(count * 2);
    const index: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      uv[i * 4] = 0; uv[i * 4 + 1] = t; uv[i * 4 + 2] = 1; uv[i * 4 + 3] = t;
      if (i < segments) { const a = i * 2; index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(index);
    return g;
  }, []);
  const frames = useMemo(() => curve.computeFrenetFrames(segments, false), [curve]);
  const points = useMemo(() => curve.getSpacedPoints(segments), [curve]);
  const side = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const time = store.reduced ? 0 : state.clock.elapsedTime;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const px = store.pointerX * width * 0.5;
    const py = store.pointerY * 2.2;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = points[i];
      const dx = px - p.x; const dy = py - p.y;
      const d = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - d / 4) * 0.9;
      const bx = d > 0.001 ? (dx / d) * pull : 0;
      const by = d > 0.001 ? (dy / d) * pull : 0;
      const twist = Math.sin(t * 14 + time * 1.3) * 0.85 + Math.sin(t * 5 - time * 0.7) * 0.4;
      const wob = Math.sin(t * 9 + time * 0.9) * 0.1;
      side.copy(frames.binormals[i]).applyAxisAngle(frames.tangents[i], twist).multiplyScalar(W / 2);
      pos.setXYZ(i * 2, p.x + bx - side.x, p.y + by + wob - side.y, p.z - side.z);
      pos.setXYZ(i * 2 + 1, p.x + bx + side.x, p.y + by + wob + side.y, p.z + side.z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshPhysicalMaterial color="#FB003F" roughness={0.3} metalness={0} sheen={1} sheenColor="#FFB3CC" sheenRoughness={0.25} clearcoat={0.5} clearcoatRoughness={0.2} envMapIntensity={1.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── the visitor's camera: never still ──────────────────────────────────── */
function Rig({ armed, progress }: { armed: boolean; progress: MutableRefObject<number> }) {
  const { camera } = useThree();
  const t0 = useRef<number | null>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (armed && t0.current === null) t0.current = now;
    const dolly = t0.current === null ? 0 : easeOut(Math.min(1, (now - t0.current) / 3.0));
    const p = easeInOut(Math.min(1, Math.max(0, progress.current)));
    const z = CAM_FAR + (CAM_NEAR - CAM_FAR) * dolly + (CAM_END - CAM_NEAR) * p;
    // a slow drift, like a handheld operator breathing, on top of pointer parallax
    const dx = Math.sin(now * 0.23) * 0.35 + store.pointerX * 0.5;
    const dy = 0.1 + Math.sin(now * 0.31 + 1) * 0.2 + store.pointerY * 0.35;
    camera.position.z += (z - camera.position.z) * 0.1;
    camera.position.x += (dx - camera.position.x) * 0.04;
    camera.position.y += (dy - camera.position.y) * 0.04;
    look.set(Math.sin(now * 0.2) * 0.15, 0.1 + 0.5 * p, -2 - 5 * p);
    camera.lookAt(look);
  });
  return null;
}

function Room({ lines, video, aspect, armed, progress }: { lines: Lines; video: string; aspect: number; armed: boolean; progress: MutableRefObject<number> }) {
  const { size } = useThree();
  const tier: DeviceTier = store.tier;
  const ratio = size.width / size.height;
  const visH = 2 * CAM_NEAR * Math.tan((FOV * Math.PI) / 360);
  const visW = visH * ratio;
  const portrait = ratio < 0.9;
  const letterW = portrait ? visW * 0.9 : Math.min(visW * 0.72, 8.4);

  return (
    <>
      <color attach="background" args={["#0a0709"]} />
      <fog attach="fog" args={["#0a0709", 10, 26]} />

      {/* a studio built from light panels: what the glass and silk reflect */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff3e8" position={[0, 6, 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ff5c9e" position={[-8, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 10, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[8, 2, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[2, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd2b0" position={[0, 0, -9]} scale={[14, 8, 1]} />
      </Environment>

      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 7]} intensity={1.6} color="#fff1e6" />
      <directionalLight position={[-6, -2, 5]} intensity={0.8} color="#ff5c9e" />
      <spotLight position={[-2, 7, 7]} angle={0.6} penumbra={0.8} intensity={160} distance={22} decay={2} color="#fff4ea" />

      {/* no floor: it sat between the camera and the wall and cut the film
          off at the bottom of the frame. The film is the room. */}

      <Suspense fallback={null}>
        <Wall src={video} aspect={aspect} />
      </Suspense>
      <Suspense fallback={null}>
        <Letters lines={lines} tier={tier} armed={armed} progress={progress} width={letterW} />
      </Suspense>
      <Dust count={tier === "low" ? 220 : 520} />
      <Silk width={visW} portrait={portrait} />

      {/* the cinema camera, when its model is delivered */}
      {/* the rig stands on the floor line to the right, in front of the
          letters, turned a little toward them */}
      <KameraModel position={portrait ? [visW / 2 - 0.9, -3.0, -0.4] : [visW / 2 - 2.4, -2.6, 1.0]} rotation={[0, -0.7, 0]} scale={portrait ? 1.9 : 2.7} />

      <Rig armed={armed} progress={progress} />

      {tier !== "low" && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.3} intensity={0.75} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0006)} radialModulation modulationOffset={0.4} blendFunction={BlendFunction.NORMAL} />
          <Noise opacity={0.07} premultiply />
          <Vignette eskil={false} offset={0.22} darkness={0.75} />
        </EffectComposer>
      )}
    </>
  );
}

export default function Saal({ lines, video, aspect, armed, progress }: { lines: Lines; video: string; aspect: number; armed: boolean; progress: MutableRefObject<number> }) {
  const tier: DeviceTier = store.tier;
  return (
    <Canvas
      dpr={TIER_CONFIG[tier].dpr}
      camera={{ position: [0, 0.1, CAM_FAR], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <Room lines={lines} video={video} aspect={aspect} armed={armed} progress={progress} />
    </Canvas>
  );
}
