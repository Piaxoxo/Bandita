"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { scene as store, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import KinoKamera from "./KinoKamera";

/*
  The hall.

  A dark room. At the back, a screen with the agency's film on it. In front
  of it, the cover line set as glass letters that bend the film behind them.
  To the right, the cinema camera in pink lacquer. The silk band winds through
  all of it. The visitor's camera starts far back, dollies in after the
  intro, and scroll drives it on: past the letters, toward the screen, until
  the screen fills the frame and the next chapter's paper slides over it.

  The letters are not typed in. After the intro, particles gather on their
  surfaces and the glass fades in beneath them; the particles let go.

  Cost: one transmission material (the letters) renders the scene behind it
  to a buffer once per frame. The band is silk, not glass, so there is only
  that one extra pass. Low-tier devices get translucent lacquer letters and
  no refraction.
*/

const CAM_FAR = 14;
const CAM_NEAR = 7;
const CAM_END = -3.2;
const FOV = 35;
const TAU = Math.PI * 2;

type Lines = { line1: string; line2: string };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ── the screen at the back ─────────────────────────────────────────────── */
function Screen({ src, aspect, x, onTexture }: { src: string; aspect: number; x: number; onTexture: (t: THREE.Texture) => void }) {
  const texture = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  useEffect(() => onTexture(texture), [texture, onTexture]);
  const h = 8.6;
  const w = Math.min(h * aspect, 12);
  return (
    // behind the letters, so the glass has the film to bend, not the dark
    <group position={[x, 0.7, -6.5]}>
      {/* the wall behind, a shade lighter than the room so the screen has an edge */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[w + 0.5, h + 0.5]} />
        <meshStandardMaterial color="#1c1419" roughness={1} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* the film lights the room */}
      <pointLight position={[0, 0, 1.5]} intensity={28} distance={14} decay={2} color="#ffd2b0" />
    </group>
  );
}

/* ── the letters, and the particles that form them ──────────────────────── */
function Letters({
  lines,
  tier,
  armed,
  progress,
  width,
  left,
}: {
  lines: Lines;
  tier: DeviceTier;
  armed: boolean;
  progress: MutableRefObject<number>;
  /** target width of the longer line, world units at z=0 */
  width: number;
  /** x of the left edge */
  left: number;
}) {
  const upright = useLoader(FontLoader, "/fonts/bodoni-500.typeface.json") as Font;
  const italic = useLoader(FontLoader, "/fonts/bodoni-500i.typeface.json") as Font;
  const group = useRef<THREE.Group>(null);
  const mat1 = useRef<THREE.Material>(null);
  const mat2 = useRef<THREE.Material>(null);
  const points = useRef<THREE.Points>(null);
  const glass = tier !== "low";

  const { geo1, geo2, scale, baseline1, baseline2, particles } = useMemo(() => {
    const make = (text: string, font: Font) =>
      new TextGeometry(text, {
        font,
        size: 1,
        depth: 0.22,
        curveSegments: tier === "high" ? 8 : 5,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.012,
        bevelSegments: 2,
      });
    const g1 = make(lines.line1, upright);
    const g2 = make(lines.line2, italic);
    g1.computeBoundingBox();
    g2.computeBoundingBox();
    const w1 = g1.boundingBox!.max.x - g1.boundingBox!.min.x;
    const w2 = g2.boundingBox!.max.x - g2.boundingBox!.min.x;
    const s = width / Math.max(w1, w2);
    // two lines, tight leading, the block centred a little below the middle
    const b1 = 0.16 * s + 0.1;
    const b2 = b1 - 1.0 * s;
    g1.translate(-g1.boundingBox!.min.x, 0, 0);
    g2.translate(-g2.boundingBox!.min.x, 0, 0);

    // particles: points on the letter surfaces, in the group's local space
    const count = TIER_CONFIG[tier].intro * 1.6;
    const target = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const delay = new Float32Array(count);
    const sample = (geo: THREE.BufferGeometry, baseline: number, from: number, to: number) => {
      const mesh = new THREE.Mesh(geo);
      const sampler = new MeshSurfaceSampler(mesh).build();
      const p = new THREE.Vector3();
      for (let i = from; i < to; i++) {
        sampler.sample(p);
        target[i * 3] = p.x * s;
        target[i * 3 + 1] = p.y * s + baseline;
        target[i * 3 + 2] = p.z * s;
        // scattered in a wide shell in front of and around the letters
        const a = Math.random() * TAU;
        const el = (Math.random() - 0.5) * Math.PI;
        const r = 4 + Math.random() * 6;
        start[i * 3] = width / 2 + Math.cos(a) * Math.cos(el) * r;
        start[i * 3 + 1] = Math.sin(el) * r * 0.6;
        start[i * 3 + 2] = 2 + Math.sin(a) * Math.cos(el) * r;
        delay[i] = Math.random() * 0.45;
      }
    };
    const half = Math.floor(count * (w1 / (w1 + w2)));
    sample(g1, b1, 0, half);
    sample(g2, b2, half, count);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(target.slice(), 3));
    pg.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    pg.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    pg.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
    return { geo1: g1, geo2: g2, scale: s, baseline1: b1, baseline2: b2, particles: pg };
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
          uSize: { value: 2.6 },
          uColor: { value: new THREE.Color("#FB003F") },
          uColor2: { value: new THREE.Color("#FFB3CC") },
        },
        vertexShader: /* glsl */ `
          attribute vec3 aTarget; attribute vec3 aStart; attribute float aDelay;
          uniform float uProgress; uniform float uSize;
          varying float vMix;
          void main() {
            float k = clamp((uProgress - aDelay) / 0.55, 0.0, 1.0);
            k = 1.0 - pow(1.0 - k, 3.0);
            // a curve on the way in, so the swarm arcs instead of beelining
            vec3 mid = mix(aStart, aTarget, 0.5) + vec3(0.0, 1.2, 1.5) * (1.0 - abs(aDelay - 0.2));
            vec3 p = mix(mix(aStart, mid, k), mix(mid, aTarget, k), k);
            vMix = k;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uSize * (1.0 + 1.6 * (1.0 - k)) * (9.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity; uniform vec3 uColor; uniform vec3 uColor2;
          varying float vMix;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.15, d) * uOpacity;
            gl_FragColor = vec4(mix(uColor2, uColor, vMix), a);
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
    // formation: 0 → 1 over ~2.2s once armed
    const form = t0.current === null ? 0 : Math.min(1, (now - t0.current) / 2.2);
    pointsMat.uniforms.uProgress.value = form;
    const glassIn = smooth(0.78, 1.0, form);
    pointsMat.uniforms.uOpacity.value = 1 - glassIn;
    if (points.current) points.current.visible = glassIn < 0.999;

    // scroll: the visitor's camera passes the letters; they fade as it does
    const p = progress.current;
    const fade = 1 - smooth(0.3, 0.62, p);
    const op = glassIn * fade;
    for (const m of [mat1.current, mat2.current]) {
      if (m) { m.opacity = op; m.transparent = true; }
    }
    g.visible = op > 0.005;

    // alive: a slow bob, and the block turns toward the pointer
    g.position.y = Math.sin(now * 0.6) * 0.04 + (1 - glassIn) * 0.15;
    g.rotation.y += (store.pointerX * 0.14 - g.rotation.y) * 0.05;
    g.rotation.x += (-store.pointerY * 0.08 - g.rotation.x) * 0.05;
    const sc = 0.96 + 0.04 * glassIn;
    g.scale.setScalar(sc);
  });

  const glassProps = {
    transmission: 1,
    thickness: 0.45,
    roughness: 0.1,
    ior: 1.38,
    chromaticAberration: 0.06,
    anisotropicBlur: 0.1,
    distortion: 0.15,
    distortionScale: 0.3,
    temporalDistortion: 0.05,
    resolution: tier === "high" ? 768 : 512,
    samples: tier === "high" ? 6 : 4,
    transparent: true,
  } as const;

  return (
    <group position={[left, 0, 0]}>
      <group ref={group}>
        <mesh geometry={geo1} position={[0, baseline1, 0]} scale={scale}>
          {glass ? (
            // a faint inner glow, so the glass keeps an edge where the room
            // behind it is dark
            <MeshTransmissionMaterial ref={mat1 as never} {...glassProps} roughness={0.24} color="#fff4f6" emissive="#4a3d42" emissiveIntensity={0.7} />
          ) : (
            <meshPhysicalMaterial ref={mat1 as never} color="#ffd9e4" roughness={0.2} clearcoat={0.9} transparent opacity={0.9} />
          )}
        </mesh>
        <mesh geometry={geo2} position={[0, baseline2, 0]} scale={scale}>
          {glass ? (
            <MeshTransmissionMaterial ref={mat2 as never} {...glassProps} color="#ff8db3" emissive="#5a0018" emissiveIntensity={0.6} />
          ) : (
            <meshPhysicalMaterial ref={mat2 as never} color="#FB003F" roughness={0.2} clearcoat={0.9} transparent opacity={0.9} />
          )}
        </mesh>
      </group>
      <points ref={points} geometry={particles} material={pointsMat} frustumCulled={false} />
    </group>
  );
}

/* ── the silk band through the room ─────────────────────────────────────── */
function Silk({ width }: { width: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const segments = 220;
  const W = 0.34;
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-width * 0.9, 3.2, -3.5),
          new THREE.Vector3(-width * 0.25, 1.7, -1.2),
          new THREE.Vector3(width * 0.1, -0.6, 1.4),
          new THREE.Vector3(width * 0.38, 1.6, -0.6),
          new THREE.Vector3(width * 0.95, -2.6, -2.5),
        ],
        false,
        "centripetal",
      ),
    [width],
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
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = points[i];
      const twist = Math.sin(t * 14 + time * 1.1) * 0.8 + Math.sin(t * 5 - time * 0.6) * 0.4;
      const wob = Math.sin(t * 9 + time * 0.7) * 0.08;
      side.copy(frames.binormals[i]).applyAxisAngle(frames.tangents[i], twist).multiplyScalar(W / 2);
      pos.setXYZ(i * 2, p.x - side.x, p.y + wob - side.y, p.z - side.z);
      pos.setXYZ(i * 2 + 1, p.x + side.x, p.y + wob + side.y, p.z + side.z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geometry} frustumCulled={false}>
      <meshPhysicalMaterial color="#FB003F" roughness={0.38} metalness={0} sheen={1} sheenColor="#FFB3CC" sheenRoughness={0.3} clearcoat={0.35} clearcoatRoughness={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── the visitor's camera ───────────────────────────────────────────────── */
function Rig({ armed, progress }: { armed: boolean; progress: MutableRefObject<number> }) {
  const { camera } = useThree();
  const t0 = useRef<number | null>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (armed && t0.current === null) t0.current = now;
    const dolly = t0.current === null ? 0 : easeOut(Math.min(1, (now - t0.current) / 2.6));
    const p = easeInOut(Math.min(1, Math.max(0, progress.current)));
    const z = CAM_FAR + (CAM_NEAR - CAM_FAR) * dolly + (CAM_END - CAM_NEAR) * p;
    camera.position.z += (z - camera.position.z) * 0.12;
    camera.position.x += (store.pointerX * 0.45 - camera.position.x) * 0.05;
    camera.position.y += (0.1 + store.pointerY * 0.3 - camera.position.y) * 0.05;
    // the gaze drifts from the letters to the screen as the camera moves
    look.set(0.2 * (1 - p), 0.2 + 0.7 * p, -2 - 4 * p);
    camera.lookAt(look);
  });
  return null;
}

function Room({
  lines,
  video,
  aspect,
  armed,
  progress,
}: {
  lines: Lines;
  video: string;
  aspect: number;
  armed: boolean;
  progress: MutableRefObject<number>;
}) {
  const { size } = useThree();
  const [film, setFilm] = useState<THREE.Texture | null>(null);
  const tier: DeviceTier = store.tier;
  const ratio = size.width / size.height;
  // visible width at z=0 once the dolly has arrived
  const visH = 2 * CAM_NEAR * Math.tan((FOV * Math.PI) / 360);
  const visW = visH * ratio;
  const portrait = ratio < 0.9;
  const letterW = portrait ? visW * 0.86 : Math.min(visW * 0.56, 6.2);
  const left = -visW / 2 + (portrait ? visW * 0.07 : 0.55);

  return (
    <>
      <color attach="background" args={["#0e0a0d"]} />
      <fog attach="fog" args={["#0e0a0d", 9, 24]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 7]} intensity={2.2} color="#fff1e6" />
      <directionalLight position={[-6, -2, 5]} intensity={0.9} color="#ff5c9e" />
      <directionalLight position={[0, 3, -8]} intensity={1.4} color="#ffffff" />
      {/* a spot from the front on the letters: the highlights on the bevels
          are what make glass read as glass */}
      <spotLight position={[-3, 6, 7]} angle={0.55} penumbra={0.7} intensity={140} distance={20} decay={2} color="#fff4ea" />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -2]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#110c0f" roughness={0.95} />
      </mesh>

      <Suspense fallback={null}>
        <Screen src={video} aspect={aspect} x={portrait ? 0 : -0.3} onTexture={setFilm} />
      </Suspense>
      <Suspense fallback={null}>
        <Letters lines={lines} tier={tier} armed={armed} progress={progress} width={letterW} left={left} />
      </Suspense>
      {/* on phones the camera stands low and right, behind the letters,
          clear of the masthead */}
      <KinoKamera
        film={film}
        position={portrait ? [visW / 2 + 0.2, -1.0, -2.6] : [visW / 2 - 1.8, -0.4, 0.4]}
        rotation={[0, portrait ? -1.0 : -0.75, 0]}
        scale={portrait ? 0.5 : 0.92}
      />
      <Silk width={visW} />
      <Rig armed={armed} progress={progress} />
    </>
  );
}

export default function Saal({
  lines,
  video,
  aspect,
  armed,
  progress,
}: {
  lines: Lines;
  video: string;
  aspect: number;
  /** true once the intro has lifted; starts the dolly and the formation */
  armed: boolean;
  /** 0..1 scroll through the pinned cover */
  progress: MutableRefObject<number>;
}) {
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
