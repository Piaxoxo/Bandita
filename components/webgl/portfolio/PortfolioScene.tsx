"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { portfolio, tickPortfolio } from "@/lib/portfolio-scene";
import { STATIONS, type Station } from "@/components/portfolio/portfolio-data";

const SPACING = 17;
const FIRST = -13;
const RANGE = 10;
const HOLD = 4.2; // camera range over which a station stays fully revealed
const SWEET = 8; // station sits this far AHEAD of the camera at peak (head-on view)
const sideXFor = (side: number, compact: boolean) => side * (compact ? 1.4 : 2.7);
const stationZ = (i: number) => FIRST - i * SPACING;
const TRAVEL_START = 7;
const TRAVEL_END = stationZ(STATIONS.length - 1) + 3;

// focus (0..1, plateau hold) for a station, peaking while it's ahead in view
function viewFocus(camZ: number, sZ: number) {
  const d = camZ - sZ - SWEET;
  return 1 - THREE.MathUtils.smoothstep(Math.abs(d), HOLD, RANGE);
}

/* ───────── floating dust / starfield ───────── */
function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { buf } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 2] = -Math.random() * (Math.abs(TRAVEL_END) + 30);
      seed[i] = Math.random();
    }
    return { buf: { pos, seed } };
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPix: { value: 1 } }),
    [],
  );

  useFrame((s) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = s.clock.elapsedTime;
      mat.current.uniforms.uPix.value = Math.min(s.gl.getPixelRatio(), 2);
    }
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buf.pos, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[buf.seed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aSeed; uniform float uTime; uniform float uPix; varying float vA;
          void main(){
            vec3 p = position;
            p.x += sin(uTime*0.15 + aSeed*6.28)*0.6;
            p.y += cos(uTime*0.12 + aSeed*6.28)*0.5;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_PointSize = (0.6 + aSeed*1.4) * uPix * (18.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
            vA = 0.25 + aSeed*0.5;
          }`}
        fragmentShader={`
          precision mediump float; varying float vA;
          void main(){
            float d = length(gl_PointCoord-0.5); if(d>0.5) discard;
            gl_FragColor = vec4(vec3(1.0,0.93,0.86), smoothstep(0.5,0.0,d)*vA);
          }`}
      />
    </points>
  );
}

/* ───────── one image/video plane with a develop reveal ───────── */
const planeVert = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const planeFrag = `
  precision highp float;
  uniform sampler2D uTex; uniform float uReveal; uniform float uTime; uniform float uOpacity; uniform vec3 uTint;
  uniform float uGlass; uniform float uScan; uniform float uDevelop; uniform float uBloom;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  void main(){
    float bias = (1.0-uReveal)*3.0;
    vec3 col = texture2D(uTex, vUv, bias).rgb;

    // particle "develop" dissolve (only when uDevelop)
    float t = hash(floor(vUv*vec2(340.0,220.0)))*0.9;
    float visD = smoothstep(t-0.05, t+0.05, uReveal);
    float front = (1.0-smoothstep(0.0,0.09,abs(uReveal-t)))*step(0.012,uReveal)*(1.0-step(0.99,uReveal));
    col += uTint * front * 1.4 * uDevelop;
    float vis = mix(smoothstep(0.0,0.18,uReveal), visD, uDevelop);

    // frame rim (extra for glass/vitrine)
    float b = min(min(vUv.x,1.0-vUv.x), min(vUv.y,1.0-vUv.y));
    col += uTint * smoothstep(0.05,0.0,b) * (0.5 + uGlass*0.9);
    col += vec3(1.0) * smoothstep(0.018,0.0,b) * uGlass * 0.5; // bright glass edge

    // screen scanlines + a power-on sync wipe (video)
    col *= 1.0 - uScan * 0.10 * step(0.5, fract(vUv.y*200.0));
    float sync = (1.0-smoothstep(0.0,0.06,abs(uReveal - vUv.y))) * (1.0-step(0.99,uReveal));
    col += vec3(1.0) * sync * uScan * 0.6;

    // bloom-in flare while forming
    col += col * uBloom * (1.0 - uReveal) * 0.7;

    // sheen sweep
    float sw = abs(fract((vUv.x+vUv.y)*0.5 - uTime*0.05)-0.5);
    col += vec3(1.0)*smoothstep(0.5,0.47,sw)*0.1*vis;
    gl_FragColor = vec4(col, vis*uOpacity);
  }
`;

const STYLE_FLAGS: Record<string, { glass: number; scan: number; develop: number; bloom: number }> = {
  develop: { glass: 0, scan: 0, develop: 1, bloom: 0 },
  rise: { glass: 0, scan: 0, develop: 0, bloom: 0 },
  spin: { glass: 0, scan: 0, develop: 0, bloom: 0 },
  glass: { glass: 1, scan: 0, develop: 0, bloom: 0 },
  screen: { glass: 0, scan: 1, develop: 0, bloom: 0 },
  bloom: { glass: 0, scan: 0, develop: 0, bloom: 1 },
};

function Frame({
  texture,
  w,
  h,
  pos,
  tint,
  getFocus,
  rotBias = 0,
  style = "develop",
}: {
  texture: THREE.Texture;
  w: number;
  h: number;
  pos: [number, number, number];
  tint: THREE.Color;
  getFocus: () => { focus: number; pass: number };
  rotBias?: number;
  style?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const eased = useRef(0);
  const flags = STYLE_FLAGS[style] ?? STYLE_FLAGS.develop;
  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTint: { value: tint },
      uGlass: { value: flags.glass },
      uScan: { value: flags.scan },
      uDevelop: { value: flags.develop },
      uBloom: { value: flags.bloom },
    }),
    [texture, tint, flags],
  );
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  useFrame((s, delta) => {
    const m = mesh.current,
      u = matRef.current?.uniforms;
    if (!m || !u) return;
    const { focus, pass } = getFocus();
    eased.current += (focus - eased.current) * Math.min(1, delta * 3.5);
    const f = eased.current;
    m.visible = f > 0.01;
    if (!m.visible) return;
    const t = s.clock.elapsedTime;
    const e = 1 - f; // 1 when far/unformed, 0 at full reveal — drives the entrance
    const riseY = style === "rise" ? e * 3.4 : 0;
    const spin = style === "spin" ? e * (rotBias <= 0 ? 1 : -1) * 1.1 : 0;
    const bloomScale = style === "bloom" ? 0.55 + f * 0.45 : 1;
    m.position.set(
      pos[0] + portfolio.pointerX * 0.5,
      pos[1] + riseY + Math.sin(t * 0.5 + pos[0]) * 0.08 + portfolio.pointerY * 0.35,
      pos[2],
    );
    m.rotation.y = rotBias + spin + portfolio.pointerX * 0.12 - pass * 0.12;
    m.rotation.x = portfolio.pointerY * 0.08;
    m.rotation.z = Math.sin(t * 0.4 + pos[0]) * 0.01;
    const sc = (0.94 + f * 0.08) * bloomScale;
    m.scale.set(sc, sc, 1);
    u.uReveal.value = f;
    u.uTime.value = t;
    u.uOpacity.value = Math.min(1, f * 1.4);
  });

  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={planeVert}
        fragmentShader={planeFrag}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function PhotoFrame(props: Omit<Parameters<typeof Frame>[0], "texture"> & { url: string }) {
  const texture = useTexture(props.url);
  return <Frame {...props} texture={texture} />;
}

function VideoFrame(
  props: Omit<Parameters<typeof Frame>[0], "texture"> & { url: string; getFocus: () => { focus: number; pass: number } },
) {
  const [tex, setTex] = useState<THREE.VideoTexture | null>(null);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  // Manual, non-suspending VideoTexture. The element is muted + playsInline and
  // lives (1px, hidden) in the DOM so iOS Safari will autoplay it.
  useEffect(() => {
    const v = document.createElement("video");
    v.src = props.url;
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.autoplay = true;
    v.preload = "auto";
    v.crossOrigin = "anonymous";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.playsInline = true;
    Object.assign(v.style, {
      position: "fixed",
      left: "-10px",
      width: "1px",
      height: "1px",
      opacity: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(v);
    const t = new THREE.VideoTexture(v);
    t.colorSpace = THREE.SRGBColorSpace;
    v.play().catch(() => {});
    vidRef.current = v;
    setTex(t);
    return () => {
      t.dispose();
      v.pause();
      v.removeAttribute("src");
      v.remove();
    };
  }, [props.url]);

  useFrame(() => {
    const v = vidRef.current;
    if (!v) return;
    const near = props.getFocus().focus > 0.02;
    if (near && v.paused) v.play().catch(() => {});
    else if (!near && !v.paused) v.pause();
  });

  if (!tex) return null;
  return <Frame {...props} texture={tex} />;
}

/* ───────── volumetric halo — a spotlight glow behind a work ───────── */
function Halo({
  getFocus,
  color,
  size,
  pos,
}: {
  getFocus: () => { focus: number; pass: number };
  color: string;
  size: number;
  pos: [number, number, number];
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const eased = useRef(0);
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } }), [color]);
  useFrame((s, delta) => {
    const m = mesh.current,
      u = matRef.current?.uniforms;
    if (!m || !u) return;
    const { focus } = getFocus();
    eased.current += (focus - eased.current) * Math.min(1, delta * 3);
    m.visible = eased.current > 0.01;
    if (!m.visible) return;
    const t = s.clock.elapsedTime;
    m.position.set(pos[0] + portfolio.pointerX * 0.5, pos[1] + portfolio.pointerY * 0.35, pos[2] - 1.4);
    m.scale.setScalar((0.9 + eased.current * 0.35) * (1 + Math.sin(t * 0.6 + pos[0]) * 0.03));
    u.uOpacity.value = eased.current * 0.5;
  });
  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`precision mediump float; varying vec2 vUv; uniform vec3 uColor; uniform float uOpacity;
          void main(){ float d=length(vUv-0.5); float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(uColor, a*a*uOpacity); }`}
      />
    </mesh>
  );
}

/* a slowly rotating carousel — the orbit "world" (tourism finale) */
function OrbitGroup({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = s.clock.elapsedTime * 0.12 + portfolio.pointerX * 0.3;
  });
  return <group ref={g}>{children}</group>;
}

type Spec = { src: string; isVideo?: boolean; w: number; h: number; x: number; y: number; dz: number; rot: number };

// Each station gets its own spatial "world" — a distinct arrangement of its media.
function layoutFor(st: Station, W: number, H: number, sideX: number, compact: boolean): { specs: Spec[]; orbit: boolean } {
  const img = st.images;
  const vid = st.video ?? [];
  switch (st.id) {
    case "wiener-restaurant": // glass vitrines — two tall cases
      return { orbit: false, specs: [
        { src: img[0], w: W, h: H, x: -W * 0.62, y: 0, dz: 0, rot: 0.18 },
        { src: img[1], w: W, h: H, x: W * 0.62, y: 0, dz: -0.5, rot: -0.18 },
      ] };
    case "innsider": // light-cone tasting — dishes stacked in a beam
      return { orbit: false, specs: [
        { src: img[0], w: W, h: H, x: sideX, y: H * 0.62, dz: 0, rot: -st.side * 0.1 },
        { src: img[1], w: W * 0.82, h: H * 0.82, x: sideX, y: -H * 0.18, dz: -1.4, rot: -st.side * 0.06 },
        { src: img[2], w: W * 0.66, h: H * 0.66, x: sideX, y: -H * 0.92, dz: -2.8, rot: -st.side * 0.04 },
      ] };
    case "deutschland": // cinema void — one big screen
      return { orbit: false, specs: [{ src: vid[0], isVideo: true, w: W * 1.5, h: H * 1.5, x: 0, y: 0, dz: 0, rot: 0 }] };
    case "wiener-bar": // neon fan — frames in an arc
      return { orbit: false, specs: (compact ? img.slice(0, 3) : img).map((src, k, a) => {
        const c = (a.length - 1) / 2;
        return { src, w: W * 0.6, h: H * 0.6, x: (k - c) * W * 0.4, y: Math.abs(k - c) * 0.5 - 0.4, dz: -Math.abs(k - c) * 1.4, rot: (k - c) * 0.16 };
      }) };
    case "kern": // calm atrium — banners spread wide
      return { orbit: false, specs: img.map((src, k) => ({ src, w: W * 0.78, h: H * 0.78, x: (k - 1) * (compact ? 2.4 : 4.2), y: 0, dz: -Math.abs(k - 1) * 1.0, rot: -(k - 1) * 0.12 })) };
    case "portugal": { // reels swarm — vertical panels in an arc
      const four = compact ? [vid[0], vid[1]] : [vid[0], vid[1], vid[0], vid[1]];
      const c = (four.length - 1) / 2;
      return { orbit: false, specs: four.map((src, k) => ({ src, isVideo: true, w: W * 0.72, h: H * 0.72, x: (k - c) * (compact ? 2.0 : 2.5), y: k % 2 ? 0.4 : -0.4, dz: -Math.abs(k - c) * 1.5, rot: (k - c) * 0.14 })) };
    }
    case "besser-reisen": // film stills staggered into depth
      return { orbit: false, specs: img.map((src, k) => ({ src, w: W * (1 - k * 0.14), h: H * (1 - k * 0.14), x: sideX + k * (compact ? 0.8 : 1.5), y: k * 0.5 - 0.3, dz: -k * 3.2, rot: -st.side * 0.06 })) };
    case "tourism-international": { // orbit finale — frames circling
      const n = img.length;
      const R = compact ? 3.2 : 5;
      return { orbit: true, specs: img.map((src, k) => {
        const a = (k / n) * Math.PI * 2;
        return { src, w: W * 0.72, h: H * 0.72, x: Math.cos(a) * R, y: 0, dz: Math.sin(a) * R, rot: -a + Math.PI };
      }) };
    }
    default:
      return { orbit: false, specs: [{ src: img[0], w: W, h: H, x: sideX, y: 0, dz: 0, rot: -st.side * 0.12 }] };
  }
}

/* ───────── a station = its own spatial world ───────── */
function StationGroup({ station, index, compact }: { station: Station; index: number; compact: boolean }) {
  const { camera } = useThree();
  const z = stationZ(index);
  const tint = useMemo(() => new THREE.Color(station.color), [station.color]);
  const portrait = station.orientation === "portrait";
  const baseW = compact ? (portrait ? 3.6 : 6) : portrait ? 4.4 : 7.4;
  const baseH = portrait ? baseW * 1.4 : baseW * 0.62;
  const sideX = sideXFor(station.side, compact);

  const focusFor = (offset: number) => () => {
    const focus = viewFocus(camera.position.z, z + offset);
    const pass = Math.max(-1, Math.min(1, (camera.position.z - (z + offset) - SWEET) / RANGE));
    return { focus, pass };
  };

  const lay = useMemo(() => layoutFor(station, baseW, baseH, sideX, compact), [station, baseW, baseH, sideX, compact]);

  const frames = lay.specs.map((sp, k) => {
    const F = sp.isVideo ? VideoFrame : PhotoFrame;
    return (
      <F
        key={`${station.id}-${k}`}
        url={sp.src}
        w={sp.w}
        h={sp.h}
        pos={[sp.x, station.y + sp.y, z + sp.dz]}
        tint={tint}
        getFocus={focusFor(lay.orbit ? 0 : sp.dz)}
        rotBias={sp.rot}
        style={station.reveal}
      />
    );
  });

  return (
    <group>
      <Halo getFocus={focusFor(0)} color={station.color} size={Math.max(baseW, baseH) * 2.6} pos={[lay.orbit ? 0 : sideX, station.y, z]} />
      {lay.orbit ? <OrbitGroup>{frames}</OrbitGroup> : frames}
    </group>
  );
}

/* ───────── camera travel + mood lighting ───────── */
function Rig({ compact }: { compact: boolean }) {
  const { camera, scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2("#08070a", 0.018), []);
  const tintCol = useMemo(() => new THREE.Color("#08070a"), []);
  const moodCol = useMemo(() => new THREE.Color("#08070a"), []);
  useMemo(() => {
    scene.fog = fog;
  }, [scene, fog]);

  useFrame(() => {
    tickPortfolio();
    const z = THREE.MathUtils.lerp(TRAVEL_START, TRAVEL_END, portfolio.progress);
    camera.position.x += (portfolio.pointerX * 1.2 - camera.position.x) * 0.05;
    camera.position.y += (portfolio.pointerY * 0.8 - camera.position.y) * 0.05;
    camera.position.z += (z - camera.position.z) * 0.08;

    // station currently in the viewing sweet spot → mood + active index
    let nearest = -1,
      amt = 0;
    for (let i = 0; i < STATIONS.length; i++) {
      const f = viewFocus(camera.position.z, stationZ(i));
      if (f > amt) {
        amt = f;
        nearest = i;
      }
    }
    portfolio.active = amt > 0.12 ? nearest : -1;

    // turn the camera toward the approaching station so it comes to centre
    const sx = nearest >= 0 ? sideXFor(STATIONS[nearest].side, compact) : 0;
    const sy = nearest >= 0 ? STATIONS[nearest].y : 0;
    const lookX = portfolio.pointerX * 0.5 + sx * amt * 0.6;
    const lookY = portfolio.pointerY * 0.35 + sy * amt * 0.5;
    camera.lookAt(lookX, lookY, camera.position.z - 10);

    moodCol.set(nearest >= 0 ? STATIONS[nearest].color : "#08070a");
    tintCol.set("#08070a").lerp(moodCol, amt * 0.18);
    fog.color.copy(tintCol);
  });
  return null;
}

function Inner({ compact, dust }: { compact: boolean; dust: number }) {
  return (
    <>
      <color attach="background" args={["#08070a"]} />
      <ambientLight intensity={0.7} />
      <Rig compact={compact} />
      <Dust count={dust} />
      {STATIONS.map((st, i) => (
        <Suspense key={st.id} fallback={null}>
          <StationGroup station={st} index={i} compact={compact} />
        </Suspense>
      ))}
      <EffectComposer multisampling={0}>
        <Bloom intensity={compact ? 0.8 : 1.25} luminanceThreshold={0.22} luminanceSmoothing={0.5} mipmapBlur radius={0.8} />
        <ChromaticAberration offset={new THREE.Vector2(0.0004, 0.0004)} radialModulation={false} modulationOffset={0} />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
        <Noise premultiply opacity={compact ? 0.03 : 0.05} />
      </EffectComposer>
    </>
  );
}

export default function PortfolioScene({ compact = false }: { compact?: boolean }) {
  const dust = compact ? 1600 : 3200;
  return (
    <Canvas
      dpr={[1, compact ? 1.4 : 1.8]}
      camera={{ position: [0, 0, TRAVEL_START], fov: 52 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <Inner compact={compact} dust={dust} />
    </Canvas>
  );
}
