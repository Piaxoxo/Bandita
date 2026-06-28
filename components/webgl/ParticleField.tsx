"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene as store } from "@/lib/scene-store";

// Restrained, tonal rosé/creme palette — elegant, not confetti.
const PALETTE = [
  new THREE.Color("#FBC9D5"), // soft blush pink
  new THREE.Color("#FF9DB8"), // muted pink
  new THREE.Color("#F4C6CE"), // dusty rose
  new THREE.Color("#FBE3E0"), // blush
  new THREE.Color("#FF5C9E"), // rosé accent (sparing)
  new THREE.Color("#F7D2C9"), // warm sand-blush
  new THREE.Color("#FBC9D5"),
];

const FOG = new THREE.Color("#FBEFEC");

export type Layer = "far" | "mid" | "near";

// per-layer feel: parallax depth, point scale, scroll travel, haze
const LAYERS: Record<
  Layer,
  { depth: number; size: number; scroll: number; haze: number; opacity: number; spread: number }
> = {
  far: { depth: 38, size: 9, scroll: 1.4, haze: 0.85, opacity: 0.7, spread: 1.4 },
  mid: { depth: 26, size: 16, scroll: 2.2, haze: 0.4, opacity: 1.0, spread: 1.0 },
  near: { depth: 16, size: 30, scroll: 3.4, haze: 0.1, opacity: 0.85, spread: 0.8 },
};

const vertex = /* glsl */ `
  uniform float uDepth;
  attribute float aScale;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScroll;
  uniform float uScrollMul;
  uniform float uVelocity;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIntro;
  uniform float uCluster;
  uniform float uRipple;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vNear;

  void main() {
    vColor = aColor;
    vec3 p = position;

    float t = uTime * 0.16 + aSeed * 6.2831;
    p.x += sin(t) * 0.4 * aScale;
    p.y += cos(t * 1.13) * 0.4 * aScale;

    p.z = mod(p.z + uScroll * uDepth * uScrollMul + uTime * 0.25, uDepth) - uDepth * 0.5;
    float near = (p.z + uDepth * 0.5) / uDepth;
    vNear = near;

    p.xy = mix(p.xy, p.xy * 0.45, uCluster * near);

    // cursor ripple — particles part around the pointer
    vec2 cursor = uPointer * vec2(9.0, 6.0);
    vec2 toP = p.xy - cursor;
    float d = length(toP);
    float infl = smoothstep(4.5, 0.0, d);
    p.xy += normalize(toP + vec2(0.001)) * infl * uRipple;

    p.x += uPointer.x * (1.2 + near * 2.6);
    p.y += uPointer.y * (0.9 + near * 2.2);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = uSize * aScale * (1.0 + abs(uVelocity) * 1.6);
    gl_PointSize = size * uPixelRatio * (34.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    float fade = smoothstep(0.0, 0.14, near) * smoothstep(1.0, 0.72, near);
    vAlpha = fade * uIntro;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  uniform float uHaze;
  uniform vec3 uFog;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vNear;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float dd = length(c);
    if (dd > 0.5) discard;
    float core = smoothstep(0.5, 0.06, dd);
    float halo = smoothstep(0.5, 0.26, dd);
    float a = (core * 0.95 + halo * 0.22) * vAlpha * uOpacity;
    if (a < 0.01) discard;
    // depth haze: far particles blend toward the fog colour
    vec3 col = mix(vColor, uFog, (1.0 - vNear) * uHaze);
    gl_FragColor = vec4(col, a);
  }
`;

export default function ParticleField({
  count,
  layer = "mid",
}: {
  count: number;
  layer?: Layer;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const cfg = LAYERS[layer];
  useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const aspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1.6;
    const spreadX = 18 * cfg.spread * Math.max(1, aspect * 0.7);
    const spreadY = 14 * cfg.spread;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = Math.random() * cfg.depth - cfg.depth * 0.5;
      const r = Math.random();
      scales[i] = r < 0.9 ? 0.35 + r * 0.7 : 1.1 + Math.random() * 1.3;
      seeds[i] = Math.random();
      const c = PALETTE[(Math.random() * PALETTE.length) | 0];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count, cfg.depth, cfg.spread]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uScrollMul: { value: cfg.scroll },
      uVelocity: { value: 0 },
      uSize: { value: cfg.size },
      uDepth: { value: cfg.depth },
      uHaze: { value: cfg.haze },
      uOpacity: { value: cfg.opacity },
      uFog: { value: FOG },
      uPixelRatio: { value: 1 },
      uIntro: { value: 0 },
      uCluster: { value: 0 },
      uRipple: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [cfg],
  );

  useFrame((state, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uScroll.value = store.scroll;
    u.uVelocity.value = store.velocity;
    u.uPointer.value.set(store.pointerX, store.pointerY);
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    u.uSize.value = state.size.width < 768 ? cfg.size * 0.62 : cfg.size;
    // ripple grows with scroll velocity + a gentle constant presence
    u.uRipple.value = 0.5 + Math.abs(store.velocity) * 2.2;
    const targetIntro = store.introDone ? 1 : 0;
    u.uIntro.value += (targetIntro - u.uIntro.value) * 0.05;
    const s = store.scroll;
    const cluster = Math.max(0, 1 - s * 4) * 0.7 + Math.max(0, (s - 0.82) / 0.18) * 0.6;
    u.uCluster.value += (Math.min(1, cluster) - u.uCluster.value) * 0.04;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
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
  );
}
