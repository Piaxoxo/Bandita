"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";

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

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="mb-10 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
          {dict.manifesto.eyebrow}
        </p>

        <h2 className="mf-heading max-w-5xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.01em] text-ink sm:text-5xl md:text-6xl lg:text-7xl">
          {words.map((w, i) => (
            <span key={i} className="mf-word inline-block">
              {w}&nbsp;
            </span>
          ))}
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-xl font-sans text-lg leading-relaxed text-ink/70">
            {dict.manifesto.body}
          </p>
          <p className="font-display text-2xl italic text-pink">
            {dict.manifesto.signature}
          </p>
        </div>
      </div>
    </section>
  );
}
