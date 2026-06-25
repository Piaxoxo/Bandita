"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSite } from "@/lib/site-context";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/* Static brand-coloured gradient — fallback for reduced-motion & pre-mount */
function GradientFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/4 -translate-y-1/2 rounded-full opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(251,0,63,0.45), rgba(255,92,158,0.25) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-[50vmax] w-[50vmax] translate-x-1/4 translate-y-1/4 rounded-full opacity-50 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(95,201,188,0.4), transparent 70%)",
        }}
      />
    </div>
  );
}

export default function HeroCanvas() {
  const { reducedMotion } = useSite();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer mounting the heavy WebGL scene until after first paint
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-0">
      <GradientFallback />
      {mounted && !reducedMotion && (
        <div className="absolute inset-0">
          <HeroScene />
        </div>
      )}
    </div>
  );
}
