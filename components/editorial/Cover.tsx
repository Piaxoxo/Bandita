"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { useQuote } from "@/components/quote/QuoteProvider";
import { scrollToId } from "@/lib/scroll";
import Wordmark from "@/components/Wordmark";
import ParticleHeadline from "@/components/anim/ParticleHeadline";
import Chapter from "./Chapter";

const GlassWindow = dynamic(() => import("@/components/webgl/GlassWindow"), { ssr: false });

/*
  The cover — cinema with a magazine printed on it.

  The film fills the whole first screen. The glass band crosses all of it and
  bends it. The masthead is printed on top in creme, the chapter head, the
  line, one text link. The first draft put the film in a small frame on a
  creme page and it read as a brochure; the same pieces, with the film
  underneath everything, read as an opening shot.

  The film is the cocktail: the agency's own footage, the one object the old
  site was known for, now the stage instead of a floating ornament. The
  cover line is not typed in — it gathers out of particles once the intro
  has lifted, the same technique as every other headline on the page, and
  lets go again as the cover scrolls away.
*/

const FILM = {
  video: "/video/cocktail.mp4",
  poster: "/video/cocktail.jpg",
  aspect: 640 / 866,
  label: { de: "Film · Cocktail", en: "Film · Cocktail" },
};

export default function Cover({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const { introDone, reducedMotion } = useSite();
  const { open } = useQuote();
  const root = useRef<HTMLElement>(null);
  const de = lang === "de";

  useEffect(() => {
    if (!introDone) return;
    const el = root.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el.querySelectorAll(".cv-anim, .cv-mast, .cv-meta"), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll(".cv-rule"), { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".cv-mast", { opacity: 0, y: 18, duration: 1.2 })
        .from(".cv-rule", { scaleX: 0, transformOrigin: "left center", duration: 1.0 }, "-=0.8")
        .from(".cv-meta", { opacity: 0, duration: 0.8 }, "-=0.8")
        .from(".cv-anim", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "+=0.9");
    }, el);
    return () => ctx.revert();
  }, [introDone, reducedMotion]);

  return (
    <section
      id="top"
      ref={root}
      data-tone="dark"
      className="relative flex min-h-[100svh] flex-col overflow-hidden text-creme"
    >
      {/* the film, under everything */}
      <GlassWindow
        video={FILM.video}
        poster={FILM.poster}
        videoAspect={FILM.aspect}
        ribbon={0.22}
        alt={de ? "Bandita — Cocktail-Film" : "Bandita — cocktail film"}
      />
      {/* grade it down so the type sits on it */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pt-6 md:px-10 md:pt-8">
        {/* ── masthead ─────────────────────────────────────────────────── */}
        <div className="cv-meta flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.42em] text-creme/60 md:text-[11px]">
          <span>{de ? "Kreativ- & Marketingagentur" : "Creative & Marketing Agency"}</span>
          <span className="hidden sm:inline">Wien</span>
        </div>
        <div className="cv-rule mt-3 h-px bg-creme/50" />
        <div className="cv-mast flex justify-center py-6 md:py-8">
          <Wordmark tone="creme" className="text-[15vw] sm:text-[12.5vw] lg:text-[10vw] xl:text-[8.5rem]" />
        </div>
        <div className="cv-rule h-px bg-creme/50" />

        {/* ── the line, low on the screen like a cover line ───────────── */}
        {/* bottom padding clears the fixed accessibility button in the corner */}
        <div className="mt-auto pb-24 pt-12 md:pb-20 md:pt-16">
          <Chapter n="01" title={de ? "Titel" : "Cover"} tone="creme" className="cv-anim mb-8 md:mb-10" />
          <h1 className="font-display font-medium leading-[0.9] tracking-[-0.02em]">
            <ParticleHeadline
              as="span"
              mode="cover"
              armed={introDone}
              text={dict.hero.line1}
              color="#FCF6EC"
              accent="#FB003F"
              className="block text-[17vw] text-creme md:text-[10.5vw]"
            />
            <ParticleHeadline
              as="span"
              mode="cover"
              armed={introDone}
              text={dict.hero.line2}
              color="#FB003F"
              accent="#FCF6EC"
              accentRatio={0.1}
              className="block text-[17vw] italic text-pink md:text-[10.5vw]"
            />
          </h1>

          <div className="cv-anim mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 font-sans text-xs uppercase tracking-[0.3em] md:mt-12">
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <button
                onClick={() => open()}
                data-cursor="hover"
                className="group inline-flex items-center gap-3 text-creme transition-colors hover:text-pink"
              >
                {dict.hero.ctaPrimary}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </button>
              <button
                onClick={() => scrollToId("work")}
                data-cursor="link"
                className="inline-flex items-center gap-3 text-creme/55 transition-colors hover:text-creme"
              >
                {de ? "Arbeiten ansehen" : "See the work"}
                <span aria-hidden>↓</span>
              </button>
            </div>
            <span className="hidden text-[10px] text-creme/45 md:inline">
              {FILM.label[lang]} · Wien · 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
