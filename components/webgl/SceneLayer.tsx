"use client";

import { usePathname } from "next/navigation";

/*
  Calm, premium ambient background — soft warm light with two slowly drifting
  blush glows. Deliberately quiet so BANDITA's own content (the hero film and
  the reels) is the star. No heavy WebGL.
*/
export default function SceneLayer() {
  const pathname = usePathname();
  // About / Portfolio / Studio paint their own worlds.
  const isOther = /^\/(en|de)\/(about|portfolio|studio)(\/|$)/.test(pathname);
  if (isOther) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-creme">
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
