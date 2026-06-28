"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uSeed;
  void main() {
    float col = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
    float ver = smoothstep(0.05, 0.45, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
    float flick = 0.78 + 0.22 * sin(uTime * 0.7 + uSeed * 12.0);
    float a = col * ver * flick * 0.26;
    gl_FragColor = vec4(uColor, a);
  }
`;

const COLORS = ["#FFE8D6", "#FFD2E0", "#FFFFFF", "#FFC9DA", "#FFE8D6"];

// Volumetric god-ray shafts raking through the scene. Bloom makes them glow.
export default function LightShafts() {
  const group = useRef<THREE.Group>(null);

  const beams = useMemo(
    () =>
      [...Array(5)].map((_, i) => ({
        x: -7 + i * 3.4 + (i % 2 ? 0.8 : -0.6),
        rot: -0.22 + i * 0.09,
        scale: [2.4 + (i % 2) * 1.2, 34, 1] as [number, number, number],
        uniforms: {
          uColor: { value: new THREE.Color(COLORS[i % COLORS.length]) },
          uTime: { value: 0 },
          uSeed: { value: i * 1.7 },
        },
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.05) * 0.04;
      group.current.position.x = Math.sin(t * 0.07) * 0.6;
    }
    for (const b of beams) b.uniforms.uTime.value = t;
  });

  return (
    <group ref={group} position={[0, 6, -7]}>
      {beams.map((b, i) => (
        <mesh key={i} position={[b.x, 0, 0]} rotation={[0, 0, b.rot]} scale={b.scale}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            vertexShader={vertex}
            fragmentShader={fragment}
            uniforms={b.uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
