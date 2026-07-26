"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import MagneticButton from "@/components/MagneticButton";

/* split a line into per-letter spans so each character can rise on its own */
function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="hero-char inline-block will-change-transform">
              {ch}
            </span>
          ))}
          {wi < arr.length - 1 && <span className="hero-char inline-block w-[0.28em]" />}
        </span>
      ))}
    </>
  );
}

export default function Hero({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const router = useRouter();
  const { introDone, reducedMotion } = useSite();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!introDone) return;
    const el = root.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el.querySelectorAll(".hero-anim"), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll(".hero-char"), { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 20, duration: 0.8 })
        .from(
          ".hero-char",
          { yPercent: 115, duration: 1.0, stagger: 0.035 },
          "-=0.4",
        )
        .from(".hero-sub", { opacity: 0, y: 24, duration: 0.9 }, "-=0.6")
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070406]/85 via-[#070406]/35 to-[#070406]/75 md:from-[#070406]/55 md:via-[#070406]/15 md:to-[#070406]/70" />

      <div data-fly className="relative z-10 mx-auto w-full max-w-[1600px] px-5 md:px-10">
        <p className="hero-eyebrow mb-6 font-sans text-[11px] uppercase tracking-[0.4em] text-pink md:text-xs">
          {dict.hero.eyebrow}
        </p>

        <h1 className="font-display font-medium leading-[0.92] tracking-[-0.02em] text-creme">
          <span className="hero-line block overflow-hidden">
            <span className="block text-[16vw] md:text-[12vw] lg:text-[10.5vw]">
              <Chars text={dict.hero.line1} />
            </span>
          </span>
          <span className="hero-line block overflow-hidden">
            <span className="block text-[16vw] italic text-pink md:text-[12vw] lg:text-[10.5vw]">
              <Chars text={dict.hero.line2} />
            </span>
          </span>
        </h1>

        <p className="hero-sub mt-8 max-w-xl font-sans text-lg leading-relaxed text-creme/75 md:text-xl">
          {dict.hero.sub}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <MagneticButton
            onClick={() => scrollToId("contact")}
            className="hero-cta rounded-full bg-pink px-8 py-4 font-sans text-sm uppercase tracking-[0.12em] text-creme transition-colors hover:bg-ink"
          >
            {dict.hero.ctaPrimary}
          </MagneticButton>
          <MagneticButton
            onClick={() => router.push(`/${lang}/about`)}
            cursor="link"
            className="hero-cta rounded-full border border-creme/25 px-8 py-4 font-sans text-sm uppercase tracking-[0.12em] text-creme transition-colors hover:border-pink hover:text-pink"
          >
            {dict.hero.ctaSecondary}
          </MagneticButton>
        </div>
      </div>

      {/* scroll cue */}
      <div className="hero-scroll absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-creme/50">
          {dict.hero.scroll}
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-creme/15">
          <span className="motion-only absolute inset-x-0 top-0 h-4 w-px animate-[scrollLine_2s_ease-in-out_infinite] bg-pink" />
        </span>
      </div>
    </section>
  );
}
