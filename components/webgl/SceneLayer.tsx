"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";
import { useDeferredScene } from "@/lib/use-deferred-scene";

const RibbonScene = dynamic(() => import("./RibbonScene"), { ssr: false });

/*
  Paper.

  Under the ribbon there is only the page: creme, with the faintest warmth in
  two corners so it reads as stock rather than as a flat hex value. The old
  layer painted two large pink glows here for a glass world to float in; the
  ribbon carries the colour now, so the paper can be paper.
*/
function Paper() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-creme">
      <div
        className="absolute right-[-20%] top-[-20%] h-[70vmax] w-[70vmax] rounded-full opacity-[0.22]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,214,178,0.45) 0%, rgba(255,205,170,0.22) 34%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[-15%] h-[60vmax] w-[60vmax] rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,140,176,0.35) 0%, rgba(255,124,168,0.16) 36%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function SceneLayer() {
  const { reducedMotion } = useSite();
  const pathname = usePathname();

  // About / Portfolio / Studio paint their own worlds.
  const isOther = /^\/(en|de)\/(about|portfolio|studio)(\/|$)/.test(pathname);

  // three.js waits for the intro to finish and the thread to go idle.
  const mounted = useDeferredScene(!isOther);

  useEffect(() => initSceneInputs(), []);

  if (isOther) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Paper />
      {mounted && !reducedMotion && (
        <div className="absolute inset-0">
          <RibbonScene />
        </div>
      )}
    </div>
  );
}
