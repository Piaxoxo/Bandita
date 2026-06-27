"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useSite } from "@/lib/site-context";
import { scene as sceneStore, detectTier, TIER_CONFIG } from "@/lib/scene-store";
import type { Dictionary } from "@/i18n/types";
import dynamic from "next/dynamic";

const IntroCanvas = dynamic(() => import("./webgl/IntroParticles"), { ssr: false });

export default function Loader({ dict }: { dict: Dictionary }) {
  const { setIntroDone } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);

  const finish = useRef(() => {});
  const doneOnce = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    document.body.style.overflow = "hidden";

    const done = () => {
      if (doneOnce.current) return;
      doneOnce.current = true;
      document.body.style.overflow = "";
      sceneStore.introDone = true;
      sceneStore.introProgress = 1;
      setIntroDone(true);
      setHidden(true);
    };
    finish.current = done;

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(isReduced);

    // absolute safety net so the intro can never trap the page
    const safety = window.setTimeout(done, isReduced ? 900 : 7500);

    if (isReduced) {
      setCount(100);
      const t = window.setTimeout(done, 650);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(safety);
        document.body.style.overflow = "";
      };
    }

    // count up during the particle formation
    const counter = { v: 0 };
    const tween = gsap.to(counter, {
      v: 100,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate: () => setCount(Math.round(counter.v)),
    });

    gsap.fromTo(
      ".loader-chrome",
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out", delay: 0.2 },
    );

    return () => {
      tween.kill();
      window.clearTimeout(safety);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Particle intro begins its exit → crossfade the overlay into the homepage
  const handleExitStart = () => {
    sceneStore.introDone = true; // start fading the persistent field in
    gsap.to(".loader-chrome", { opacity: 0, duration: 0.6, ease: "power2.in" });
    if (root.current) {
      gsap.to(root.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.inOut",
        delay: 0.15,
      });
    }
  };

  if (hidden) return null;

  const tier = typeof window !== "undefined" ? detectTier() : "high";
  const introCount = TIER_CONFIG[tier].intro;
  const word = "BANDITA".split("");

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[80] overflow-hidden bg-ink text-creme"
      role="status"
      aria-live="polite"
      aria-label="Loading Bandita"
    >
      {/* Particle wordmark (desktop / motion) */}
      {!reduced && (
        <div className="absolute inset-0">
          <IntroCanvas
            count={introCount}
            onExitStart={handleExitStart}
            onComplete={() => finish.current()}
          />
        </div>
      )}

      {/* Static fallback for reduced motion */}
      {reduced && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[16vw] font-semibold tracking-tight md:text-[11vw]">
            BANDITA
          </span>
        </div>
      )}

      {/* DOM chrome over the canvas */}
      <div className="loader-chrome pointer-events-none absolute inset-0">
        <div className="absolute right-6 top-6 font-sans text-sm tabular-nums tracking-widest text-creme/55 md:right-10 md:top-10">
          {String(count).padStart(3, "0")}
        </div>

        <p className="absolute left-1/2 top-[14%] -translate-x-1/2 font-sans text-[11px] uppercase tracking-[0.4em] text-creme/55">
          {dict.loader.enter}
        </p>

        <div className="absolute bottom-[16%] left-1/2 flex -translate-x-1/2 items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-creme/55">
          <span>{dict.loader.line1}</span>
          <span className="h-px w-8 bg-creme/30" />
          <span>{dict.loader.line2}</span>
        </div>

        <button
          onClick={() => finish.current()}
          className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 font-sans text-[11px] uppercase tracking-[0.25em] text-creme/45 transition-colors hover:text-creme"
        >
          {dict.loader.skip}
        </button>
      </div>

      <span className="sr-only">{word.join("")}</span>
    </div>
  );
}
