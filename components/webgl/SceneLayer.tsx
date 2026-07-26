"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";

const WorldScene = dynamic(() => import("./WorldScene"), { ssr: false });

/* Soft warm ambient behind the 3D glass world */
function Ambient() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-creme">
      <div
        className="scene-glow-a absolute right-[-10%] top-[-10%] h-[70vmax] w-[70vmax] rounded-full opacity-60 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,140,176,0.28), rgba(255,92,158,0.10) 45%, transparent 72%)",
        }}
      />
      <div
        className="scene-glow-b absolute bottom-[-15%] left-[-10%] h-[60vmax] w-[60vmax] rounded-full opacity-50 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,214,178,0.30), transparent 70%)",
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
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => {
      window.cancelAnimationFrame(id);
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
