"use client";

import type { Dictionary } from "@/i18n/types";
import Reveal from "@/components/anim/Reveal";

export default function Capabilities({ dict }: { dict: Dictionary }) {
  const items = dict.capabilities.items;
  // duplicate for a seamless loop
  const row = [...items, ...items];

  return (
    <section
      id="capabilities"
      className="relative overflow-hidden bg-ink py-32 text-creme md:py-44"
    >
      <div className="mx-auto mb-16 max-w-[1400px] px-5 md:mb-24 md:px-10">
        <Reveal>
          <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.4em] text-rose">
            {dict.capabilities.eyebrow}
          </p>
        </Reveal>
        <Reveal as="h2" className="max-w-4xl font-display text-4xl font-medium leading-[1.05] md:text-6xl lg:text-7xl">
          {dict.capabilities.heading}{" "}
          <span className="italic text-pink">
            {dict.capabilities.headingAccent}
          </span>
        </Reveal>
      </div>

      {/* Marquee rows */}
      <div className="space-y-2 md:space-y-4">
        <div
          className="marquee-track motion-only"
          style={{ animation: "marquee-left 28s linear infinite" }}
        >
          {row.map((item, i) => (
            <MarqueeItem key={`a-${i}`} label={item} filled={i % 2 === 0} />
          ))}
        </div>
        <div
          className="marquee-track motion-only"
          style={{ animation: "marquee-right 32s linear infinite" }}
        >
          {row.map((item, i) => (
            <MarqueeItem key={`b-${i}`} label={item} filled={i % 2 !== 0} />
          ))}
        </div>

        {/* Reduced-motion static fallback */}
        <div className="reduced-only flex-wrap gap-x-8 gap-y-2 px-5 md:px-10">
          {items.map((item) => (
            <span
              key={`s-${item}`}
              className="font-display text-4xl italic text-creme/90 md:text-6xl"
            >
              {item}.
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1400px] px-5 md:mt-24 md:px-10">
        <Reveal>
          <p className="max-w-2xl font-sans text-lg leading-relaxed text-creme/70">
            {dict.capabilities.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function MarqueeItem({ label, filled }: { label: string; filled: boolean }) {
  return (
    <span className="mx-6 inline-flex items-center gap-6 md:mx-10">
      <span
        className={`font-display text-6xl italic leading-none md:text-8xl ${
          filled ? "text-creme" : "text-stroke text-creme"
        }`}
      >
        {label}
      </span>
      <span className="h-3 w-3 rounded-full bg-pink md:h-4 md:w-4" />
    </span>
  );
}
