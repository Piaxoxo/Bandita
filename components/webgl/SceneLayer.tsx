"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/lib/site-context";
import { initSceneInputs } from "@/lib/scene-store";
import { useDeferredScene } from "@/lib/use-deferred-scene";

const RibbonScene = dynamic(() => import("./RibbonScene"), { ssr: false });

/*
  The page behind the page.

  It is one fixed surface under everything, and it changes colour as you
  scroll: dark for the cover, paper for the photographs, dark again for the
  work, paper for the manifesto. Sections do not paint their own backgrounds
  — they declare a tone with `data-tone`, and whichever section holds the
  middle of the screen sets the colour here, with a slow crossfade. That is
  what lets the ribbon run unbroken across light and dark: it lives on this
  surface, not behind a stack of opaque sections.

  `html[data-tone]` carries the current tone too, so chrome like the running
  head can follow it.
*/

export type Tone = "dark" | "paper";
const COLORS: Record<Tone, string> = { dark: "#0e0a0d", paper: "#FCF6EC" };

function useTone(): Tone {
  const [tone, setTone] = useState<Tone>("paper");
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
    if (!sections.length) {
      document.documentElement.dataset.tone = "paper";
      return;
    }
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        // distance from the viewport centre to the section's span
        const d = mid < r.top ? r.top - mid : mid > r.bottom ? mid - r.bottom : 0;
        if (d < bestD) { bestD = d; best = s; }
      }
      const t = (best?.dataset.tone as Tone | undefined) ?? "paper";
      setTone(t);
      document.documentElement.dataset.tone = t;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return tone;
}

export default function SceneLayer() {
  const { reducedMotion } = useSite();
  const pathname = usePathname();
  const isOther = /^\/(en|de)\/(about|portfolio|studio)(\/|$)/.test(pathname);
  const mounted = useDeferredScene(!isOther);
  const tone = useTone();

  useEffect(() => initSceneInputs(), []);

  if (isOther) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 transition-colors duration-[900ms] ease-bandita"
        style={{ backgroundColor: COLORS[tone] }}
      />
      {mounted && !reducedMotion && (
        <div className="absolute inset-0">
          <RibbonScene />
        </div>
      )}
    </div>
  );
}
