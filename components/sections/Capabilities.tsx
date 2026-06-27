"use client";

import type { Dictionary } from "@/i18n/types";
import Reveal from "@/components/anim/Reveal";
import ServiceConstellation from "@/components/webgl/ServiceConstellation";

export default function Capabilities({ dict }: { dict: Dictionary }) {
  const items = dict.capabilities.items;

  return (
    <section
      id="capabilities"
      className="relative overflow-hidden bg-ink py-32 text-creme md:py-44"
    >
      {/* subtle radial depth glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(251,0,63,0.35), rgba(255,92,158,0.12) 45%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto mb-10 max-w-[1400px] px-5 md:mb-14 md:px-10">
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

      {/* 3D orbiting service constellation (decorative) */}
      <div className="relative">
        <ServiceConstellation items={items} />

        {/* Reduced-motion static fallback */}
        <div className="reduced-only flex-wrap justify-center gap-x-8 gap-y-2 px-5 md:px-10">
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

      {/* Accessible, crawlable list of the disciplines */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={`sr-${item}`}>{item}</li>
        ))}
      </ul>

      <div className="relative mx-auto mt-10 max-w-[1400px] px-5 md:mt-16 md:px-10">
        <Reveal>
          <p className="max-w-2xl font-sans text-lg leading-relaxed text-creme/70">
            {dict.capabilities.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
