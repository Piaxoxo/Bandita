"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import Chapter from "@/components/editorial/Chapter";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function Manifesto({ dict }: { dict: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  const words = dict.manifesto.heading.split(" ");

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Word-by-word ink-fill reveal as the section scrolls through
      gsap.fromTo(
        ".mf-word",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: ".mf-heading",
            start: "top 75%",
            end: "bottom 60%",
            scrub: true,
          },
        },
      );
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
        <Chapter n="03" title={dict.manifesto.eyebrow} className="mb-12 md:mb-16" />

        {/* One sentence, and larger than before — the paragraph that used to
            follow it is gone. A line that needs a paragraph is not the line. */}
        <h2 data-hl className="mf-heading max-w-6xl font-display text-5xl font-medium leading-[1.02] tracking-[-0.015em] text-ink sm:text-6xl md:text-7xl lg:text-[7.5rem]">
          {words.map((w, i) => (
            <span key={i} className="mf-word inline-block">
              {w}&nbsp;
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
