"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { aboutScene } from "@/lib/about-scene";

const URLS = [
  "/about/work/campaign-01.jpg",
  "/about/work/campaign-02.jpg",
  "/about/work/campaign-03.jpg",
  "/about/work/campaign-04.jpg",
  "/about/work/campaign-05.jpg",
  "/about/work/campaign-06.jpg",
];

// base pose per plate — biased right (body copy sits left); index 4 is the
// dedicated focal moment (centred + larger). Staggered depth/height for variety.
const LAYOUT = [
  { x: 2.7, y: 0.4, z: -1.0, sc: 1.0 }, // 0  Der Name
  { x: 2.7, y: -0.2, z: -1.2, sc: 1.0 }, // 1  Warum wir
  { x: 2.7, y: 0.4, z: -1.0, sc: 1.0 }, // 2  Psychologie
  { x: 2.7, y: -0.2, z: -1.1, sc: 1.0 }, // 3  Was wir tun
  { x: 1.3, y: 0.1, z: -0.4, sc: 1.32 }, // 4  Focal — "Aus dem Feld"
  { x: 2.6, y: 0.2, z: -1.2, sc: 1.0 }, // 5  Manifest
];

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uReveal;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    // cheap depth-of-field — blur (mip bias) while unformed, snaps sharp when revealed
    float bias = (1.0 - uReveal) * 3.2;
    vec3 col = texture2D(uTex, vUv, bias).rgb;

    // dissolve "develop": per-pixel threshold crossed by uReveal (fine grain).
    // threshold capped < 1 so the full image is 100% solid while held.
    float t = hash(floor(vUv * vec2(360.0, 240.0))) * 0.88;
    float vis = smoothstep(t - 0.05, t + 0.05, uReveal);
    float front = (1.0 - smoothstep(0.0, 0.08, abs(uReveal - t)))
                  * step(0.012, uReveal) * (1.0 - step(0.99, uReveal));
    col += vec3(1.9, 0.05, 0.5) * front * 0.9; // soft pink develop sparkle

    // pink rim glow on the frame
    float b = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float rim = smoothstep(0.045, 0.0, b);
    col += vec3(1.7, 0.0, 0.45) * rim * 0.45;

    // specular sheen sweep
    float sw = abs(fract((vUv.x + vUv.y) * 0.5 - uTime * 0.05) - 0.5);
    col += vec3(1.0) * smoothstep(0.5, 0.47, sw) * 0.12 * vis;

    gl_FragColor = vec4(col, vis * uOpacity);
  }
`;

function Plate({
  index,
  url,
  w,
  h,
  compact,
}: {
  index: number;
  url: string;
  w: number;
  h: number;
  compact: boolean;
}) {
  const tex = useTexture(url);
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const L = LAYOUT[index];
  const xFac = compact ? 0.34 : 1; // pull plates toward centre on phones
  const yBias = compact ? -0.4 : 0;

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  }, [tex]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    }),
    [tex],
  );

  useFrame((state) => {
    const m = mesh.current;
    const u = matRef.current?.uniforms;
    if (!m || !u) return;
    const ps = aboutScene.plates[index] ?? { reveal: 0, pass: 0 };
    const r = ps.reveal;
    const p = ps.pass;

    m.visible = r > 0.012;
    if (!m.visible) return;

    // fly-through pose
    m.position.x = L.x * xFac + p * 1.0 + aboutScene.pointerX * 0.5;
    m.position.y = L.y + yBias + aboutScene.pointerY * 0.35;
    m.position.z = L.z + p * 3.4;
    m.rotation.y = -p * 0.42 + aboutScene.pointerX * 0.14;
    m.rotation.x = aboutScene.pointerY * 0.1 + p * 0.05;
    const s = (0.92 + r * 0.12) * L.sc;
    m.scale.set(s, s, 1);

    u.uReveal.value = r;
    u.uTime.value = state.clock.elapsedTime;
    u.uOpacity.value = Math.min(1, r * 1.4);
  });

  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function CampaignPlates() {
  const { size } = useThree();
  const compact = size.width < 768;
  const w = compact ? 5.2 : 6.2;
  const h = w / 1.5; // plates are 3:2
  return (
    <group>
      {URLS.map((url, i) => (
        <Plate key={url} index={i} url={url} w={w} h={h} compact={compact} />
      ))}
    </group>
  );
}
