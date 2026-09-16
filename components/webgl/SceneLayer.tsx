"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";
import { afterLoad } from "@/lib/defer";

const WorldScene = dynamic(() => import("./WorldScene"), { ssr: false });

/* Soft warm ambient behind the 3D glass world.
   The glow is painted as a wide, multi-stop radial gradient rather than a
   blurred circle: a CSS blur filter on a transform-animated layer forces the
   browser to re-rasterise the whole blur every frame, which was the single
   biggest source of scroll jank site-wide. The gradient looks the same. */
function Ambient() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-creme">
      <div
        className="scene-glow-a absolute right-[-10%] top-[-10%] h-[70vmax] w-[70vmax] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,140,176,0.30) 0%, rgba(255,124,168,0.20) 26%, rgba(255,92,158,0.10) 48%, rgba(255,92,158,0.04) 66%, transparent 82%)",
        }}
      />
      <div
        className="scene-glow-b absolute bottom-[-15%] left-[-10%] h-[60vmax] w-[60vmax] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,214,178,0.32) 0%, rgba(255,205,170,0.20) 28%, rgba(255,196,160,0.09) 50%, rgba(255,196,160,0.03) 68%, transparent 82%)",
        }}
      />
    </div>
  );
}

export default function SceneLayer() {
  const { reducedMotion } = useSite();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // About / Portfolio / Studio paint their own worlds.
  const isOther = /^\/(en|de)\/(about|portfolio|studio)(\/|$)/.test(pathname);

  useEffect(() => {
    const dispose = initSceneInputs();
    // three.js is ~170 KB gzipped and costs real parse time. Loading it only
    // once the page has finished and the main thread is idle keeps the first
    // paint and the intro animation smooth — the ambient gradient below covers
    // the gap, so nothing pops.
    const stop = afterLoad(() => setMounted(true));
    return () => {
      stop();
      dispose();
    };
  }, []);

  if (isOther) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Ambient />
      {mounted && !reducedMotion && (
        <div className="absolute inset-0">
          <WorldScene />
        </div>
      )}
    </div>
  );
}
