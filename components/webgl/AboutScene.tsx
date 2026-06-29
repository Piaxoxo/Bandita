"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { aboutScene, tickAboutInputs } from "@/lib/about-scene";

const LIGHT = new THREE.Color("#E8DFD6");
const DIM = new THREE.Color("#9A8F88");
const PINK = new THREE.Color("#FB003F");
const ROSE = new THREE.Color("#FF5C9E");

type Buffers = {
  target: Float32Array;
  ambient: Float32Array;
  seed: Float32Array;
  color: Float32Array;
  n: number;
};

// Sample the line-art illustration into evenly-spaced particle targets.
function sampleImage(url: string, count: number, worldW: number): Promise<Buffers | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sw = 600;
      const sh = Math.round((sw * img.height) / img.width);
      const c = document.createElement("canvas");
      c.width = sw;
      c.height = sh;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, sw, sh);
      const data = ctx.getImageData(0, 0, sw, sh).data;

      // Keep pixels that differ from the creme background (the pink lines + text).
      const gap = 3;
      let raw: [number, number][] = [];
      for (let y = 0; y < sh; y += gap) {
        for (let x = 0; x < sw; x += gap) {
          const i = (y * sw + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 40) continue;
          const dCreme = Math.abs(r - 252) + Math.abs(g - 246) + Math.abs(b - 236);
          if (dCreme > 90) raw.push([x, y]);
        }
      }
      if (!raw.length) return resolve(null);
      if (raw.length > count) {
        const stride = Math.ceil(raw.length / count);
        raw = raw.filter((_, k) => k % stride === 0);
      }
      const n = raw.length;
      const worldH = (worldW * sh) / sw;
      const target = new Float32Array(n * 3);
      const ambient = new Float32Array(n * 3);
      const seed = new Float32Array(n);
      const color = new Float32Array(n * 3);

      for (let k = 0; k < n; k++) {
        const [px, py] = raw[k];
        const nx = px / sw - 0.5;
        const ny = -(py / sh - 0.5);
        target[k * 3] = nx * worldW + (Math.random() - 0.5) * 0.04;
        target[k * 3 + 1] = ny * worldH + (Math.random() - 0.5) * 0.04;
        target[k * 3 + 2] = (Math.random() - 0.5) * 0.5;

        // dispersed ambient cloud — a wide, flattened volume
        const r = 7 + Math.random() * 11;
        const a = Math.random() * Math.PI * 2;
        ambient[k * 3] = Math.cos(a) * r;
        ambient[k * 3 + 1] = (Math.random() - 0.5) * 13;
        ambient[k * 3 + 2] = Math.sin(a) * r * 0.5 - 3;

        seed[k] = Math.random();
        const roll = Math.random();
        const col = roll < 0.74 ? LIGHT : roll < 0.86 ? DIM : roll < 0.95 ? PINK : ROSE;
        color[k * 3] = col.r;
        color[k * 3 + 1] = col.g;
        color[k * 3 + 2] = col.b;
      }
      resolve({ target, ambient, seed, color, n });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

const vertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aAmbient;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uCohesion;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIntensity;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vA;
  void main() {
    vColor = aColor;
    float tw = 6.2831853 * aSeed;
    vec3 amb = aAmbient;
    amb.x += sin(uTime * 0.30 + tw) * (0.7 + uIntensity * 0.9);
    amb.y += cos(uTime * 0.24 + tw) * (0.6 + uIntensity * 0.8);
    amb.z += sin(uTime * 0.20 + tw * 0.5) * 0.7;

    float c = smoothstep(0.0, 1.0, uCohesion);
    vec3 pos = mix(amb, aTarget, c);

    // pointer ripple — pushes the cloud, eases off once formed
    vec2 d = pos.xy - uPointer * 6.0;
    float dist = length(d) + 0.0001;
    float push = smoothstep(3.0, 0.0, dist) * (1.0 - c * 0.7);
    pos.xy += (d / dist) * push * 0.9;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.45 + aSeed * 0.85) * (15.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vA = mix(0.32, 1.0, c);
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vA;
  void main() {
    vec2 cc = gl_PointCoord - 0.5;
    float d = length(cc);
    if (d > 0.5) discard;
    float g = smoothstep(0.5, 0.18, d);
    gl_FragColor = vec4(vColor, g * vA);
  }
`;

function Particles({ count }: { count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [buffers, setBuffers] = useState<Buffers | null>(null);
  const { size } = useThree();
  const eased = useRef(0);

  const worldW = size.width < 768 ? 5.2 : 6.6;

  useEffect(() => {
    let alive = true;
    sampleImage("/about/illustration.png", count, worldW).then((b) => {
      if (alive && b) setBuffers(b);
    });
    return () => {
      alive = false;
    };
    // worldW intentionally excluded — re-sampling on resize isn't worth it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uCohesion: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 2.4 },
      uPixelRatio: { value: 1 },
      uIntensity: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state, delta) => {
    tickAboutInputs();
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    // ease cohesion toward the scroll-driven target
    eased.current += (aboutScene.cohesion - eased.current) * Math.min(1, delta * 3.4);
    u.uCohesion.value = eased.current;
    u.uIntensity.value = aboutScene.intensity;
    u.uPointer.value.set(aboutScene.pointerX, aboutScene.pointerY);

    if (groupRef.current) {
      const tx = aboutScene.pointerX * 0.4;
      const ty = aboutScene.pointerY * 0.3;
      groupRef.current.rotation.y += (tx - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (-ty - groupRef.current.rotation.x) * 0.04;
    }
  });

  if (!buffers) return null;

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buffers.target, 3]} />
          <bufferAttribute attach="attributes-aTarget" args={[buffers.target, 3]} />
          <bufferAttribute attach="attributes-aAmbient" args={[buffers.ambient, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[buffers.seed, 1]} />
          <bufferAttribute attach="attributes-aColor" args={[buffers.color, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

export default function AboutScene({ count = 6000 }: { count?: number }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 12], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Particles count={count} />
    </Canvas>
  );
}
