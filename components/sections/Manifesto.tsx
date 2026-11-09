"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import Chapter from "@/components/editorial/Chapter";
import ParticleHeadline from "@/components/anim/ParticleHeadline";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function Manifesto({ dict }: { dict: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Parallax ghost word
      gsap.to(".mf-ghost", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="manifesto"
      ref={root}
      data-tone="paper"
      className="relative overflow-hidden py-32 md:py-48"
    >
      {/* parallax ghost word */}
      <span
        aria-hidden
        className="mf-ghost pointer-events-none absolute -right-10 top-10 select-none font-display text-[28vw] italic leading-none text-pink/[0.04] md:text-[20vw]"
      >
        Bandita
      </span>

      {/* The floating cocktail film is gone: the ribbon is the one object on
          these pages now, and a second one competing with it was the old
          site's habit of six motion languages at once. */}

      <div data-fly className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <Chapter n="04" title={dict.manifesto.eyebrow} className="mb-12 md:mb-16" />

        {/* One sentence, larger than before, and set from particles: it
            gathers as you reach it and lets go as you leave. The paragraph
            that used to follow it is gone — a line that needs a paragraph is
            not the line. */}
        <ParticleHeadline
          as="h2"
          text={dict.manifesto.heading}
          className="max-w-6xl font-display text-5xl font-medium leading-[1.02] tracking-[-0.015em] text-ink sm:text-6xl md:text-7xl lg:text-[7.5rem]"
        />
      </div>
    </section>
  );
}
