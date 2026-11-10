"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
  The cinema camera, as a real model.

  Loads /models/kinokamera.glb when the agency delivers one (from Tripo or
  anywhere else). Until that file exists the slot renders nothing — a
  missing model is not an error, it is a space kept free. The boundary
  swallows the 404 so the rest of the hall is unaffected.

  The delivered model (Tripo, from the set photograph) was 873k triangles
  and 26 MB; it ships simplified to 122k and Draco-compressed to 0.8 MB.
  Textures stay JPEG: converted to WebP they rendered the whole frame
  blue in the headless check, and that is not a risk worth 150 kB. Its
  bounding box is ~0.8 × 1.0 × 0.45 with the origin at the base, so
  `scale` is roughly the rig's height in world units.
*/

export const KAMERA_URL = "/models/kinokamera.glb";

class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Model({ scale, ...props }: { scale: number } & JSX.IntrinsicElements["group"]) {
  // Draco-compressed (26 MB from Tripo → 0.6 MB); the decoder is served
  // from /draco, not a CDN
  const { scene } = useGLTF(KAMERA_URL, "/draco/");
  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.envMapIntensity = 1.4;
        m.castShadow = false;
      }
    });
  }, [scene]);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = ((props.rotation as THREE.Euler | undefined)?.y ?? 0) + Math.sin(t * 0.35) * 0.08;
    g.rotation.x = Math.sin(t * 0.5) * 0.03;
  });
  return (
    <group ref={group} {...props} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

export default function KameraModel(props: { scale: number } & JSX.IntrinsicElements["group"]) {
  // ask first, so a missing model never even reaches the loader (and the
  // console stays clean until the file is there)
  const [exists, setExists] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(KAMERA_URL, { method: "HEAD" })
      .then((r) => { if (live) setExists(r.ok); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  if (!exists) return null;
  return (
    <Quiet>
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </Quiet>
  );
}
