"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { scene as store } from "@/lib/scene-store";

// Loads a texture, returns it only on success (null otherwise → graceful)
function useOptionalTexture(src?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!src) return;
    let alive = true;
    new THREE.TextureLoader().load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        if (alive) setTex(t);
      },
      undefined,
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [src]);
  return tex;
}

function Panel({
  position,
  args,
  rotation,
  scrollFactor,
  image,
}: {
  position: [number, number, number];
  args: [number, number, number];
  rotation: [number, number, number];
  scrollFactor: number;
  image?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const tex = useOptionalTexture(image);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] - store.scroll * scrollFactor;
    ref.current.position.x =
      position[0] + Math.sin(state.clock.elapsedTime * 0.25 + position[0]) * 0.4;
  });
  return (
    <group ref={ref} position={position}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={1.1}>
        {/* photo behind the glass → refracted/framed by the transmission */}
        {tex && (
          <mesh position={[0, 0, -0.22]} rotation={rotation}>
            <planeGeometry args={[args[0] * 0.92, args[1] * 0.92]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        )}
        <RoundedBox args={args} radius={0.16} smoothness={4} rotation={rotation}>
          <MeshTransmissionMaterial
            samples={4}
            resolution={128}
            thickness={0.5}
            roughness={0.2}
            transmission={1}
            ior={1.2}
            chromaticAberration={0.25}
            anisotropy={0.2}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.2}
            color={"#ffffff"}
            attenuationColor={"#ffd9e4"}
            attenuationDistance={5}
          />
        </RoundedBox>
      </Float>
    </group>
  );
}

// Floating frosted-glass UI panels drifting through the depth.
export default function GlassPanels() {
  return (
    <group>
      <Panel
        position={[-5.5, 1.5, -4]}
        args={[3, 1.9, 0.2]}
        rotation={[0.1, 0.5, -0.08]}
        scrollFactor={5}
        image="/work/food-01.jpg"
      />
      <Panel
        position={[5.8, -1.5, -5]}
        args={[2.6, 3.4, 0.2]}
        rotation={[-0.05, -0.5, 0.06]}
        scrollFactor={7}
        image="/work/film-02.jpg"
      />
      <Panel
        position={[-4.5, -4, -3]}
        args={[2.4, 1.5, 0.2]}
        rotation={[0.08, 0.35, 0.05]}
        scrollFactor={4}
        image="/work/film-01.jpg"
      />
    </group>
  );
}
