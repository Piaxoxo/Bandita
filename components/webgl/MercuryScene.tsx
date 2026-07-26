"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshDistortMaterial, AdaptiveDpr } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";

/*
  BANDITA — "Pink Mercury": a living liquid-chrome world.

  A molten, iridescent mercury core breathes and warps; on scroll it sheds
  chrome droplets that fly outward and re-merge, while a cinematic camera
  dollies through the scene. A studio of coloured light-panels (pink → silver)
  gives the metal its iridescent sheen. Post: bloom, chromatic aberration,
  film grain and vignette — the whole thing reads like a perfume-ad title card.
*/

function MercuryCore({ tier }: { tier: DeviceTier }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.Material & { distort?: number }>(null);
  const detail = tier === "high" ? 28 : tier === "mid" ? 18 : 10;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = store.scroll;
    if (ref.current) {
      ref.current.rotation.y = t * 0.14 + store.pointerX * 0.5;
      ref.current.rotation.x = Math.sin(t * 0.18) * 0.12 + store.pointerY * 0.35;
      const sc = 1.55 - s * 0.35;
      ref.current.scale.setScalar(sc);
    }
    if (mat.current && "distort" in mat.current) {
      // breathe + react to scroll velocity → it "ripples" when you fling the page
      mat.current.distort =
        0.34 + Math.sin(t * 0.5) * 0.07 + Math.min(0.5, Math.abs(store.velocity) * 0.9);
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.4, detail]} />
      <MeshDistortMaterial
        ref={mat as never}
        color="#ff86ac"
        metalness={1}
        roughness={0.11}
        envMapIntensity={1.2}
        clearcoat={1}
        clearcoatRoughness={0.08}
        distort={0.36}
        speed={1.7}
      />
    </mesh>
  );
}

function Droplet({ i, n }: { i: number; n: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.sin(i * 12.9898) * 43758.5453 % 1, [i]);
  const base = 0.2 + (i % 3) * 0.08;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = store.scroll;
    const ang = (i / n) * Math.PI * 2 + t * 0.22;
    // merged near the core at top, flung outward as you scroll
    const spread = 1.7 + s * 4.6 + Math.sin(t * 0.6 + seed * 6) * 0.25;
    ref.current.position.set(
      Math.cos(ang) * spread + store.pointerX * 0.6,
      Math.sin(t * 0.5 + seed * 6) * 0.7 + s * 1.4 + Math.sin(ang * 1.3) * 0.5,
      Math.sin(ang) * spread * 0.62,
    );
    ref.current.scale.setScalar(base * (1 + Math.sin(t + seed * 6) * 0.12));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#ffa7c4" metalness={1} roughness={0.12} envMapIntensity={1.25} />
    </mesh>
  );
}

function MercuryGroup({ tier }: { tier: DeviceTier }) {
  const grp = useRef<THREE.Group>(null);
  const { size } = useThree();
  const compact = size.width < 768;
  const count = tier === "low" ? 4 : tier === "mid" ? 6 : 8;

  useFrame(() => {
    if (grp.current) {
      const targetX = compact ? 0 : 2.1;
      grp.current.position.x += (targetX - grp.current.position.x) * 0.05;
      grp.current.position.y = store.scroll * 0.8;
    }
  });

  return (
    <group ref={grp}>
      <MercuryCore tier={tier} />
      {Array.from({ length: count }, (_, i) => (
        <Droplet key={i} i={i} n={count} />
      ))}
    </group>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  useFrame((state) => {
    tickScene();
    const t = state.clock.elapsedTime;
    const s = store.scroll;
    const compact = size.width < 768;
    const baseZ = compact ? 7.6 : 6.1;
    camera.position.x += (store.pointerX * 0.8 + Math.sin(t * 0.1) * 0.25 - camera.position.x) * 0.05;
    camera.position.y += (store.pointerY * 0.5 - s * 0.5 - camera.position.y) * 0.05;
    camera.position.z += (baseZ - s * 1.7 - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
    camera.rotation.z += (Math.sin(t * 0.06) * 0.02 + store.pointerX * 0.02 - camera.rotation.z) * 0.05;
  });
  return null;
}

function CinemaFX({ tier }: { tier: DeviceTier }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0009, 0.0013), []);
  if (tier === "low") return null;
  return (
    <EffectComposer multisampling={tier === "high" ? 4 : 0}>
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.85}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={caOffset}
        radialModulation
        modulationOffset={0.35}
      />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.06} />
      <Vignette eskil={false} offset={0.2} darkness={0.72} />
    </EffectComposer>
  );
}

export default function MercuryScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 6.1], fov: 42 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#FBF4EE"]} />
      <AdaptiveDpr pixelated />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} />
      <directionalLight position={[-5, -2, 3]} intensity={0.8} color="#FF5C9E" />

      {/* studio of coloured light-panels → the metal's iridescent sheen */}
      <Environment resolution={tier === "low" ? 64 : 256} frames={1}>
        <color attach="background" args={["#efe7df"]} />
        <Lightformer intensity={2.2} position={[0, 3, 4]} scale={[9, 9, 1]} color="#ffffff" />
        <Lightformer intensity={2.6} position={[-4, -1, 2]} scale={[7, 7, 1]} color="#FF5C9E" />
        <Lightformer intensity={2.0} position={[4, 2, -2]} scale={[7, 7, 1]} color="#FFD9E4" />
        <Lightformer intensity={1.8} position={[0, -4, 2]} scale={[11, 4, 1]} color="#FB003F" />
        <Lightformer intensity={1.4} position={[3, -2, 4]} scale={[5, 5, 1]} color="#FFF3D6" />
      </Environment>

      <MercuryGroup tier={tier} />
      <CameraRig />
      <CinemaFX tier={tier} />
    </Canvas>
  );
}
