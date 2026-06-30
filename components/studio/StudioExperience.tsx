"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { detectTier } from "@/lib/scene-store";
import { studio, attachStudioInputs } from "@/lib/studio-scene";
import { HERO, INTRO, ROOMS, CTA } from "./studio-data";
import Reveal from "@/components/anim/Reveal";
import MagneticButton from "@/components/MagneticButton";
import { scrollToId } from "@/lib/scroll";

const StudioScene = dynamic(() => import("@/components/webgl/studio/StudioScene"), { ssr: false });

const CREME = "#FCF6EC";

export default function StudioExperience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const [canvas, setCanvas] = useState(false);
  const [compact, setCompact] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCompact(detectTier() !== "high");
    setCanvas(!r);
  }, [r]);

  // active room → colour flood + partnership climax
  useEffect(() => {
    if (r || !root.current) return;
    const detach = attachStudioInputs();
    const secs = Array.from(root.current.querySelectorAll<HTMLElement>("[data-studio]"));
    const ratios = new Map<HTMLElement, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target as HTMLElement, e.isIntersecting ? e.intersectionRatio : 0));
        let bestEl: HTMLElement | undefined;
        let bestR = 0;
        for (const s of secs) {
          const v = ratios.get(s) ?? 0;
          if (v > bestR) {
            bestR = v;
            bestEl = s;
          }
        }
        if (bestEl) {
          studio.color = bestEl.dataset.color || CREME;
          studio.active = Number(bestEl.dataset.index || 0);
        }
        const part = secs.find((s) => s.dataset.partnership === "1");
        studio.partnership = part ? (ratios.get(part) ?? 0) : 0;
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    secs.forEach((s) => io.observe(s));
    return () => {
      io.disconnect();
      detach();
    };
  }, [r]);

  // section style: solid colour only in reduced-motion (no canvas to flood)
  const bg = (color: string) => (r ? { backgroundColor: color } : undefined);

  return (
    <div ref={root} className="studio-root relative">
      {canvas && <div className="fixed inset-0 -z-10 bg-creme">{<StudioScene compact={compact} />}</div>}

      {/* ① HERO */}
      <section
        data-studio
        data-index="0"
        data-color={CREME}
        className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 text-center text-ink"
        style={bg(CREME)}
      >
        <Reveal as="h1" className="font-display text-[15vw] font-medium leading-[0.9] tracking-[-0.02em] md:text-[12vw]">
          {HERO.title}
        </Reveal>
        <div className="mt-8 space-y-1 font-sans text-base text-ink/70 md:text-lg">
          {HERO.sub[lang].map((l, i) => (
            <Reveal as="p" key={i} delay={i * 0.06} blur={false} y={18}>
              {l}
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <MagneticButton onClick={() => scrollToId("studio-cta")} strength={0.5} className="rounded-full bg-ink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-pink">
            {HERO.button[lang]}
          </MagneticButton>
        </Reveal>
        <span className="absolute bottom-8 font-sans text-[10px] uppercase tracking-[0.3em] text-ink/40">↓</span>
      </section>

      {/* ② INTRO */}
      <section data-studio data-index="1" data-color={CREME} className="relative flex min-h-[90svh] items-center px-5 text-ink md:px-10" style={bg(CREME)}>
        <div className="mx-auto max-w-[1100px] space-y-7">
          {INTRO.map((l, i) => (
            <Reveal as="p" key={i} delay={i * 0.04} className="font-display text-3xl font-medium leading-[1.12] tracking-[-0.01em] sm:text-4xl md:text-5xl">
              {l[lang]}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ③–⑧ COLLECTIONS */}
      {ROOMS.map((room, ri) => {
        const dark = !!room.dark || room.id === "partnership";
        const text = dark ? "text-creme" : "text-ink";
        const sub = dark ? "text-creme/70" : "text-ink/70";
        return (
          <section
            key={room.id}
            data-studio
            data-index={2 + ri}
            data-color={room.color}
            data-partnership={room.id === "partnership" ? "1" : undefined}
            className={`relative flex min-h-[100svh] items-center overflow-hidden px-5 py-24 md:px-10 ${text}`}
            style={bg(room.color)}
          >
            <div className="mx-auto grid w-full max-w-[1400px] gap-12 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <Reveal>
                  <span className="font-sans text-[11px] uppercase tracking-[0.3em]" style={{ color: dark ? CREME : "#1A1216", opacity: 0.6 }}>
                    {room.kicker[lang]}
                  </span>
                </Reveal>
                <Reveal as="h2" y={30} className="mt-5 font-display text-6xl font-medium leading-[0.95] tracking-[-0.02em] sm:text-7xl md:text-8xl">
                  {room.title[lang]}
                </Reveal>
                <div className={`mt-8 max-w-xl space-y-4 font-sans text-lg leading-relaxed ${sub}`}>
                  {room.lines.map((l, i) => (
                    <Reveal as="p" key={i} delay={i * 0.05} blur={false} y={18}>
                      {l[lang]}
                    </Reveal>
                  ))}
                </div>
              </div>
              {room.services.length > 0 && (
                <div className="md:col-span-5">
                  <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-1">
                    {room.services.map((sv, i) => (
                      <Reveal as="li" key={sv} delay={i * 0.05} blur={false} y={14} className="group flex items-center gap-3 font-sans text-base md:text-lg">
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dark ? CREME : "#1A1216" }} />
                        <span className={dark ? "text-creme/85" : "text-ink/85"}>{sv}</span>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ⑨ FINAL CTA */}
      <section
        id="studio-cta"
        data-studio
        data-index={2 + ROOMS.length}
        data-color="#FB003F"
        className="relative flex min-h-[90svh] items-center justify-center px-5 text-center text-creme"
        style={bg("#FB003F")}
      >
        <div className="mx-auto max-w-[1100px]">
          <Reveal as="h2" className="font-display text-5xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-6xl md:text-7xl">
            {CTA.heading[lang]}
          </Reveal>
          <Reveal className="mt-8 space-y-1 font-display text-2xl italic md:text-3xl">
            <p>{CTA.line1[lang]}</p>
            <p>{CTA.line2[lang]}</p>
          </Reveal>
          <Reveal className="mt-12">
            <MagneticButton as="a" href={`/${lang}#contact`} onClick={() => scrollToId("contact")} strength={0.5} className="rounded-full bg-creme px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme">
              {CTA.button[lang]}
            </MagneticButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
