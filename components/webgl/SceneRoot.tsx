"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";
import ParticleField from "./ParticleField";
import LightShafts from "./LightShafts";
import Caustics from "./Caustics";
import GlassPanels from "./GlassPanels";
import PostFX from "./PostFX";

const BRIGHT_TOP = new THREE.Color("#FFF6EC");
const BRIGHT_BOT = new THREE.Color("#FCD9E2");
const DARK_TOP = new THREE.Color("#3A1E2C");
const DARK_BOT = new THREE.Color("#140C12");
const FOG_BRIGHT = new THREE.Color("#FBE6E6");
const FOG_DARK = new THREE.Color("#1E1018");

// "dark" amount as a function of scroll — a deep cinematic dip around the
// capabilities section, bright everywhere else.
function darkAt(s: number) {
  return Math.exp(-Math.pow((s - 0.46) / 0.13, 2));
}

const bgVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const bgFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 uTop;
  uniform vec3 uBottom;
  void main() {
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function SceneBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { scene: three } = useThree();
  const uniforms = useMemo(
    () => ({
      uTop: { value: BRIGHT_TOP.clone() },
      uBottom: { value: BRIGHT_BOT.clone() },
    }),
    [],
  );
  useFrame(() => {
    const dark = darkAt(store.scroll);
    store.dark = dark;
    const u = matRef.current?.uniforms;
    if (u) {
      u.uTop.value.copy(BRIGHT_TOP).lerp(DARK_TOP, dark);
      u.uBottom.value.copy(BRIGHT_BOT).lerp(DARK_BOT, dark);
    }
    if (three.fog) {
      (three.fog as THREE.FogExp2).color.copy(FOG_BRIGHT).lerp(FOG_DARK, dark);
    }
  });
  return (
    <mesh position={[0, 0, -30]} scale={[160, 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={bgVert}
        fragmentShader={bgFrag}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

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
            thickness={0.85}
            roughness={0.12}
            transmission={1}
            ior={1.28}
            chromaticAberration={0.4}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.35}
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
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + store.scroll * 6;
    // gentle independent drift so nothing is ever static
    ref.current.position.x =
      position[0] + Math.sin(state.clock.elapsedTime * 0.3 + position[1]) * 0.5;
  });
  return (
    <group ref={ref} position={position}>
      <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.4}>
        <mesh scale={scale * k}>
          <sphereGeometry args={[1, 48, 48]} />
          <MeshDistortMaterial
            color={color}
            distort={0.5}
            speed={2}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Cinematic, never-static camera: scroll dolly + idle drift + subtle bank.
function CameraRig() {
  const { camera, size } = useThree();
  useFrame((state) => {
    tickScene();
    const t = state.clock.elapsedTime;
    const compact = size.width < 768;
    const baseZ = compact ? 13 : 9;
    const driftX = Math.sin(t * 0.11) * 0.5;
    const driftY = Math.cos(t * 0.14) * 0.35;
    const targetX = store.pointerX * 1.5 + driftX;
    const targetY = store.pointerY * 0.9 + store.scroll * 1.6 + driftY;
    const targetZ = baseZ - store.scroll * 3.2;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, store.scroll * 1.4, 0);
    // subtle cinematic bank
    camera.rotation.z += (Math.sin(t * 0.08) * 0.025 + store.pointerX * 0.03 - camera.rotation.z) * 0.05;
  });
  return null;
}

export default function SceneRoot() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];
  const layered = tier !== "low";

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <AdaptiveDpr pixelated />
      <fogExp2 attach="fog" args={["#FBE6E6", 0.016]} />

      <SceneBackground />

      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} />
      <pointLight position={[-6, -2, 2]} intensity={45} color="#FB003F" />
      <pointLight position={[6, 3, -2]} intensity={28} color="#5FC9BC" />

      <Caustics />
      {layered && <LightShafts />}

      {/* layered particle depth */}
      {layered && <ParticleField count={Math.round(cfg.field * 0.5)} layer="far" />}
      <ParticleField count={cfg.field} layer="mid" />
      {layered && <ParticleField count={Math.round(cfg.field * 0.35)} layer="near" />}

      <GlassOrb tier={tier} />
      {tier === "high" && <GlassPanels />}
      <Blob position={[-3.4, -1.2, -2]} color="#FF5C9E" scale={1.1} speed={1.3} />
      <Blob position={[-1.6, 2.4, -3]} color="#FFC23D" scale={0.6} speed={1.7} />
      <Blob position={[3.8, -2.4, -2.5]} color="#5FC9BC" scale={0.7} speed={1.5} />

      <CameraRig />
      <PostFX tier={tier} />
    </Canvas>
  );
}
