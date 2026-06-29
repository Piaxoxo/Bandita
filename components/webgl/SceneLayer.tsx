"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";

const SceneRoot = dynamic(() => import("./SceneRoot"), { ssr: false });

/* Static brand-toned atmosphere — reduced-motion & pre-mount fallback */
function GradientFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-creme" />
      <div
        className="absolute right-0 top-0 h-[70vmax] w-[70vmax] translate-x-1/4 -translate-y-1/4 rounded-full opacity-40 blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(234,217,206,0.55), rgba(255,157,184,0.12) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-[55vmax] w-[55vmax] -translate-x-1/4 translate-y-1/4 rounded-full opacity-30 blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(242,236,226,0.6), transparent 70%)",
        }}
      />
    </div>
  );
}

export default function SceneLayer() {
  const { reducedMotion } = useSite();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // The About page renders its own bespoke particle world (AboutSceneLayer),
  // so the homepage champagne scene must not paint there.
  const isAbout = /^\/(en|de)\/about(\/|$)/.test(pathname);

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
          <SceneRoot />
        </div>
      )}
    </div>
  );
}
