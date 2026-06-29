"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSite } from "@/lib/site-context";
import { detectTier } from "@/lib/scene-store";
import { attachAboutInputs } from "@/lib/about-scene";

const AboutScene = dynamic(() => import("./AboutScene"), { ssr: false });

// Deep, monochrome ground for the About world — also the reduced-motion /
// low-tier fallback so the page is never a flash of empty black.
function DarkGround() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0c0a0c]">
      <div
        className="absolute left-1/2 top-[18%] h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full opacity-[0.5] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(60,42,52,0.9), rgba(251,0,63,0.08) 42%, transparent 68%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-[55vmax] w-[55vmax] translate-x-1/4 translate-y-1/4 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(40,28,36,0.9), transparent 70%)",
        }}
      />
    </div>
  );
}

export default function AboutSceneLayer() {
  const { reducedMotion } = useSite();
  const [mounted, setMounted] = useState(false);
  const [tier, setTier] = useState<"high" | "mid" | "low">("high");

  useEffect(() => {
    setTier(detectTier());
    const detach = attachAboutInputs();
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => {
      window.cancelAnimationFrame(id);
      detach();
    };
  }, []);

  // Run the canvas on every device — only "reduce motion" disables it.
  // Mobile/low just gets fewer particles (mirrors the homepage scene).
  const showCanvas = mounted && !reducedMotion;
  const count = tier === "high" ? 12000 : tier === "mid" ? 7000 : 4200;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <DarkGround />
      {showCanvas && (
        <div className="absolute inset-0">
          <AboutScene count={count} quality={tier === "high" ? "high" : "mid"} />
        </div>
      )}
    </div>
  );
}
