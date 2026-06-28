"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import MagneticButton from "@/components/MagneticButton";

export default function Hero({ dict }: { dict: Dictionary }) {
  const { introDone, reducedMotion } = useSite();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!introDone) return;
    const el = root.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el.querySelectorAll(".hero-anim"), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll(".hero-line span"), { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 20, duration: 0.8 })
        .from(
          ".hero-line span",
          { yPercent: 115, duration: 1.2, stagger: 0.12 },
          "-=0.4",
        )
        .from(".hero-sub", { opacity: 0, y: 24, duration: 0.9 }, "-=0.7")
        .from(
          ".hero-cta",
          { opacity: 0, y: 24, duration: 0.8, stagger: 0.1 },
          "-=0.6",
        )
        .from(".hero-scroll", { opacity: 0, duration: 0.8 }, "-=0.4");
    }, el);

    return () => ctx.revert();
  }, [introDone, reducedMotion]);

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* The persistent WebGL layer (SceneLayer) renders behind the whole page.
          A vignette keeps the headline legible over it — stronger on mobile
          where the scene fills more of the small viewport. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-creme/70 via-creme/25 to-creme/70 md:from-creme/30 md:via-transparent md:to-creme/55" />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 md:px-10">
        <p className="hero-eyebrow mb-6 font-sans text-[11px] uppercase tracking-[0.4em] text-pink md:text-xs">
          {dict.hero.eyebrow}
        </p>

        <h1 className="font-display font-medium leading-[0.92] tracking-[-0.02em] text-ink">
          <span className="hero-line block overflow-hidden">
            <span className="block text-[16vw] md:text-[12vw] lg:text-[10.5vw]">
              {dict.hero.line1}
            </span>
          </span>
          <span className="hero-line block overflow-hidden">
            <span className="block text-[16vw] italic text-pink md:text-[12vw] lg:text-[10.5vw]">
              {dict.hero.line2}
            </span>
          </span>
        </h1>

        <p className="hero-sub mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink/70 md:text-xl">
          {dict.hero.sub}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <MagneticButton
            onClick={() => scrollToId("manifesto")}
            className="hero-cta rounded-full bg-pink px-8 py-4 font-sans text-sm uppercase tracking-[0.12em] text-creme transition-colors hover:bg-ink"
          >
            {dict.hero.ctaPrimary}
          </MagneticButton>
          <MagneticButton
            onClick={() => scrollToId("philosophy")}
            cursor="link"
            className="hero-cta rounded-full border border-ink/20 px-8 py-4 font-sans text-sm uppercase tracking-[0.12em] text-ink transition-colors hover:border-pink hover:text-pink"
          >
            {dict.hero.ctaSecondary}
          </MagneticButton>
        </div>
      </div>

      {/* scroll cue */}
      <div className="hero-scroll absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/50">
          {dict.hero.scroll}
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-ink/15">
          <span className="motion-only absolute inset-x-0 top-0 h-4 w-px animate-[scrollLine_2s_ease-in-out_infinite] bg-pink" />
        </span>
      </div>
    </section>
  );
}
