"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import Reveal from "@/components/anim/Reveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function Philosophy({ dict }: { dict: Dictionary }) {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".phi-card").forEach((card, i) => {
        gsap.to(card, {
          yPercent: -8 - i * 6,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="philosophy"
      ref={root}
      className="relative overflow-hidden py-32 md:py-48"
    >
      {/* atmospheric gradient field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-0 top-1/4 h-[36vmax] w-[36vmax] rounded-full opacity-[0.15] blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,92,158,0.5), transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Reveal>
              <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
                {dict.philosophy.eyebrow}
              </p>
            </Reveal>
            <Reveal as="h2" className="font-display text-3xl font-medium leading-[1.12] tracking-[-0.01em] text-ink sm:text-4xl md:text-5xl lg:text-6xl">
              {dict.philosophy.heading}
            </Reveal>
            <Reveal>
              <p className="mt-10 max-w-md font-sans text-lg leading-relaxed text-ink/70">
                {dict.philosophy.body}
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-5">
            {dict.philosophy.stats.map((s) => (
              <div
                key={s.value}
                className="phi-card glass flex items-center gap-6 rounded-3xl p-7 md:p-9"
              >
                <span className="font-display text-5xl italic text-pink md:text-6xl">
                  {s.value}
                </span>
                <span className="font-sans text-base text-ink/80 md:text-lg">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
