"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  Float,
  AdaptiveDpr,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import { audioState } from "@/lib/audio-store";

/*
  BANDITA — a floating glass 3D world.

  A depth-field of glossy pink glass and chrome forms drifting in space over the
  cream page. They never stop moving (idle drift + spin) and parallax hard on
  scroll — nearer forms race, deep ones crawl — so the page always feels alive
  and three-dimensional behind the content.
*/

type Shape = {
  kind: "glass" | "chrome" | "blob";
  geo: "ico" | "torus" | "sphere" | "knot";
  pos: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  seed: number;
};

const SHAPES: Shape[] = [
  { kind: "glass", geo: "ico", pos: [4.5, 1.5, -3], scale: 1.7, color: "#ffd3e2", speed: 1.1, seed: 0.2 },
  { kind: "chrome", geo: "torus", pos: [-5, 2.5, -6], scale: 1.3, color: "#ff6fa0", speed: 1.4, seed: 1.1 },
  { kind: "glass", geo: "sphere", pos: [-4, -2.5, -4], scale: 1.2, color: "#ffe0ea", speed: 1.0, seed: 2.3 },
  { kind: "chrome", geo: "knot", pos: [5.5, -2, -9], scale: 0.9, color: "#ff9bbd", speed: 1.6, seed: 3.0 },
  { kind: "blob", geo: "sphere", pos: [0, 3.5, -12], scale: 2.0, color: "#ffc2d6", speed: 0.8, seed: 4.2 },
  { kind: "glass", geo: "ico", pos: [-6.5, 0.5, -14], scale: 1.6, color: "#ffd8e6", speed: 0.7, seed: 5.1 },
  { kind: "chrome", geo: "sphere", pos: [6.5, 3, -16], scale: 1.1, color: "#ff87b0", speed: 0.9, seed: 6.4 },
  { kind: "blob", geo: "sphere", pos: [2, -4, -18], scale: 2.4, color: "#ffb3cc", speed: 0.6, seed: 7.7 },
];

function Geo({ geo }: { geo: Shape["geo"] }) {
  if (geo === "ico") return <icosahedronGeometry args={[1, 6]} />;
  if (geo === "torus") return <torusGeometry args={[1, 0.36, 32, 96]} />;
  if (geo === "knot") return <torusKnotGeometry args={[0.8, 0.28, 128, 24]} />;
  return <sphereGeometry args={[1, 64, 64]} />;
}

function FloatingShape({ s, tier }: { s: Shape; tier: DeviceTier }) {
  const ref = useRef<THREE.Group>(null);
  const depth = (s.pos[2] + 20) / 20; // 1 near .. 0 deep
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const scroll = store.scroll;
    const beat = audioState.level;
    // always-moving idle drift + a hard scroll parallax scaled by depth
    ref.current.position.y =
      s.pos[1] + Math.sin(t * 0.3 * s.speed + s.seed) * 0.6 + scroll * (4 + depth * 22);
    ref.current.position.x =
      s.pos[0] + Math.cos(t * 0.25 * s.speed + s.seed) * 0.5 + store.pointerX * depth * 2.2;
    ref.current.rotation.x = t * 0.12 * s.speed + s.seed;
    ref.current.rotation.y = t * 0.16 * s.speed;
    const sc = s.scale * (1 + beat * 0.12);
    ref.current.scale.setScalar(sc);
  });

  return (
    <group ref={ref} position={s.pos}>
      <Float speed={s.speed} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh>
          <Geo geo={s.geo} />
          {s.kind === "glass" ? (
            <MeshTransmissionMaterial
              samples={tier === "high" ? 6 : 3}
              resolution={tier === "high" ? 256 : 128}
              thickness={0.9}
              roughness={0.08}
              transmission={1}
              ior={1.3}
              chromaticAberration={0.5}
              anisotropy={0.3}
              distortion={0.3}
              distortionScale={0.4}
              temporalDistortion={0.2}
              color={s.color}
              attenuationColor={"#ff9bc0"}
              attenuationDistance={2.5}
            />
          ) : s.kind === "chrome" ? (
            <meshStandardMaterial color={s.color} metalness={0.85} roughness={0.4} envMapIntensity={0.8} />
          ) : (
            <MeshDistortMaterial color={s.color} distort={0.4} speed={2} roughness={0.25} metalness={0.2} />
          )}
        </mesh>
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
    camera.position.x += (store.pointerX * 1.2 + Math.sin(t * 0.1) * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (store.pointerY * 0.8 - s * 1.5 - camera.position.y) * 0.05;
    camera.position.z += ((compact ? 12 : 10) - s * 2.5 - camera.position.z) * 0.05;
    camera.lookAt(0, 0, -6);
    camera.rotation.z += (Math.sin(t * 0.06) * 0.02 + store.pointerX * 0.02 - camera.rotation.z) * 0.05;
  });
  return null;
}

export default function WorldScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];
  const shapes = tier === "low" ? SHAPES.filter((_, i) => i % 2 === 0) : SHAPES;

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#FBF4EE"]} />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} />
      <directionalLight position={[-5, -2, 3]} intensity={0.6} color="#ff5c9e" />
      <Environment resolution={tier === "low" ? 64 : 256} frames={1}>
        <color attach="background" args={["#f6ede4"]} />
        <Lightformer intensity={2.6} position={[0, 3, 4]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={2.2} position={[-4, -1, 2]} scale={[7, 7, 1]} color="#ff8fb0" />
        <Lightformer intensity={2.2} position={[4, 2, -2]} scale={[8, 8, 1]} color="#ffe4ee" />
        <Lightformer intensity={1.6} position={[0, -4, 2]} scale={[10, 5, 1]} color="#ffc0d6" />
      </Environment>
      {shapes.map((s, i) => (
        <FloatingShape key={i} s={s} tier={tier} />
      ))}
      <Rig />
      {tier !== "low" && (
        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur radius={0.8} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
