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

// Cheap animated caustics — overlapping waves form drifting bright cells.
const fragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;

  float caustic(vec2 p) {
    float t = uTime * 0.18;
    vec2 q = p * 3.2;
    float v = 0.0;
    v += sin(q.x * 1.3 + t) + sin(q.y * 1.7 - t);
    v += sin((q.x + q.y) * 1.1 + t * 1.3);
    v += sin(length(q - vec2(2.0, 1.0)) * 2.2 - t * 1.1);
    return v;
  }

  void main() {
    vec2 uv = vUv * vec2(2.4, 1.4);
    float c = caustic(uv);
    float cells = pow(abs(sin(c * 1.5)), 7.0);
    // fade toward the edges so the plane has no hard border
    float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x)
               * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    float a = cells * edge * 0.12;
    gl_FragColor = vec4(uColor, a);
  }
`;

// A drifting sheet of caustic light across the scene.
export default function Caustics() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color("#FFE3EC") } }),
    [],
  );
  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 0, -9]} scale={[70, 46, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
