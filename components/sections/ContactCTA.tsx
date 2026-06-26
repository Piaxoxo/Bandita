"use client";

import type { Dictionary } from "@/i18n/types";
import Reveal from "@/components/anim/Reveal";
import MagneticButton from "@/components/MagneticButton";

export default function ContactCTA({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-pink py-32 text-creme md:py-48"
    >
      {/* subtle moving sheen */}
      <div
        aria-hidden
        className="motion-only pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 text-center md:px-10">
        <Reveal>
          <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.4em] text-creme/70">
            {dict.cta.eyebrow}
          </p>
        </Reveal>

        <Reveal
          as="h2"
          className="mx-auto max-w-5xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-7xl"
        >
          {dict.cta.heading}
        </Reveal>

        <Reveal>
          <p className="mx-auto mt-10 max-w-md font-sans text-lg leading-relaxed text-creme/80">
            {dict.cta.body}
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-5">
            <MagneticButton
              as="a"
              href="mailto:hello@bandita.studio"
              strength={0.5}
              className="rounded-full bg-creme px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme"
            >
              {dict.cta.button}
            </MagneticButton>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-creme/60">
              {dict.cta.note}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
