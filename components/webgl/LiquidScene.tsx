"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
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

/*
  BANDITA — flowing 3D liquid-gradient world.

  A densely-subdivided plane is displaced by domain-warped flowing noise into a
  living liquid surface (pink → rosé → cream) that ripples continuously, catches
  a moving highlight, and warps toward the cursor. The camera parallax-tilts on
  pointer + scroll for real depth. Soft bokeh orbs drift in front for layers.
  Post: gentle bloom, chromatic aberration, film grain, vignette.
*/

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  varying vec3 vNormal;
  varying float vH;
  varying vec3 vPos;

  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    vec2 u=f*f*(3.0-2.0*f);
    float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }
  float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

  float height(vec2 p){
    float t = uTime*0.10 + uScroll*1.6;
    vec2 q = vec2(fbm(p + t), fbm(p - t + 3.1));
    // pull the swell gently toward the cursor
    float pull = 0.5 - length(p*0.16 - uPointer*1.2)*0.12;
    return fbm(p + q*1.6) + pull*0.25;
  }

  void main(){
    vec3 pos = position;
    vec2 p = pos.xy * 0.16;
    float amp = 3.8;
    float h = height(p);
    float e = 0.05;
    float hx = height(p + vec2(e,0.0));
    float hy = height(p + vec2(0.0,e));
    pos.z += (h-0.5)*amp;
    vec3 n = normalize(vec3(-(hx-h)/e*0.16*amp, -(hy-h)/e*0.16*amp, 1.0));
    vNormal = n; vH = h; vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vNormal;
  varying float vH;
  varying vec3 vPos;

  void main(){
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(0.35, 0.65, 0.7));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);
    float diff = clamp(dot(N, L), 0.0, 1.0);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 32.0);
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

    vec3 cream = vec3(0.995, 0.965, 0.94);
    vec3 blush = vec3(1.0, 0.78, 0.86);
    vec3 rose  = vec3(0.98, 0.36, 0.60);
    vec3 pink  = vec3(0.99, 0.02, 0.27);

    float band = smoothstep(0.18, 0.82, vH + sin(vPos.x*0.05 + uTime*0.25)*0.08);
    vec3 col = mix(cream, blush, band);
    col = mix(col, rose, smoothstep(0.55, 0.96, vH));

    // shadows fall to deep rosé (never muddy grey), crests catch a pink sparkle
    float lit = clamp(0.5 + diff * 0.62, 0.0, 1.0);
    col = mix(rose * 0.55, col, lit);
    col += pink * spec * 1.0;
    col = mix(col, vec3(1.0, 0.95, 0.97), fres * 0.14);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function LiquidSurface({ tier }: { tier: DeviceTier }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const seg = tier === "high" ? 240 : tier === "mid" ? 160 : 96;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );
  useFrame((_, delta) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uScroll.value += (store.scroll - u.uScroll.value) * 0.05;
    (u.uPointer.value as THREE.Vector2).set(store.pointerX, store.pointerY);
  });
  // size to more than cover the frame at this depth
  const w = viewport.width * 2.0 + 10;
  const h = viewport.height * 2.0 + 10;
  return (
    <mesh position={[0, -0.5, -1]} rotation={[-0.32, 0, 0]}>
      <planeGeometry args={[w, h, seg, Math.round(seg * 0.66)]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  );
}

function Bokeh({ i }: { i: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => (Math.sin(i * 78.233) * 43758.5453) % 1, [i]);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = Math.sin(t * 0.15 + seed * 6) * 6 + store.pointerX * 1.2;
    ref.current.position.y = Math.cos(t * 0.12 + seed * 6) * 3.5 + store.scroll * 3;
    const s = 0.5 + (i % 3) * 0.4 + Math.sin(t + seed * 6) * 0.15;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={[0, 0, 3 + (i % 3)]}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial
        color={i % 2 ? "#FF5C9E" : "#FFD9E4"}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useFrame((state) => {
    tickScene();
    const t = state.clock.elapsedTime;
    const compact = size.width < 768;
    const baseZ = compact ? 15 : 12.5;
    camera.position.x += (store.pointerX * 1.3 + Math.sin(t * 0.08) * 0.4 - camera.position.x) * 0.045;
    camera.position.y += (store.pointerY * 0.9 - store.scroll * 0.6 - camera.position.y) * 0.045;
    camera.position.z += (baseZ - store.scroll * 2.0 - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
    camera.rotation.z += (Math.sin(t * 0.05) * 0.015 + store.pointerX * 0.02 - camera.rotation.z) * 0.05;
  });
  return null;
}

function CinemaFX({ tier }: { tier: DeviceTier }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0007, 0.0011), []);
  if (tier === "low") return null;
  return (
    <EffectComposer multisampling={tier === "high" ? 4 : 0}>
      <Bloom intensity={0.5} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur radius={0.8} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={caOffset} radialModulation modulationOffset={0.4} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.05} />
      <Vignette eskil={false} offset={0.22} darkness={0.68} />
    </EffectComposer>
  );
}

export default function LiquidScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];
  const orbs = tier === "low" ? 0 : tier === "mid" ? 4 : 6;

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 12.5], fov: 45 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#FCEFEA"]} />
      <AdaptiveDpr pixelated />
      <LiquidSurface tier={tier} />
      {Array.from({ length: orbs }, (_, i) => (
        <Bokeh key={i} i={i} />
      ))}
      <Rig />
      <CinemaFX tier={tier} />
    </Canvas>
  );
}
