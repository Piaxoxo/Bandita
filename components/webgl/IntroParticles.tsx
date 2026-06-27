"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CREME = new THREE.Color("#FCF6EC");
const PINK = new THREE.Color("#FB003F");
const ROSE = new THREE.Color("#FF5C9E");

type Phase = "form" | "hold" | "exit" | "done";

const WORD_W = 9; // world units the wordmark spans
const FOV = 45;

// camera distance at which the word (plus margin) fits the current aspect
function fitDistance(aspect: number) {
  const half = (FOV * Math.PI) / 180 / 2;
  const z = (WORD_W * 1.18) / (2 * Math.tan(half) * aspect);
  return Math.max(7, Math.min(34, z));
}

const vertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aTarget;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uProgress;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vec3 pos = mix(aStart, aTarget, uProgress);
    vec3 dir = normalize(aTarget + vec3(0.0001, 0.0001, 0.0001));
    pos += dir * uScatter * 9.0 * (0.4 + aSeed);
    pos.z += uScatter * 7.0;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * (16.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    float formAlpha = smoothstep(0.0, 0.28, uProgress);
    vAlpha = formAlpha * (1.0 - uScatter);
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
    float g = smoothstep(0.5, 0.34, d);
    gl_FragColor = vec4(vColor, g * vAlpha);
  }
`;

function sampleWord(count: number) {
  const cw = 1024;
  const ch = 280;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Bodoni if available, else a serif — only the silhouette matters.
  // Letter-spaced + medium weight so the particles trace open letterforms.
  ctx.font = "500 168px 'Bodoni Moda', Georgia, serif";
  const letters = "BANDITA";
  ctx.letterSpacing = "14px";
  ctx.fillText(letters, cw / 2, ch / 2 + 6);

  const data = ctx.getImageData(0, 0, cw, ch).data;
  // Even grid sampling → evenly-spaced dots that read as letterforms
  const gap = 5;
  let raw: [number, number][] = [];
  for (let y = 0; y < ch; y += gap) {
    for (let x = 0; x < cw; x += gap) {
      if (data[(y * cw + x) * 4 + 3] > 128) raw.push([x, y]);
    }
  }
  if (!raw.length) return null;
  // cap to the tier budget by striding (keeps the even spacing)
  if (raw.length > count) {
    const stride = Math.ceil(raw.length / count);
    raw = raw.filter((_, i) => i % stride === 0);
  }
  const n = raw.length;

  const worldW = WORD_W;
  const worldH = (worldW * ch) / cw;
  const start = new Float32Array(n * 3);
  const target = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const color = new Float32Array(n * 3);

  for (let i = 0; i < n; i++) {
    const [px, py] = raw[i];
    const nx = px / cw - 0.5;
    const ny = -(py / ch - 0.5);
    target[i * 3] = nx * worldW + (Math.random() - 0.5) * 0.05;
    target[i * 3 + 1] = ny * worldH + (Math.random() - 0.5) * 0.05;
    target[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

    // start from a wide cloud around the word
    const r = 10 + Math.random() * 16;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    start[i * 3] = r * Math.sin(b) * Math.cos(a);
    start[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.6;
    start[i * 3 + 2] = r * Math.cos(b) - 6;

    seed[i] = Math.random();
    const roll = Math.random();
    const c = roll < 0.78 ? CREME : roll < 0.92 ? ROSE : PINK;
    color[i * 3] = c.r;
    color[i * 3 + 1] = c.g;
    color[i * 3 + 2] = c.b;
  }
  return { start, target, seed, color };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;

function LogoScene({
  count,
  onExitStart,
  onComplete,
}: {
  count: number;
  onExitStart: () => void;
  onComplete: () => void;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, size } = useThree();
  const [buffers, setBuffers] = useState<ReturnType<typeof sampleWord>>(null);
  const phase = useRef<Phase>("form");
  const elapsed = useRef(0);
  const firedExit = useRef(false);

  const FORM = 2.0;
  const HOLD = 1.1;
  const EXIT = 1.3;

  useEffect(() => {
    let done = false;
    const build = () => {
      if (done) return;
      const b = sampleWord(count);
      if (b) setBuffers(b);
    };
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(build);
      // fallback in case fonts.ready stalls
      const t = window.setTimeout(build, 500);
      return () => {
        done = true;
        window.clearTimeout(t);
      };
    }
    build();
    return () => {
      done = true;
    };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uScatter: { value: 0 },
      uSize: { value: 2.7 },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = matRef.current?.uniforms;
    if (!u || !buffers) return;
    u.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2);
    elapsed.current += delta;
    const t = elapsed.current;

    // distance that frames the whole wordmark for the current aspect ratio
    const fitZ = fitDistance(size.width / size.height);

    if (phase.current === "form") {
      const p = Math.min(1, t / FORM);
      u.uProgress.value = easeOut(p);
      camera.position.z = fitZ + 6 - easeOut(p) * 6; // push in
      if (p >= 1) phase.current = "hold";
    } else if (phase.current === "hold") {
      u.uProgress.value = 1;
      camera.position.z = fitZ;
      if (t > FORM + HOLD) {
        phase.current = "exit";
        elapsed.current = 0;
      }
    } else if (phase.current === "exit") {
      if (!firedExit.current) {
        firedExit.current = true;
        onExitStart();
      }
      const p = Math.min(1, t / EXIT);
      u.uScatter.value = easeIn(p);
      camera.position.z = fitZ - easeIn(p) * fitZ * 0.55; // push through
      if (p >= 1) {
        phase.current = "done";
        onComplete();
      }
    }
    camera.lookAt(0, 0, 0);
  });

  if (!buffers) return null;

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffers.target, 3]} />
        <bufferAttribute attach="attributes-aStart" args={[buffers.start, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[buffers.target, 3]} />
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
  );
}

export default function IntroParticles({
  count,
  onExitStart,
  onComplete,
}: {
  count: number;
  onExitStart: () => void;
  onComplete: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 14], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <LogoScene count={count} onExitStart={onExitStart} onComplete={onComplete} />
    </Canvas>
  );
}
