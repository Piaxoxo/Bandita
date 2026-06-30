"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { studio, tickStudio } from "@/lib/studio-scene";
import { ROOMS } from "@/components/studio/studio-data";

const CREME = new THREE.Color("#FCF6EC");
const PINK = new THREE.Color("#FB003F");

/* glowing wireframe holo-object per room — appears when its room is active */
function Motif({ kind, color, sectionIndex, compact }: { kind: string; color: string; sectionIndex: number; compact: boolean }) {
  const g = useRef<THREE.Group>(null);
  const str = useRef(0);
  const c = useMemo(() => new THREE.Color(color).multiplyScalar(1.6), [color]);
  useFrame((s, delta) => {
    if (!g.current) return;
    const target = studio.active === sectionIndex ? 1 : 0;
    str.current += (target - str.current) * Math.min(1, delta * 2.4);
    const v = str.current;
    g.current.visible = v > 0.01;
    if (!g.current.visible) return;
    const t = s.clock.elapsedTime;
    g.current.position.set((compact ? 0 : 2.0) + studio.pointerX * 0.7, studio.pointerY * 0.45 + Math.sin(t * 0.5) * 0.18, 0);
    g.current.rotation.y = t * 0.25 + studio.pointerX * 0.35;
    g.current.rotation.x = Math.sin(t * 0.3) * 0.22 - studio.pointerY * 0.25;
    g.current.scale.setScalar(v * (compact ? 1.5 : 2.1));
  });
  const M = () => <meshBasicMaterial color={c} wireframe transparent opacity={0.92} blending={THREE.AdditiveBlending} depthWrite={false} />;
  return (
    <group ref={g} visible={false}>
      {kind === "spark" && (
        <mesh>
          <icosahedronGeometry args={[1.0, 1]} />
          <M />
        </mesh>
      )}
      {kind === "heist" &&
        [-0.7, 0, 0.7].map((z, i) => (
          <mesh key={i} position={[i * 0.25, -i * 0.2, z]} rotation={[0, 0.2, 0]}>
            <planeGeometry args={[1.7, 1.05, 3, 2]} />
            <M />
          </mesh>
        ))}
      {kind === "takeover" &&
        [
          [0, 0.7, 0],
          [-0.9, -0.2, 0.4],
          [0.9, -0.1, -0.3],
          [0.2, -0.9, 0.5],
          [-0.5, 0.4, -0.5],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} rotation={[0, i * 0.4, i * 0.2]}>
            <planeGeometry args={[0.62, 1.05, 2, 3]} />
            <M />
          </mesh>
        ))}
      {kind === "experience" && (
        <>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[1.1, 0.34, 10, 28]} />
            <M />
          </mesh>
          <mesh>
            <ringGeometry args={[0.2, 0.28, 24]} />
            <M />
          </mesh>
        </>
      )}
      {kind === "vault" &&
        [-0.85, 0, 0.85].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[1.6, 0.62, 1.2]} />
            <M />
          </mesh>
        ))}
    </group>
  );
}

function RoomMotifs({ compact }: { compact: boolean }) {
  return (
    <>
      {ROOMS.filter((r) => r.id !== "partnership").map((r, i) => {
        const idx = 2 + ROOMS.findIndex((x) => x.id === r.id);
        return <Motif key={r.id} kind={r.id} color={r.color} sectionIndex={idx} compact={compact} />;
      })}
    </>
  );
}

/* sample "BANDITA" into evenly spaced points (the Partnership climax target) */
function sampleWord(count: number): [number, number][] | null {
  const cw = 1024, ch = 256;
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 168px 'Bodoni Moda', Georgia, serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("BANDITA", cw / 2, ch / 2 + 4);
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const gap = 4;
  let raw: [number, number][] = [];
  for (let y = 0; y < ch; y += gap) for (let x = 0; x < cw; x += gap) if (data[(y * cw + x) * 4 + 3] > 128) raw.push([x / cw - 0.5, -(y / ch - 0.5)]);
  if (!raw.length) return null;
  if (raw.length > count) {
    const stride = Math.ceil(raw.length / count);
    raw = raw.filter((_, k) => k % stride === 0);
  }
  return raw;
}

function World({ count, compact }: { count: number; compact: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const bgRef = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { size, camera } = useThree();
  const merge = useRef(0);
  const col = useMemo(() => new THREE.Color("#FCF6EC"), []);

  const buffers = useMemo(() => {
    const word = sampleWord(count) ?? [[0, 0]];
    const n = Math.max(word.length, 800);
    const ambient = new Float32Array(n * 3);
    const target = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const wordW = size.width < 768 ? 6.5 : 9.5;
    for (let i = 0; i < n; i++) {
      const w = word[i % word.length];
      target[i * 3] = w[0] * wordW;
      target[i * 3 + 1] = w[1] * wordW * 0.25; // word canvas is 1024×256 (4:1)
      target[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      ambient[i * 3] = (Math.random() - 0.5) * 26;
      ambient[i * 3 + 1] = (Math.random() - 0.5) * 16;
      ambient[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      seed[i] = Math.random();
      const c = Math.random() < 0.84 ? CREME : PINK;
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }
    return { ambient, target, seed, color, n };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const uniforms = useMemo(
    () => ({ uMerge: { value: 0 }, uTime: { value: 0 }, uSize: { value: 2.4 }, uPix: { value: 1 }, uPointer: { value: new THREE.Vector2() } }),
    [],
  );
  const bgUniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#FCF6EC") } }), []);

  useFrame((s, delta) => {
    tickStudio();
    const u = matRef.current?.uniforms;
    if (u) {
      merge.current += (studio.partnership - merge.current) * Math.min(1, delta * 2.5);
      u.uMerge.value = merge.current;
      u.uTime.value = s.clock.elapsedTime;
      u.uPix.value = Math.min(s.gl.getPixelRatio(), 2);
      u.uPointer.value.set(studio.pointerX, studio.pointerY);
    }
    // colour flood eased toward the active room
    col.lerp(new THREE.Color(studio.color), Math.min(1, delta * 2.2));
    if (bgRef.current) (bgRef.current.uniforms.uColor.value as THREE.Color).copy(col);
    if (group.current) {
      group.current.rotation.y += (studio.pointerX * 0.12 - group.current.rotation.y) * 0.04;
      group.current.rotation.x += (-studio.pointerY * 0.08 - group.current.rotation.x) * 0.04;
    }
    camera.position.x += (studio.pointerX * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (studio.pointerY * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <mesh position={[0, 0, -14]} scale={[80, 50, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={bgRef}
          uniforms={bgUniforms}
          depthWrite={false}
          vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
          fragmentShader={`precision mediump float; varying vec2 vUv; uniform vec3 uColor;
            void main(){ float d=distance(vUv,vec2(0.5));
              vec3 c=uColor*(1.0-d*0.45) + uColor*smoothstep(0.45,0.0,d)*0.35 + vec3(1.0)*smoothstep(0.28,0.0,d)*0.12;
              gl_FragColor=vec4(c,1.0); }`}
        />
      </mesh>
      <group ref={group}>
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
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            vertexShader={`
              attribute vec3 aTarget; attribute vec3 aAmbient; attribute float aSeed; attribute vec3 aColor;
              uniform float uMerge; uniform float uTime; uniform float uSize; uniform float uPix; uniform vec2 uPointer;
              varying vec3 vColor; varying float vA;
              void main(){
                vColor=aColor; float a=aSeed*6.2831;
                vec3 amb=aAmbient;
                amb.x+=sin(uTime*0.25+a)*1.2; amb.y+=cos(uTime*0.22+a)*1.0; amb.z+=sin(uTime*0.18+a*0.5)*1.2;
                vec3 pos=mix(amb,aTarget,smoothstep(0.0,1.0,uMerge));
                vec2 d=pos.xy-uPointer*6.0; float dist=length(d)+0.001;
                pos.xy+=(d/dist)*smoothstep(3.0,0.0,dist)*(1.0-uMerge*0.7)*0.8;
                vec4 mv=modelViewMatrix*vec4(pos,1.0);
                gl_PointSize=uSize*uPix*(0.5+aSeed*0.8)*(15.0/-mv.z);
                gl_Position=projectionMatrix*mv;
                vA=mix(0.35,1.0,uMerge);
              }`}
            fragmentShader={`precision mediump float; varying vec3 vColor; varying float vA;
              void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(vColor, smoothstep(0.5,0.1,d)*vA); }`}
          />
        </points>
      </group>
      <RoomMotifs compact={compact} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={compact ? 0.7 : 1.1} luminanceThreshold={0.45} luminanceSmoothing={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.5} />
        <Noise premultiply opacity={0.035} />
      </EffectComposer>
    </>
  );
}

export default function StudioScene({ compact = false }: { compact?: boolean }) {
  return (
    <Canvas
      dpr={[1, compact ? 1.3 : 1.6]}
      performance={{ min: 0.5 }}
      camera={{ position: [0, 0, 12], fov: 48 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <AdaptiveDpr pixelated />
      <World count={compact ? 3500 : 6000} compact={compact} />
    </Canvas>
  );
}
