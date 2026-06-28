"use client";

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { DeviceTier } from "@/lib/scene-store";

// Cinematic post-processing stack. Disabled on low-tier devices.
export default function PostFX({ tier }: { tier: DeviceTier }) {
  if (tier === "low") return null;
  const high = tier === "high";
  return (
    <EffectComposer multisampling={high ? 4 : 0}>
      <Bloom
        intensity={high ? 0.5 : 0.38}
        luminanceThreshold={0.68}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.8}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.6} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.05} />
    </EffectComposer>
  );
}
