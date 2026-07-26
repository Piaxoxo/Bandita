"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { AdaptiveDpr, MeshReflectorMaterial } from "@react-three/drei";
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
import { audioState } from "@/lib/audio-store";

/*
  BANDITA — "THE HEIST".

  A night-time museum you rob by scrolling: the camera dollies down a dark
  gallery past spotlit, framed masterpieces (the studio's own work) hung on the
  walls, a glossy reflective floor beneath, dust drifting in the light shafts
  and red alarm lasers pulsing to the soundtrack. Built to feel like moving
  through a heist film, not scrolling a page.
*/

const ARTWORKS = [
  "/work/film-01.jpg",
  "/work/bar-01.jpg",
  "/work/film-02.jpg",
  "/work/guests-01.jpg",
  "/work/film-01.jpg",
  "/work/bar-01.jpg",
];
const SPACING = 9;
const START_Z = 2;
const DEPTH = ARTWORKS.length * SPACING + 12;

function Artwork({ url, x, z, faceRight }: { url: string; x: number; z: number; faceRight: boolean }) {
  const tex = useLoader(THREE.TextureLoader, url);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  // toe the canvases in toward the aisle so the camera passes them near face-on
  const rotY = faceRight ? Math.PI / 2 - 0.62 : -Math.PI / 2 + 0.62;
  return (
    <group position={[x, 0.3, z]} rotation={[0, rotY, 0]}>
      {/* gilded frame */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[6.0, 4.0]} />
        <meshBasicMaterial color="#d8ac5e" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[5.6, 3.6]} />
        <meshBasicMaterial color="#0a0608" />
      </mesh>
      {/* the "masterpiece" — unlit so it reads as spotlit against the dark */}
      <mesh>
        <planeGeometry args={[5.4, 3.4]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Beam({ x, z }: { x: number; z: number }) {
  // a soft vertical light shaft grazing the artwork
  return (
    <mesh position={[x * 0.86, 1.4, z]}>
      <coneGeometry args={[1.5, 7, 32, 1, true]} />
      <meshBasicMaterial
        color="#ffe6bf"
        transparent
        opacity={0.03}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Lasers({ tier }: { tier: DeviceTier }) {
  const group = useRef<THREE.Group>(null);
  const bars = tier === "low" ? 4 : 8;
  const defs = useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => ({
        z: START_Z - 6 - i * (DEPTH / bars),
        y: -2 + ((i * 1.7) % 4),
        rot: (i % 2 ? 1 : -1) * (0.3 + (i % 3) * 0.15),
        seed: i * 1.7,
      })),
    [bars],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current?.children.forEach((m, i) => {
      const mesh = m as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const flick = 0.5 + Math.sin(t * 6 + defs[i].seed) * 0.2 + audioState.level * 1.2;
      mat.opacity = Math.min(1, Math.max(0.15, flick));
    });
  });
  return (
    <group ref={group}>
      {defs.map((d, i) => (
        <mesh key={i} position={[0, d.y, d.z]} rotation={[0, 0, Math.PI / 2 + d.rot]}>
          <cylinderGeometry args={[0.012, 0.012, 15, 6]} />
          <meshBasicMaterial color="#ff003f" transparent toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 700;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 16;
      a[i * 3 + 1] = -4 + Math.random() * 9;
      a[i * 3 + 2] = START_Z + 4 - Math.random() * (DEPTH + 8);
    }
    return a;
  }, []);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#ffdca8" transparent opacity={0.55} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Gallery({ tier }: { tier: DeviceTier }) {
  const items = ARTWORKS.map((url, i) => {
    const faceRight = i % 2 === 0; // even → left wall faces right
    const x = faceRight ? -6.4 : 6.4;
    const z = START_Z - 6 - i * SPACING;
    return { url, x, z, faceRight, key: i };
  });

  return (
    <>
      {/* glossy museum floor that mirrors the spotlit art */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, START_Z - DEPTH / 2]}>
        <planeGeometry args={[40, DEPTH + 40]} />
        <MeshReflectorMaterial
          mirror={0.6}
          resolution={tier === "high" ? 512 : 256}
          blur={[300, 120]}
          mixBlur={1.1}
          mixStrength={28}
          roughness={0.7}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0a0608"
          metalness={0.7}
        />
      </mesh>
      {/* side walls sinking into fog */}
      <mesh position={[-7.4, 1, START_Z - DEPTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH + 40, 16]} />
        <meshBasicMaterial color="#0c0709" />
      </mesh>
      <mesh position={[7.4, 1, START_Z - DEPTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH + 40, 16]} />
        <meshBasicMaterial color="#0c0709" />
      </mesh>

      {items.map((it) => (
        <group key={it.key}>
          <Artwork url={it.url} x={it.x} z={it.z} faceRight={it.faceRight} />
          <Beam x={it.x} z={it.z} />
        </group>
      ))}
      <Dust />
      <Lasers tier={tier} />
    </>
  );
}

function Rig() {
  const { camera } = useThree();
  useFrame((state) => {
    tickScene();
    const t = state.clock.elapsedTime;
    const s = store.scroll;
    const beat = audioState.level;
    const targetZ = START_Z - s * DEPTH;
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.position.x += (store.pointerX * 1.4 - camera.position.x) * 0.05;
    camera.position.y += (store.pointerY * 0.7 + 0.3 + beat * 0.15 - camera.position.y) * 0.05;
    camera.lookAt(store.pointerX * 0.6, 0, camera.position.z - 10);
    camera.rotation.z += (Math.sin(t * 0.08) * 0.02 + store.pointerX * 0.02 - camera.rotation.z) * 0.05;
  });
  return null;
}

function HeistFX({ tier }: { tier: DeviceTier }) {
  const ca = useMemo(() => new THREE.Vector2(0.0008, 0.0012), []);
  if (tier === "low") return null;
  return (
    <EffectComposer multisampling={tier === "high" ? 2 : 0}>
      <Bloom intensity={0.9} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.85} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={ca} radialModulation modulationOffset={0.4} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.08} />
      <Vignette eskil={false} offset={0.15} darkness={0.95} />
    </EffectComposer>
  );
}

export default function HeistScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];
  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0.3, START_Z], fov: 62 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#070406"]} />
      <fogExp2 attach="fog" args={["#070406", 0.03]} />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.15} />
      <Suspense fallback={null}>
        <Gallery tier={tier} />
      </Suspense>
      <Rig />
      <HeistFX tier={tier} />
    </Canvas>
  );
}
