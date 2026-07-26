"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";

const LiquidScene = dynamic(() => import("./LiquidScene"), { ssr: false });

/* Static white + soft-pink marble tone — reduced-motion & pre-mount fallback */
function GradientFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#FDFAF6]">
      <div
        className="absolute right-0 top-0 h-[70vmax] w-[70vmax] translate-x-1/4 -translate-y-1/4 rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,140,176,0.30), rgba(255,92,158,0.10) 45%, transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-[55vmax] w-[55vmax] -translate-x-1/4 translate-y-1/4 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,192,210,0.35), transparent 70%)",
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
          <LiquidScene />
        </div>
      )}
    </div>
  );
}
