"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  GradientTexture,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";

const PINK = new THREE.Color("#FB003F");
const ROSE = new THREE.Color("#FF5C9E");
const CORAL = new THREE.Color("#FF8A5B");
const TEAL = new THREE.Color("#5FC9BC");
const GELB = new THREE.Color("#FFC23D");

/* Drifting particle field that gently follows the pointer */
function Particles({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [PINK, ROSE, CORAL, TEAL, GELB];
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    const { x, y } = state.pointer;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      y * 0.12,
      0.04,
    );
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      x * 0.6,
      0.04,
    );
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Soft brand-toned gradient backdrop — gives the glass something light to
   refract (so it reads as frosted, not black) and adds atmosphere */
function Backdrop() {
  return (
    <mesh position={[0, 0, -12]} scale={[70, 45, 1]}>
      <planeGeometry />
      <meshBasicMaterial toneMapped={false}>
        <GradientTexture
          stops={[0, 0.45, 0.8, 1]}
          colors={["#FCF6EC", "#FFE3D6", "#FFC9DA", "#FF8FB0"]}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

/* Frosted glass orb — the hero's centerpiece */
function GlassOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    ref.current.rotation.z = state.clock.elapsedTime * 0.05;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref} position={[2.4, 0.2, 0]} scale={1.7}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshTransmissionMaterial
          samples={6}
          resolution={256}
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
  );
}

/* Soft coloured blobs floating in the depth */
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
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={0.42}
          speed={1.6}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

/* Camera parallax driven by pointer */
function CameraRig() {
  const { camera } = useThree();
  useFrame((state) => {
    const { x, y } = state.pointer;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x * 1.1, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y * 0.7, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.7]}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} color="#fff" />
      <pointLight position={[-6, -2, 2]} intensity={40} color="#FB003F" />
      <pointLight position={[6, 3, -2]} intensity={25} color="#5FC9BC" />

      <Backdrop />
      <Particles />
      <GlassOrb />
      <Blob position={[-3.2, -1.2, -2]} color="#FF5C9E" scale={1.1} speed={1.3} />
      <Blob position={[-1.6, 2.2, -3]} color="#FFC23D" scale={0.6} speed={1.7} />
      <Blob position={[3.6, -2.2, -2.5]} color="#5FC9BC" scale={0.7} speed={1.5} />

      <CameraRig />
    </Canvas>
  );
}
