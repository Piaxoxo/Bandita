"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene as store } from "@/lib/scene-store";

const PALETTE = [
  new THREE.Color("#FB003F"), // pink
  new THREE.Color("#FF5C9E"), // rosé
  new THREE.Color("#FF8A5B"), // coral
  new THREE.Color("#FFC23D"), // gelb
  new THREE.Color("#5FC9BC"), // teal
  new THREE.Color("#FB003F"),
  new THREE.Color("#FF5C9E"),
];

const DEPTH = 26;

const vertex = /* glsl */ `
  #define DEPTH 26.0
  attribute float aScale;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScroll;
  uniform float uVelocity;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIntro;
  uniform float uCluster;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 p = position;

    // organic drift
    float t = uTime * 0.16 + aSeed * 6.2831;
    p.x += sin(t) * 0.4 * aScale;
    p.y += cos(t * 1.13) * 0.4 * aScale;

    // travel through depth as the page scrolls (wraps for an endless field)
    p.z = mod(p.z + uScroll * DEPTH * 2.2 + uTime * 0.25, DEPTH) - DEPTH * 0.5;

    // 0 (far) .. 1 (near)
    float near = (p.z + DEPTH * 0.5) / DEPTH;

    // particles gather toward the centre during headline moments
    p.xy = mix(p.xy, p.xy * 0.45, uCluster * near);

    // parallax — nearer particles react more to the pointer
    p.x += uPointer.x * (1.4 + near * 3.0);
    p.y += uPointer.y * (1.0 + near * 2.4);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // size grows slightly with scroll velocity for a sense of speed
    float size = uSize * aScale * (1.0 + abs(uVelocity) * 1.6);
    gl_PointSize = size * uPixelRatio * (34.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    // fade at the very near/far planes + global intro fade
    float fade = smoothstep(0.0, 0.14, near) * smoothstep(1.0, 0.72, near);
    vAlpha = fade * uIntro;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.06, d);
    float halo = smoothstep(0.5, 0.26, d);
    float a = (core * 0.95 + halo * 0.22) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export default function ParticleField({ count }: { count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const aspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1.6;
    const spreadX = 17 * Math.max(1, aspect * 0.7);
    const spreadY = 13;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = Math.random() * DEPTH - DEPTH * 0.5;
      // mostly crisp dust with a few larger soft bokeh for depth
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
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uSize: { value: 18 },
      uPixelRatio: { value: 1 },
      uIntro: { value: 0 },
      uCluster: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uScroll.value = store.scroll;
    u.uVelocity.value = store.velocity;
    u.uPointer.value.set(store.pointerX, store.pointerY);
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    // smaller dust on compact screens so it never overwhelms the content
    u.uSize.value = state.size.width < 768 ? 11 : 17;
    // intro fade-in once the opening sequence releases the scene
    const targetIntro = store.introDone ? 1 : 0;
    u.uIntro.value += (targetIntro - u.uIntro.value) * 0.05;
    // cluster near hero (top) and CTA (bottom) headline moments
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
