"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";

const HeistScene = dynamic(() => import("./HeistScene"), { ssr: false });

/* Dark vault tone — reduced-motion & pre-mount fallback for "The Heist" */
function GradientFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070406]">
      <div
        className="absolute left-1/2 top-1/3 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,220,168,0.18), rgba(251,0,63,0.08) 45%, transparent 72%)",
        }}
      />
    </div>
  );
}

export default function SceneLayer() {
  const { reducedMotion } = useSite();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // About & Portfolio render their own bespoke worlds, so the homepage
  // champagne scene must not paint there.
  const isAbout = /^\/(en|de)\/(about|portfolio|studio)(\/|$)/.test(pathname);

  useEffect(() => {
    const dispose = initSceneInputs();
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => {
      window.cancelAnimationFrame(id);
      dispose();
    };
  }, []);

  if (isAbout) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <GradientFallback />
      {mounted && !reducedMotion && (
        <div className="absolute inset-0">
          <HeistScene />
        </div>
      )}
    </div>
  );
}
