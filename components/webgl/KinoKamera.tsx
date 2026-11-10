"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
  The cinema camera, Bandita edition.

  Built from primitives, not loaded: a lacquered body in brand pink with a
  clearcoat, a dark metal lens barrel with a chrome ring and a glossy front
  element, a matte box, a top handle, a wooden side grip like the one in the
  photographs from the set, and a monitor on the back that shows the film
  from the screen. It is a portrait of the agency's camera, not a product
  render — enough detail to be read as a cinema camera from across the room.

  The lens points slightly toward the letters and the whole thing breathes:
  a slow nod, a slow turn, as if someone had just set it down.
*/

const PINK = "#FB003F";

export default function KinoKamera({
  film,
  scale = 1,
  ...props
}: {
  film?: THREE.Texture | null;
  scale?: number;
} & JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = (props.rotation as THREE.Euler | undefined)?.y ?? 0;
    g.rotation.y += Math.sin(t * 0.35) * 0.06;
    g.rotation.x = Math.sin(t * 0.5) * 0.025;
    g.position.y = ((props.position as [number, number, number] | undefined)?.[1] ?? 0) + Math.sin(t * 0.8) * 0.04;
  });

  return (
    <group ref={group} {...props} scale={scale}>
      {/* body — pink lacquer */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.1, 0.78, 1.5]} />
        <meshPhysicalMaterial color={PINK} roughness={0.22} metalness={0.08} clearcoat={1} clearcoatRoughness={0.06} />
      </mesh>
      {/* body edge trim, dark */}
      <mesh position={[0, -0.41, 0]}>
        <boxGeometry args={[1.14, 0.06, 1.54]} />
        <meshStandardMaterial color="#15121a" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <boxGeometry args={[1.14, 0.06, 1.54]} />
        <meshStandardMaterial color="#15121a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* lens barrel */}
      <mesh position={[0, 0.02, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.75, 48]} />
        <meshStandardMaterial color="#1a161d" roughness={0.35} metalness={0.85} />
      </mesh>
      {/* focus ring */}
      <mesh position={[0, 0.02, 0.98]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.14, 48]} />
        <meshStandardMaterial color="#0e0b10" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* chrome front ring */}
      <mesh position={[0, 0.02, 1.48]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.215, 0.03, 16, 64]} />
        <meshStandardMaterial color="#e6e3ea" roughness={0.12} metalness={1} />
      </mesh>
      {/* front element — deep blue-black glass */}
      <mesh position={[0, 0.02, 1.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 48]} />
        <meshPhysicalMaterial color="#061120" roughness={0} metalness={0.2} clearcoat={1} clearcoatRoughness={0} reflectivity={1} />
      </mesh>

      {/* matte box — a short hood of four flags, close to the lens */}
      <group position={[0, 0.02, 1.62]}>
        <mesh position={[0, 0.3, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.26]} />
          <meshStandardMaterial color="#0c0a0e" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.3, 0]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.26]} />
          <meshStandardMaterial color="#0c0a0e" roughness={0.9} />
        </mesh>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0.25, 0]}>
          <boxGeometry args={[0.03, 0.58, 0.26]} />
          <meshStandardMaterial color="#0c0a0e" roughness={0.9} />
        </mesh>
        <mesh position={[0.35, 0, 0]} rotation={[0, -0.25, 0]}>
          <boxGeometry args={[0.03, 0.58, 0.26]} />
          <meshStandardMaterial color="#0c0a0e" roughness={0.9} />
        </mesh>
      </group>

      {/* top handle — chrome */}
      <mesh position={[0, 0.72, -0.1]}>
        <boxGeometry args={[0.12, 0.09, 1.0]} />
        <meshStandardMaterial color="#d9d6de" roughness={0.18} metalness={1} />
      </mesh>
      <mesh position={[0, 0.55, 0.3]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#d9d6de" roughness={0.18} metalness={1} />
      </mesh>
      <mesh position={[0, 0.55, -0.5]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#d9d6de" roughness={0.18} metalness={1} />
      </mesh>

      {/* wooden side grip, like the one at the set */}
      <mesh position={[0.72, -0.05, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.1, 0.5, 24]} />
        <meshStandardMaterial color="#8a4b2b" roughness={0.55} metalness={0} />
      </mesh>
      <mesh position={[0.6, -0.05, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
        <meshStandardMaterial color="#d9d6de" roughness={0.2} metalness={1} />
      </mesh>

      {/* monitor on the back, angled up, showing the film */}
      <group position={[0, 0.35, -0.95]} rotation={[-0.45, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.78, 0.48, 0.05]} />
          <meshStandardMaterial color="#0e0b10" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.7, 0.4]} />
          {film ? (
            <meshBasicMaterial map={film} toneMapped={false} />
          ) : (
            <meshBasicMaterial color="#2a1a22" />
          )}
        </mesh>
      </group>

      {/* viewfinder eyepiece */}
      <mesh position={[0.3, 0.3, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.25, 24]} />
        <meshStandardMaterial color="#0c0a0e" roughness={0.7} />
      </mesh>

      {/* a small creme plate on the side — where the engraving would sit */}
      <mesh position={[-0.556, 0.1, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.14]} />
        <meshStandardMaterial color="#FCF6EC" roughness={0.6} />
      </mesh>
    </group>
  );
}
