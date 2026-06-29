"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { aboutScene, tickAboutInputs } from "@/lib/about-scene";
import CampaignPlates from "./CampaignPlates";

// HDR-ish colours (>1) so Bloom catches them as glow.
const WHITE: [number, number, number] = [1.7, 1.62, 1.5];
const PINK: [number, number, number] = [1.9, 0.05, 0.5];
const ROSE: [number, number, number] = [1.8, 0.35, 0.7];

type Buffers = {
  woman: Float32Array;
  word: Float32Array;
  ambient: Float32Array;
  seed: Float32Array;
  color: Float32Array;
  n: number;
};

function sampleImage(url: string, count: number): Promise<{ pts: [number, number][]; aspect: number } | null> {
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
      const gap = 3;
      let raw: [number, number][] = [];
      for (let y = 0; y < sh; y += gap) {
        for (let x = 0; x < sw; x += gap) {
          const i = (y * sw + x) * 4;
          const dCreme = Math.abs(data[i] - 252) + Math.abs(data[i + 1] - 246) + Math.abs(data[i + 2] - 236);
          if (data[i + 3] > 40 && dCreme > 90) raw.push([x / sw - 0.5, -(y / sh - 0.5)]);
        }
      }
      if (!raw.length) return resolve(null);
      if (raw.length > count) {
        const stride = Math.ceil(raw.length / count);
        raw = raw.filter((_, k) => k % stride === 0);
      }
      resolve({ pts: raw, aspect: sh / sw });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function sampleWord(count: number): { pts: [number, number][]; aspect: number } | null {
  const cw = 1024, ch = 280;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 176px 'Bodoni Moda', Georgia, serif";
  ctx.letterSpacing = "10px";
  ctx.fillText("BANDITA", cw / 2, ch / 2 + 6);
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const gap = 4;
  let raw: [number, number][] = [];
  for (let y = 0; y < ch; y += gap) {
    for (let x = 0; x < cw; x += gap) {
      if (data[(y * cw + x) * 4 + 3] > 128) raw.push([x / cw - 0.5, -(y / ch - 0.5)]);
    }
  }
  if (!raw.length) return null;
  if (raw.length > count) {
    const stride = Math.ceil(raw.length / count);
    raw = raw.filter((_, k) => k % stride === 0);
  }
  return { pts: raw, aspect: ch / cw };
}

const vertex = /* glsl */ `
  attribute vec3 aWoman;
  attribute vec3 aWord;
  attribute vec3 aAmbient;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uForm;
  uniform float uMorph;
  uniform float uExplode;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIntensity;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vA;
  void main() {
    vColor = aColor;
    float a = aSeed * 6.2831853;
    vec3 amb = aAmbient;
    amb.x += sin(uTime * 0.30 + a) * 1.3 + cos(uTime * 0.17 + a * 1.7) * 0.7;
    amb.y += cos(uTime * 0.26 + a) * 1.1 + sin(uTime * 0.19 + a * 1.3) * 0.6;
    amb.z += sin(uTime * 0.21 + a * 0.5) * 1.5;

    vec3 target = mix(aWoman, aWord, uMorph);
    vec3 pos = mix(amb, target, smoothstep(0.0, 1.0, uForm));

    vec3 dir = normalize(pos + vec3(0.0001, 0.0001, 0.0001));
    pos += dir * uExplode * (4.0 + aSeed * 7.0);

    vec2 pd = pos.xy - uPointer;
    float pl = length(pd) + 0.0001;
    float push = smoothstep(3.4, 0.0, pl) * (1.0 - uForm * 0.55);
    pos.xy += (pd / pl) * push * 1.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed * 0.95) * (15.5 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vA = mix(0.55, 1.0, uForm) + uIntensity * 0.7;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * core * vA, core);
  }
`;

const INTRO = { formEnd: 1.8, holdWoman: 2.8, morphEnd: 4.0, holdWord: 5.0 };

function Particles({ count }: { count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [buf, setBuf] = useState<Buffers | null>(null);
  const { size, camera } = useThree();
  const worldW = size.width < 768 ? 6.4 : 9;

  // eased uniform state
  const st = useRef({ form: 0, morph: 0, explode: 0, intensity: 0, released: false, t: 0 });

  useEffect(() => {
    let alive = true;
    aboutScene.heroReleased = false; // fresh film on (re)mount
    const build = async () => {
      const wordRes = sampleWord(count);
      const imgRes = await sampleImage("/about/illustration.png", count);
      if (!alive || !wordRes || !imgRes) return;
      const womanPts = imgRes.pts;
      const wordPts = wordRes.pts;
      const n = Math.min(womanPts.length, wordPts.length);
      const woman = new Float32Array(n * 3);
      const word = new Float32Array(n * 3);
      const ambient = new Float32Array(n * 3);
      const seed = new Float32Array(n);
      const color = new Float32Array(n * 3);
      const womanH = worldW * imgRes.aspect;
      const wordH = worldW * wordRes.aspect;
      for (let i = 0; i < n; i++) {
        woman[i * 3] = womanPts[i][0] * worldW;
        woman[i * 3 + 1] = womanPts[i][1] * womanH;
        woman[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
        word[i * 3] = wordPts[i][0] * worldW * 1.05;
        word[i * 3 + 1] = wordPts[i][1] * wordH * 2.4;
        word[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
        // wide luminous volume
        ambient[i * 3] = (Math.random() - 0.5) * 26;
        ambient[i * 3 + 1] = (Math.random() - 0.5) * 18;
        ambient[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
        seed[i] = Math.random();
        const roll = Math.random();
        const col = roll < 0.74 ? WHITE : roll < 0.92 ? PINK : ROSE;
        color[i * 3] = col[0];
        color[i * 3 + 1] = col[1];
        color[i * 3 + 2] = col[2];
      }
      setBuf({ woman, word, ambient, seed, color, n });
    };
    build();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uForm: { value: 0 },
      uMorph: { value: 0 },
      uExplode: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 3.0 },
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
    const s = st.current;
    s.t += delta;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);

    // release the intro once it finishes or the user scrolls
    if (!s.released && (s.t > INTRO.holdWord + 0.6 || aboutScene.scroll > 0.02)) {
      s.released = true;
      aboutScene.heroReleased = true;
    }

    let formT: number, morphT: number, explodeT: number, intenT: number;
    if (!s.released) {
      const t = s.t;
      formT = Math.min(1, t / INTRO.formEnd);
      if (t < INTRO.holdWoman) morphT = 0;
      else if (t < INTRO.morphEnd) morphT = (t - INTRO.holdWoman) / (INTRO.morphEnd - INTRO.holdWoman);
      else morphT = 1;
      explodeT = 0;
      intenT = 0.15;
    } else {
      const woman = aboutScene.cohesion;
      const word = aboutScene.finale;
      formT = Math.max(woman, word);
      morphT = word / (woman + word + 0.0001);
      explodeT = aboutScene.explode;
      intenT = aboutScene.intensity;
    }

    const k = Math.min(1, delta * 3.2);
    s.form += (formT - s.form) * k;
    s.morph += (morphT - s.morph) * k;
    s.explode += (explodeT - s.explode) * Math.min(1, delta * 5);
    s.intensity += (intenT - s.intensity) * k;
    u.uForm.value = s.form;
    u.uMorph.value = s.morph;
    u.uExplode.value = s.explode;
    u.uIntensity.value = s.intensity;
    // keep the repel off-screen until the pointer has actually moved
    if (aboutScene.moved) u.uPointer.value.set(aboutScene.pointerX * 8, aboutScene.pointerY * 5);
    else u.uPointer.value.set(999, 999);

    // camera flythrough + parallax
    const introZ = size.width < 768 ? 13 : 11.5;
    const targetZ = s.released ? 12.5 - aboutScene.scroll * 5.5 : introZ;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.position.x += (aboutScene.pointerX * 1.3 - camera.position.x) * 0.04;
    camera.position.y += (aboutScene.pointerY * 0.9 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y += (aboutScene.pointerX * 0.18 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (-aboutScene.pointerY * 0.12 - groupRef.current.rotation.x) * 0.03;
    }
  });

  if (!buf) return null;

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buf.woman, 3]} />
          <bufferAttribute attach="attributes-aWoman" args={[buf.woman, 3]} />
          <bufferAttribute attach="attributes-aWord" args={[buf.word, 3]} />
          <bufferAttribute attach="attributes-aAmbient" args={[buf.ambient, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[buf.seed, 1]} />
          <bufferAttribute attach="attributes-aColor" args={[buf.color, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function AboutScene({
  count = 12000,
  quality = "high",
}: {
  count?: number;
  quality?: "high" | "mid";
}) {
  return (
    <Canvas
      dpr={[1, quality === "high" ? 1.85 : 1.4]}
      camera={{ position: [0, 0, 12], fov: 46 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <Particles count={count} />
      <Suspense fallback={null}>
        <CampaignPlates />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={quality === "high" ? 1.4 : 0.9}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={quality === "high" ? 0.85 : 0.7}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0003, 0.0003)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
        <Noise premultiply opacity={quality === "high" ? 0.05 : 0.03} />
      </EffectComposer>
    </Canvas>
  );
}
