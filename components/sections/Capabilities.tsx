"use client";

import type { Dictionary } from "@/i18n/types";
import Reveal from "@/components/anim/Reveal";
import Chapter from "@/components/editorial/Chapter";
import ParticleHeadline from "@/components/anim/ParticleHeadline";
import ServiceConstellation from "@/components/webgl/ServiceConstellation";

export default function Capabilities({ dict }: { dict: Dictionary }) {
  const items = dict.capabilities.items;

  return (
    <section
      id="capabilities"
      data-tone="paper"
      className="relative overflow-hidden py-32 text-ink md:py-44"
    >
      <div data-fly className="relative mx-auto mb-10 max-w-[1400px] px-5 md:mb-14 md:px-10">
        <Reveal>
          <Chapter n="05" title={dict.capabilities.eyebrow} className="mb-12 md:mb-16" />
        </Reveal>
        {/* Two lines, each set from particles in its own colour: the accent is
            a whole sentence and gets its own line, so it never orphans. */}
        <h2 className="max-w-4xl font-display text-4xl font-medium leading-[1.05] md:text-6xl lg:text-7xl">
          <ParticleHeadline as="span" text={dict.capabilities.heading} className="block text-ink" />
          <ParticleHeadline
            as="span"
            text={dict.capabilities.headingAccent}
            color="#FB003F"
            accent="#1A1216"
            accentRatio={0.08}
            className="block italic text-pink"
          />
        </h2>
      </div>

      {/* 3D orbiting service constellation (decorative) */}
      <div className="relative">
        <ServiceConstellation items={items} />

        {/* Reduced-motion static fallback */}
        <div className="reduced-only flex-wrap justify-center gap-x-8 gap-y-2 px-5 md:px-10">
          {items.map((item) => (
            <span
              key={`s-${item}`}
              className="font-display text-4xl italic text-ink/90 md:text-6xl"
            >
              {item}.
            </span>
          ))}
        </div>
      </div>

      {/* Accessible, crawlable list of the disciplines */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={`sr-${item}`}>{item}</li>
        ))}
      </ul>
      {/* The constellation names the disciplines; the paragraph that used to
          list them again underneath is gone. */}
    </section>
  );
}
