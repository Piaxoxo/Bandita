"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { aboutScene } from "@/lib/about-scene";

// Real Bandita work — floated as premium prints (and one moving reel) through
// the story. Each item carries its own aspect so portraits never stretch.
type PlateItem = { src: string; aspect: number; video?: boolean; poster?: string };
const ITEMS: PlateItem[] = [
  { src: "/about/work/real-nightlife.jpg", aspect: 1.5 }, // 0  Der Name
  { src: "/about/work/real-makeup.jpg", aspect: 0.665 }, // 1  Warum wir
  { src: "/about/work/real-jchoerl.jpg", aspect: 0.5625 }, // 2  Psychologie
  { src: "/about/work/campaign-02.jpg", aspect: 1.5 }, // 3  Was wir tun
  { src: "/about/work/real-reel.mp4", aspect: 0.5625, video: true, poster: "/about/work/real-reel-poster.jpg" }, // 4  Focal reel
  { src: "/about/work/campaign-06.jpg", aspect: 1.5 }, // 5  Manifest
];

// base pose per plate — biased right (body copy sits left); index 4 is the
// dedicated focal moment (centred + larger). Staggered depth/height for variety.
const LAYOUT = [
  { x: 2.7, y: 0.4, z: -1.0, sc: 1.0 }, // 0  Der Name
  { x: 2.7, y: -0.2, z: -1.2, sc: 1.0 }, // 1  Warum wir
  { x: 2.7, y: 0.4, z: -1.0, sc: 1.0 }, // 2  Psychologie
  { x: 2.7, y: -0.2, z: -1.1, sc: 1.0 }, // 3  Was wir tun
  { x: 1.3, y: 0.1, z: -0.4, sc: 1.28 }, // 4  Focal — the reel
  { x: 2.6, y: 0.2, z: -1.2, sc: 1.0 }, // 5  Manifest
];

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Premium print look: clean image, gentle photographic vignette, a thin dark
// edge for depth. No neon rim, no HDR sparkle, no specular sweep — nothing for
// the Bloom pass to blow out into a cheap glow.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uAspect;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    // cheap depth-of-field — blurred while unformed, snaps sharp when revealed
    float bias = (1.0 - uReveal) * 2.6;
    vec3 col = texture2D(uTex, vUv, bias).rgb;

    // clean dissolve reveal — neutral grain, no colour cast
    float t = hash(floor(vUv * vec2(300.0, 200.0))) * 0.82;
    float vis = smoothstep(t - 0.06, t + 0.06, uReveal);

    // distance to nearest edge, aspect-corrected so the frame is even
    vec2 e = vec2(min(vUv.x, 1.0 - vUv.x) * uAspect, min(vUv.y, 1.0 - vUv.y));
    float b = min(e.x, e.y);

    // subtle photographic vignette — richer, more premium falloff
    col *= smoothstep(0.0, 0.16, b) * 0.14 + 0.86;
    // thin dark edge for depth (a floating print, not a glowing card)
    col *= 1.0 - smoothstep(0.010, 0.0, b) * 0.45;

    gl_FragColor = vec4(col, vis * uOpacity);
  }
`;

function useConfiguredTexture(tex: THREE.Texture) {
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  }, [tex]);
}

function PlateMesh({
  index,
  tex,
  aspect,
  compact,
  onNear,
}: {
  index: number;
  tex: THREE.Texture;
  aspect: number;
  compact: boolean;
  onNear?: (near: boolean) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const ease = useRef({ rev: 0, pass: 0 });
  const L = LAYOUT[index];
  const xFac = compact ? 0.34 : 1; // pull plates toward centre on phones
  const yBias = compact ? -0.4 : 0;

  // aspect-aware plane: landscape fills a target width, portrait a target height
  const [w, h] = useMemo(() => {
    const BW = compact ? 5.0 : 6.0;
    const BH = compact ? 4.6 : 5.4;
    return aspect >= 1 ? [BW, BW / aspect] : [BH * aspect, BH];
  }, [aspect, compact]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uReveal: { value: 0 },
      uOpacity: { value: 0 },
      uAspect: { value: aspect },
    }),
    [tex, aspect],
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    const u = matRef.current?.uniforms;
    if (!m || !u) return;
    const ps = aboutScene.plates[index] ?? { reveal: 0, pass: 0 };

    // smooth the scroll-driven values for a floaty, lag-eased flow
    const k = Math.min(1, delta * 4);
    ease.current.rev += (ps.reveal - ease.current.rev) * k;
    ease.current.pass += (ps.pass - ease.current.pass) * k;
    const r = ease.current.rev;
    const p = ease.current.pass;

    const near = r > 0.02;
    onNear?.(near);
    m.visible = r > 0.01;
    if (!m.visible) return;

    const t = state.clock.elapsedTime;
    // gentle idle float so a held plate still breathes in 3D space
    const bobY = Math.sin(t * 0.5 + index) * 0.07;
    const driftY = Math.sin(t * 0.3 + index * 1.7) * 0.03;

    m.position.x = L.x * xFac + p * 1.0 + aboutScene.pointerX * 0.5;
    m.position.y = L.y + yBias + bobY + aboutScene.pointerY * 0.35;
    m.position.z = L.z + p * 3.4;
    m.rotation.y = -p * 0.42 + driftY + aboutScene.pointerX * 0.14;
    m.rotation.x = aboutScene.pointerY * 0.1 + p * 0.05;
    m.rotation.z = Math.sin(t * 0.4 + index) * 0.012;
    const s = (0.92 + r * 0.12) * L.sc;
    m.scale.set(s, s, 1);

    u.uReveal.value = r;
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

function ImagePlate({ index, item, compact }: { index: number; item: PlateItem; compact: boolean }) {
  const tex = useTexture(item.src);
  useConfiguredTexture(tex);
  return <PlateMesh index={index} tex={tex} aspect={item.aspect} compact={compact} />;
}

function VideoPlate({ index, item, compact }: { index: number; item: PlateItem; compact: boolean }) {
  // Poster shows immediately (a real frame, never a black void) and stays until
  // the video has decoded and is actually playing, then we swap to the reel.
  const poster = useTexture(item.poster ?? item.src);
  useConfiguredTexture(poster);
  const [videoTex, setVideoTex] = useState<THREE.VideoTexture | null>(null);
  const [live, setLive] = useState(false);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = document.createElement("video");
    v.src = item.src;
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    Object.assign(v.style, {
      position: "fixed",
      left: "-10px",
      width: "1px",
      height: "1px",
      opacity: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(v);
    const tx = new THREE.VideoTexture(v);
    tx.colorSpace = THREE.SRGBColorSpace;
    const onPlaying = () => setLive(true);
    v.addEventListener("playing", onPlaying);
    vidRef.current = v;
    setVideoTex(tx);
    return () => {
      v.removeEventListener("playing", onPlaying);
      tx.dispose();
      v.pause();
      v.removeAttribute("src");
      v.remove();
    };
  }, [item.src]);

  const onNear = (near: boolean) => {
    const v = vidRef.current;
    if (!v) return;
    if (near && v.paused) v.play().catch(() => {});
    else if (!near && !v.paused) v.pause();
  };

  const tex = live && videoTex ? videoTex : poster;
  return <PlateMesh index={index} tex={tex} aspect={item.aspect} compact={compact} onNear={onNear} />;
}

export default function CampaignPlates() {
  const { size } = useThree();
  const compact = size.width < 768;
  return (
    <group>
      {ITEMS.map((item, i) =>
        item.video ? (
          <VideoPlate key={item.src} index={i} item={item} compact={compact} />
        ) : (
          <ImagePlate key={item.src} index={i} item={item} compact={compact} />
        ),
      )}
    </group>
  );
}
