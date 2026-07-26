"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { portfolio } from "@/lib/portfolio-scene";

/* A calm, continuous 3D dust space that lives behind BOTH the overview wall and
   the open project — so switching modes feels like moving inside one world.
   The particle tint eases toward the active project's mood colour. */
function Dust({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const tint = useRef(new THREE.Color(0.55, 0.45, 0.5));
  const buf = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = -Math.random() * 40;
      seed[i] = Math.random();
    }
    return { pos, seed };
  }, [count]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPix: { value: 1 }, uTint: { value: new THREE.Color(0.55, 0.45, 0.5) } }),
    [],
  );
  useFrame((s, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = s.clock.elapsedTime;
    mat.current.uniforms.uPix.value = Math.min(s.gl.getPixelRatio(), 2);
    const [r, g, b] = portfolio.mood;
    tint.current.lerp(new THREE.Color(r, g, b), Math.min(1, delta * 1.4));
    mat.current.uniforms.uTint.value.copy(tint.current);
  });
  return (
    <points frustumCulled={false}>
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
          void main(){ vec3 p=position;
            p.x+=sin(uTime*0.12+aSeed*6.28)*0.7; p.y+=cos(uTime*0.1+aSeed*6.28)*0.5;
            p.z=mod(p.z + uTime*0.25, 40.0) - 40.0;
            vec4 mv=modelViewMatrix*vec4(p,1.0);
            gl_PointSize=(0.5+aSeed*1.5)*uPix*(16.0/-mv.z);
            gl_Position=projectionMatrix*mv; vA=0.12+aSeed*0.4; }`}
        fragmentShader={`precision mediump float; varying float vA; uniform vec3 uTint;
          void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard;
            vec3 c=mix(vec3(1.0,0.95,0.9), uTint, 0.55);
            gl_FragColor=vec4(c, smoothstep(0.5,0.0,d)*vA); }`}
      />
    </points>
  );
}

function Drift() {
  useFrame((s) => {
    // very slow parallax toward the pointer for a living-space feel
    const cam = s.camera;
    cam.position.x += (portfolio.pointerX * 1.4 - cam.position.x) * 0.03;
    cam.position.y += (portfolio.pointerY * 0.9 - cam.position.y) * 0.03;
    cam.lookAt(0, 0, -12);
  });
  return null;
}

export default function PortfolioAtmosphere({ compact = false }: { compact?: boolean }) {
  const count = compact ? 900 : 2000;
  return (
    <Canvas
      dpr={[1, compact ? 1.2 : 1.5]}
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <AdaptiveDpr pixelated />
      <Drift />
      <Dust count={count} />
    </Canvas>
  );
}
