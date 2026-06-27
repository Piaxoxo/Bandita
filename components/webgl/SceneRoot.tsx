"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  GradientTexture,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import ParticleField from "./ParticleField";

/* Soft glow behind the orb — gives the glass something light to refract */
function OrbBackdrop() {
  const { size } = useThree();
  const compact = size.width < 768;
  return (
    <mesh position={[2.6, 0.3, -6]} scale={[16, 12, 1]}>
      <planeGeometry />
      <meshBasicMaterial toneMapped={false} transparent opacity={compact ? 0.5 : 0.9}>
        <GradientTexture
          stops={[0, 0.5, 1]}
          colors={["#FFE3D6", "#FFC9DA", "#FF8FB0"]}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

/* Frosted glass orb — the hero focal point. Drifts up and away on scroll. */
function GlassOrb({ tier }: { tier: DeviceTier }) {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();
  const compact = size.width < 768;
  useFrame((state) => {
    if (!ref.current) return;
    const s = store.scroll;
    ref.current.position.y = 0.2 + s * 9;
    ref.current.position.x = (compact ? 3.2 : 2.4) + s * 2;
    const sc = Math.max(0.001, (compact ? 1.1 : 1.7) - s * 1.6);
    ref.current.scale.setScalar(sc);
    ref.current.rotation.y = state.clock.elapsedTime * 0.14;
  });
  return (
    <group ref={ref} position={[2.4, 0.2, 0]}>
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1, tier === "low" ? 3 : 6]} />
          <MeshTransmissionMaterial
            samples={tier === "low" ? 2 : 6}
            resolution={tier === "low" ? 128 : 256}
            thickness={0.8}
            roughness={0.12}
            transmission={1}
            ior={1.25}
            chromaticAberration={0.3}
            anisotropy={0.2}
            distortion={0.3}
            distortionScale={0.4}
            temporalDistortion={0.2}
            color={"#ffffff"}
            attenuationColor={"#ffe1ea"}
            attenuationDistance={3}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Blob({
  position,
  color,
  scale,
  speed,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();
  const k = size.width < 768 ? 0.6 : 1;
  useFrame(() => {
    if (ref.current) ref.current.position.y = position[1] + store.scroll * 6;
  });
  return (
    <group ref={ref} position={position}>
      <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh scale={scale * k}>
          <sphereGeometry args={[1, 48, 48]} />
          <MeshDistortMaterial
            color={color}
            distort={0.42}
            speed={1.6}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
}

/* Scroll- and pointer-driven camera dolly */
function CameraRig() {
  const { camera, size } = useThree();
  useFrame(() => {
    tickScene();
    // pull back on compact screens so the scene never crowds the content
    const baseZ = size.width < 768 ? 13 : 9;
    const targetX = store.pointerX * 1.2;
    const targetY = store.pointerY * 0.8 + store.scroll * 1.5;
    const targetZ = baseZ - store.scroll * 2.2;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, store.scroll * 1.2, 0);
  });
  return null;
}

export default function SceneRoot() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
    >
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} />
      <pointLight position={[-6, -2, 2]} intensity={40} color="#FB003F" />
      <pointLight position={[6, 3, -2]} intensity={25} color="#5FC9BC" />

      <OrbBackdrop />
      <ParticleField count={cfg.field} />
      <GlassOrb tier={tier} />
      <Blob position={[-3.4, -1.2, -2]} color="#FF5C9E" scale={1.1} speed={1.3} />
      <Blob position={[-1.6, 2.4, -3]} color="#FFC23D" scale={0.6} speed={1.7} />
      <Blob position={[3.8, -2.4, -2.5]} color="#5FC9BC" scale={0.7} speed={1.5} />

      <CameraRig />
    </Canvas>
  );
}
