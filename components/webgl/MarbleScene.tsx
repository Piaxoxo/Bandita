"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";

/*
  BANDITA — homepage background: pink marble on white + flowing "one-line"
  ribbons, with scroll parallax and a subtle 3D-on-scroll camera.

  - A full-viewport marble shader (domain-warped fbm) paints white stone with
    soft pink clouds and rosé veins; it drifts slowly and shifts on scroll.
  - A handful of thin pink line-ribbons float at different depths; on scroll
    they translate and rotate in 3D, and because they sit at different z they
    parallax against each other and the marble.
  - The camera eases with pointer + scroll for a gentle three-dimensional feel.
*/

// ---- marble backdrop -------------------------------------------------------

const marbleVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const marbleFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;

  // value noise + fbm
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    vec2 p = uv * 2.2;
    float t = uTime * 0.025 + uScroll * 0.5;

    // domain warp → organic marble flow
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2)),
                  fbm(p + 2.6 * q + vec2(8.3, 2.8)));
    float f = fbm(p + 2.6 * r);

    // thin marble veins from the warped field
    float m = 0.5 + 0.5 * sin((p.x + p.y) * 2.6 + f * 6.2831 + uScroll * 2.2);
    float veins = pow(m, 7.0);

    vec3 white = vec3(0.988, 0.976, 0.966);
    vec3 blush = vec3(1.0, 0.855, 0.90);
    vec3 rose  = vec3(0.98, 0.36, 0.62);

    vec3 col = mix(white, blush, smoothstep(0.32, 0.78, f));
    col = mix(col, rose, veins * 0.45);
    // faint warm vignette so text stays readable at the edges
    float vig = smoothstep(1.25, 0.2, length(vUv - 0.5));
    col = mix(col * 0.985, col, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Marble() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAspect: { value: 1 },
    }),
    [],
  );
  useFrame((state, delta) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    u.uScroll.value += (store.scroll - u.uScroll.value) * 0.06;
    u.uAspect.value = state.size.width / state.size.height;
  });
  // huge plane far back so it always covers the viewport despite camera drift
  return (
    <mesh position={[0, 0, -14]} scale={[viewport.width * 4 + 60, viewport.height * 4 + 60, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={marbleVert} fragmentShader={marbleFrag} depthWrite={false} />
    </mesh>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  useFrame((state) => {
    tickScene();
    const t = state.clock.elapsedTime;
    const compact = size.width < 768;
    const baseZ = compact ? 11 : 8;
    const targetX = store.pointerX * 1.1 + Math.sin(t * 0.1) * 0.3;
    const targetY = store.pointerY * 0.7 - store.scroll * 1.2;
    const targetZ = baseZ - store.scroll * 2.4; // gentle 3D dolly on scroll
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, store.scroll * 0.6, 0);
    camera.rotation.z += (store.pointerX * 0.02 - camera.rotation.z) * 0.05;
  });
  return null;
}

export default function MarbleScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];

  return (
    <Canvas
      dpr={cfg.dpr}
      camera={{ position: [0, 0, 8], fov: 42 }}
      gl={{ antialias: tier !== "low", alpha: false, powerPreference: "high-performance" }}
    >
      <AdaptiveDpr pixelated />
      <color attach="background" args={["#FDFAF6"]} />
      <Marble />
      <CameraRig />
    </Canvas>
  );
}
