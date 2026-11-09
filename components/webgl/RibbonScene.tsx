"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene as store, tickScene, TIER_CONFIG, type DeviceTier } from "@/lib/scene-store";

/*
  The ribbon.

  The brand guide's own cover image is a pink silk ribbon, so this is what the
  site's 3D became: one physical object with a reason to be there, instead of
  a glass world drifting behind everything. It runs the length of the page as
  a literal through-line — beside the masthead, through the gap on the cover,
  between the work — and the scroll pulls it along.

  Cheaper than what it replaces, by a lot. The glass world used `transmission`,
  which renders the whole scene twice per frame. This is one mesh of ~800
  vertices rebuilt in JS each frame, lit by four lights, no post-processing.

  Geometry: a Catmull-Rom spline through hand-placed points, sampled evenly;
  at each sample the binormal is twisted around the tangent by a slow sine, so
  the band ripples like fabric instead of lying flat like tape. Two vertices
  per sample, a strip of quads between them.

  The route is drawn for a 16:10 screen and compressed horizontally on
  narrower ones, so on a phone the band still passes through the page rather
  than living off its edges.
*/

// World units. Camera at z=10, 45° fov → the viewport at z=0 is about ±4.1
// high and ±6.6 wide at 16:10. The page is ~7 viewports, hence the length.
const SCROLL_TRAVEL = 52;
const REF_ASPECT = 1.6;
const POINTS: [number, number, number][] = [
  // right margin, beside the masthead — never across it
  [7.8, 7.0, 0.3], [7.4, 3.2, -0.4],
  // into the cover, through the gap between the line and the image
  [4.0, 0.0, 0.9], [-2.5, -3.0, -0.8], [-7.5, -6.5, 0.4],
  // and on down the issue
  [-5.0, -10.5, -0.6], [3.0, -13.5, 0.9], [7.5, -17.5, -0.5], [2.0, -21.5, 1.0],
  [-6.5, -25.5, -0.9], [-5.5, -30.0, 0.5], [3.0, -34.0, -0.7], [7.0, -38.5, 0.8],
  [1.0, -43.0, -1.0], [-7.0, -47.0, 0.4], [-3.0, -52.0, -0.5], [5.0, -56.0, 0.6],
  [7.8, -60.0, 0.0],
];
// Wide enough to be an event, not a thread. The first pass at 0.55 read as a
// hairline from across the room; on a dark chapter it has to carry colour.
const WIDTH = 0.85;

const SEGMENTS: Record<DeviceTier, number> = { high: 420, mid: 300, low: 200 };

function Ribbon({ segments }: { segments: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  // Horizontal squeeze for narrow screens; never wider than drawn.
  const sx = Math.min(1, Math.max(0.42, size.width / size.height / REF_ASPECT));

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        POINTS.map(([x, y, z]) => new THREE.Vector3(x * sx, y, z)),
        false,
        "centripetal",
      ),
    [sx],
  );

  // Geometry allocated once per segment count; positions rewritten every frame.
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = (segments + 1) * 2;
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const uv = new Float32Array(count * 2);
    const index: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      uv[i * 4] = 0; uv[i * 4 + 1] = t;
      uv[i * 4 + 2] = 1; uv[i * 4 + 3] = t;
      if (i < segments) {
        const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        index.push(a, c, b, b, c, d);
      }
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(index);
    return g;
  }, [segments]);

  // Frames are static along the curve; only the twist changes per frame.
  const frames = useMemo(() => curve.computeFrenetFrames(segments, false), [curve, segments]);
  const points = useMemo(() => curve.getSpacedPoints(segments), [curve, segments]);
  const side = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    tickScene();
    const g = groupRef.current;
    const m = meshRef.current;
    if (!g || !m) return;

    // Scroll pulls the ribbon up.
    g.position.y = store.scroll * SCROLL_TRAVEL;

    // The pointer in the ribbon's own coordinates: the viewport at z=0 is
    // about ±4.1 high, ±4.1·aspect wide, and the group has scrolled up.
    const aspect = size.width / size.height;
    const px = store.pointerX * 4.1 * aspect;
    const py = store.pointerY * 4.1 - g.position.y;

    const time = store.reduced ? 0 : state.clock.elapsedTime;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = points[i];
      // Real deformation, not a translate: where the band passes near the
      // pointer it is drawn toward it, and the pull falls off with distance,
      // so it bends like fabric someone is reaching for.
      const dx = px - p.x;
      const dy = py - p.y;
      const dist = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - dist / 5.5) * 1.6;
      const bx = dist > 0.001 ? (dx / dist) * pull : 0;
      const by = dist > 0.001 ? (dy / dist) * pull : 0;
      // A fuller twist than tape would take: the folds are where silk catches
      // light, and without them the band reads as a flat stroke of colour.
      const twist = Math.sin(t * 16 + time * 1.2) * 0.75 + Math.sin(t * 6 - time * 0.7) * 0.4;
      side.copy(frames.binormals[i]).applyAxisAngle(frames.tangents[i], twist).multiplyScalar(WIDTH / 2);
      pos.setXYZ(i * 2, p.x + bx - side.x, p.y + by - side.y, p.z - side.z);
      pos.setXYZ(i * 2 + 1, p.x + bx + side.x, p.y + by + side.y, p.z + side.z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
        {/*
          Silk, not plastic: sheen is what gives fabric its soft edge-light,
          and the sheen colour is a pale brand Rosé so highlights stay in the
          palette instead of blowing out to white.
        */}
        <meshPhysicalMaterial
          color="#FB003F"
          roughness={0.38}
          metalness={0}
          sheen={1}
          sheenColor="#FFB3CC"
          sheenRoughness={0.3}
          clearcoat={0.35}
          clearcoatRoughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function RibbonScene() {
  const tier: DeviceTier = store.tier;
  const cfg = TIER_CONFIG[tier];

  return (
    <Canvas
      dpr={cfg.worldDpr}
      camera={{ position: [0, 0, 10], fov: 45 }}
      // Transparent: the paper underneath is the background. One mesh with
      // real edges, so MSAA is worth having here.
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Key from high right, a warm fill from the low left, a rim from
          behind so the folds separate from the paper. */}
      {/* Ground light in Rosé, not burgundy: the shadow side of silk is a
          deeper pink, and a dark red underside read as rust on paper. */}
      <hemisphereLight args={["#fff6ea", "#ff7fa8", 0.8]} />
      <directionalLight position={[5, 8, 7]} intensity={2.4} color="#fffaf3" />
      <directionalLight position={[-6, -2, 5]} intensity={0.8} color="#ff5c9e" />
      <directionalLight position={[0, 3, -8]} intensity={1.2} color="#ffd6e4" />
      <Ribbon segments={SEGMENTS[tier]} />
    </Canvas>
  );
}
