"use client";

import { useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Float, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import { audioState } from "@/lib/audio-store";

/*
  BANDITA — a floating GLASS 3D world that changes theme with every section.

  As you scroll, the drifting forms morph from abstract glass → cocktails →
  cameras → aeroplanes: recognisable glass models composed from primitives.
  Each theme fades in around its section, everything drifts constantly, parallax
  hard on scroll, reacts to pointer + the music beat. Built for the "mother of
  all 3D sites" brief.
*/

// ── materials ───────────────────────────────────────────────────────────────
function Glass({ color = "#ffd0e2" }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      transmission={1}
      thickness={0.9}
      roughness={0.09}
      ior={1.35}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.1}
      attenuationColor="#ff8fb8"
      attenuationDistance={3}
    />
  );
}
function Chrome({ color = "#ff77a6" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.9} roughness={0.28} envMapIntensity={0.9} />;
}

// ── composed glass models ────────────────────────────────────────────────────
function AbstractModel() {
  return (
    <group>
      <mesh><icosahedronGeometry args={[0.9, 4]} /><Glass /></mesh>
    </group>
  );
}
function KnotModel() {
  return (
    <mesh><torusKnotGeometry args={[0.6, 0.22, 128, 24]} /><Glass color="#ffbcd6" /></mesh>
  );
}
function CocktailModel() {
  return (
    <group>
      {/* bowl */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.6, 0.72, 40, 1, true]} />
        <Glass />
      </mesh>
      {/* stem + base */}
      <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.045, 0.045, 0.7, 16]} /><Glass /></mesh>
      <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.32, 0.34, 0.05, 32]} /><Glass /></mesh>
      {/* olive + pick */}
      <mesh position={[0.14, 0.18, 0.05]}><sphereGeometry args={[0.09, 20, 20]} /><Chrome color="#b6c94a" /></mesh>
      <mesh position={[0.14, 0.34, 0.05]} rotation={[0, 0, 0.35]}><cylinderGeometry args={[0.014, 0.014, 0.55, 8]} /><Chrome color="#ffe6c0" /></mesh>
    </group>
  );
}
function CameraModel() {
  return (
    <group rotation={[0, -0.5, 0]}>
      <mesh><boxGeometry args={[0.95, 0.6, 0.55]} /><Glass color="#ffcfe6" /></mesh>
      <mesh position={[0, 0.4, 0.05]}><boxGeometry args={[0.4, 0.2, 0.4]} /><Glass color="#ffcfe6" /></mesh>
      {/* lens */}
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.24, 0.28, 0.42, 36]} /><Glass /></mesh>
      <mesh position={[0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.22, 0.035, 20, 36]} /><Chrome /></mesh>
      {/* record light */}
      <mesh position={[-0.35, 0.18, 0.29]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#fb003f" emissive="#fb003f" emissiveIntensity={2} toneMapped={false} /></mesh>
    </group>
  );
}
function PlaneModel() {
  return (
    <group rotation={[0.2, 0, 0.15]}>
      {/* fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.09, 1.5, 28]} /><Glass color="#ffd6ea" /></mesh>
      <mesh position={[0.8, 0, 0]}><sphereGeometry args={[0.1, 20, 20]} /><Glass color="#ffd6ea" /></mesh>
      {/* wings */}
      <mesh rotation={[0, 0, 0]}><boxGeometry args={[0.4, 0.05, 1.7]} /><Glass /></mesh>
      {/* tail */}
      <mesh position={[-0.62, 0, 0]}><boxGeometry args={[0.22, 0.04, 0.6]} /><Glass /></mesh>
      <mesh position={[-0.64, 0.16, 0]}><boxGeometry args={[0.24, 0.3, 0.04]} /><Glass /></mesh>
    </group>
  );
}

const MODELS: Record<string, () => ReactNode> = {
  abstract: AbstractModel,
  knot: KnotModel,
  cocktail: CocktailModel,
  camera: CameraModel,
  plane: PlaneModel,
};

// ── themes: which models float where, and at what scroll they appear ─────────
type Item = { model: keyof typeof MODELS; pos: [number, number, number]; scale: number; seed: number };
type Theme = { center: number; items: Item[] };

const THEMES: Theme[] = [
  {
    center: 0.09,
    items: [
      { model: "abstract", pos: [4.5, 1.5, -3], scale: 1.7, seed: 0.2 },
      { model: "knot", pos: [-5, 2.2, -6], scale: 1.3, seed: 1.1 },
      { model: "abstract", pos: [-4.5, -2.5, -4], scale: 1.2, seed: 2.3 },
      { model: "knot", pos: [5.5, -2, -9], scale: 1.0, seed: 3.0 },
    ],
  },
  {
    center: 0.22,
    items: [
      { model: "cocktail", pos: [5, 1.8, -3], scale: 1.9, seed: 0.5 },
      { model: "cocktail", pos: [-5.2, 1, -6], scale: 1.5, seed: 1.7 },
      { model: "cocktail", pos: [-4, -2.6, -4], scale: 1.3, seed: 2.9 },
      { model: "knot", pos: [5.8, -2.4, -10], scale: 1.1, seed: 3.6 },
    ],
  },
  {
    center: 0.35,
    items: [
      { model: "camera", pos: [5.2, 1.6, -3], scale: 1.7, seed: 0.7 },
      { model: "camera", pos: [-5, 2, -7], scale: 1.4, seed: 1.9 },
      { model: "camera", pos: [-4.5, -2.4, -4], scale: 1.2, seed: 3.1 },
      { model: "abstract", pos: [6, -1.8, -11], scale: 1.2, seed: 4.0 },
    ],
  },
  {
    center: 0.46,
    items: [
      { model: "plane", pos: [5.5, 2, -4], scale: 1.9, seed: 0.9 },
      { model: "plane", pos: [-5.5, 1, -7], scale: 1.5, seed: 2.1 },
      { model: "plane", pos: [-4, -2.8, -5], scale: 1.3, seed: 3.3 },
      { model: "knot", pos: [5.5, -2.2, -11], scale: 1.1, seed: 4.4 },
    ],
  },
];

function FloatingModel({ item, center }: { item: Item; center: number }) {
  const ref = useRef<THREE.Group>(null);
  const depth = (item.pos[2] + 18) / 18;
  const Model = MODELS[item.model];
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const scroll = store.scroll;
    const beat = audioState.level;
    // visible around this theme's section, cross-fading to neighbours
    const active = Math.max(0, 1 - Math.abs(scroll - center) / 0.14);
    const s = item.scale * 1.55 * active * (1 + beat * 0.15); // bigger + beat
    g.visible = s > 0.002;
    if (!g.visible) return;
    g.scale.setScalar(s);
    let x = item.pos[0] + Math.cos(t * 0.32 + item.seed) * 0.8 + store.pointerX * depth * 2.6;
    let y = item.pos[1] + Math.sin(t * 0.42 + item.seed) * 1.0 + (scroll - center) * (12 + depth * 30);
    // cursor repel — the forms shy away from the pointer
    const px = store.pointerX * 7.5;
    const py = store.pointerY * 4.2;
    const dx = x - px;
    const dy = y - py;
    const dist = Math.hypot(dx, dy) + 0.001;
    const force = Math.max(0, 1 - dist / 5.5) * 3.4;
    x += (dx / dist) * force;
    y += (dy / dist) * force;
    g.position.set(x, y, item.pos[2]);
    g.rotation.x = t * (0.35 + item.seed * 0.05) + item.seed;
    g.rotation.y = t * 0.5;
  });
  return (
    <group ref={ref} position={item.pos}>
      <Float speed={1.3} rotationIntensity={0.5} floatIntensity={1.0}>
        <Model />
      </Float>
    </group>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useFrame((state) => {
    tickScene();
    const t = state.clock.elapsedTime;
    const s = store.scroll;
    const compact = size.width < 768;
    // a rollercoaster ride: the camera swoops side-to-side and dips/rises as it
    // rides the scroll, banking into every turn.
    const swoopX = Math.sin(s * Math.PI * 4) * (compact ? 1.8 : 3.6) + store.pointerX * 1.5;
    const swoopY = Math.sin(s * Math.PI * 3) * 2.2 - s * 2 + store.pointerY * 0.9;
    const swoopZ = (compact ? 12 : 10) - Math.sin(s * Math.PI * 2) * 3.2 - store.scroll * 1.5;
    camera.position.x += (swoopX - camera.position.x) * 0.06;
    camera.position.y += (swoopY - camera.position.y) * 0.06;
    camera.position.z += (swoopZ - camera.position.z) * 0.06;
    camera.lookAt(swoopX * 0.35, swoopY * 0.3, -6);
    const bank = Math.cos(s * Math.PI * 4) * 0.14 + store.pointerX * 0.03;
    camera.rotation.z += (bank - camera.rotation.z) * 0.06;
  });
  return null;
}

export default function WorldScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#FBF4EE"]} />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} />
      <directionalLight position={[-5, -2, 3]} intensity={0.6} color="#ff5c9e" />
      <Environment resolution={tier === "low" ? 64 : 256} frames={1}>
        <color attach="background" args={["#f6ede4"]} />
        <Lightformer intensity={2.6} position={[0, 3, 4]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={2.2} position={[-4, -1, 2]} scale={[7, 7, 1]} color="#ff8fb0" />
        <Lightformer intensity={2.2} position={[4, 2, -2]} scale={[8, 8, 1]} color="#ffe4ee" />
        <Lightformer intensity={1.6} position={[0, -4, 2]} scale={[10, 5, 1]} color="#ffc0d6" />
      </Environment>

      {THEMES.map((theme, ti) =>
        theme.items.map((item, ii) => <FloatingModel key={`${ti}-${ii}`} item={item} center={theme.center} />),
      )}

      <Rig />
      {tier !== "low" && (
        <EffectComposer>
          <Bloom intensity={0.45} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur radius={0.8} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
