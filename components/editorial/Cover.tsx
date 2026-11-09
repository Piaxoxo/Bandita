"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { useQuote } from "@/components/quote/QuoteProvider";
import { scrollToId } from "@/lib/scroll";
import { unmaskLines } from "@/lib/unmask";
import Wordmark from "@/components/Wordmark";
import Chapter from "./Chapter";

const GlassWindow = dynamic(() => import("@/components/webgl/GlassWindow"), { ssr: false });

/*
  The cover — cinema with a magazine printed on it.

  The film fills the whole first screen. The glass band crosses all of it and
  bends it. The masthead is printed on top in creme, the chapter head, the
  line, one text link. The first draft put the film in a small frame on a
  creme page and it read as a brochure; the same pieces, with the film
  underneath everything, read as an opening shot.

  Portrait screens get the 9:16 reel, landscape screens a 16:9 film, so the
  cover is never a crop of the wrong shape.
*/

const FILMS = {
  portrait: {
    video: "/video/reel-mojito.mp4",
    poster: "/video/reel-mojito.jpg",
    aspect: 540 / 960,
    label: { de: "Film · Bandita Reel", en: "Film · Bandita reel" },
  },
  landscape: {
    video: "/portfolio/video/deutschland-gta.mp4",
    poster: "/portfolio/video/deutschland-gta-poster.jpg",
    aspect: 1280 / 720,
    label: { de: "Film · Deutschland · Travel Film", en: "Film · Germany · travel film" },
  },
};

function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="cv-char inline-block will-change-transform">
              {ch}
            </span>
          ))}
          {wi < arr.length - 1 && <span className="cv-char inline-block">{" "}</span>}
        </span>
      ))}
    </>
  );
}

export default function Cover({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const { introDone, reducedMotion } = useSite();
  const { open } = useQuote();
  const root = useRef<HTMLElement>(null);
  const de = lang === "de";
  const [film, setFilm] = useState(FILMS.portrait);

  useEffect(() => {
    const pick = () => setFilm(window.innerWidth > window.innerHeight ? FILMS.landscape : FILMS.portrait);
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const el = root.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el.querySelectorAll(".cv-anim, .cv-mast, .cv-meta"), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll(".cv-rule"), { scaleX: 1 });
      gsap.set(el.querySelectorAll(".cv-char"), { yPercent: 0 });
      unmaskLines(el, ".cv-line");
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".cv-mast", { opacity: 0, y: 18, duration: 1.2 })
        .from(".cv-rule", { scaleX: 0, transformOrigin: "left center", duration: 1.0 }, "-=0.8")
        .from(".cv-meta", { opacity: 0, duration: 0.8 }, "-=0.8")
        .from(
          ".cv-char",
          { yPercent: 115, duration: 1.0, stagger: 0.03, onComplete: () => unmaskLines(el, ".cv-line") },
          "-=0.5",
        )
        .from(".cv-anim", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "-=0.6");
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
        key={film.video}
        video={film.video}
        poster={film.poster}
        videoAspect={film.aspect}
        ribbon={0.22}
        alt={de ? "Bandita — Film" : "Bandita — film"}
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
            <span className="cv-line block overflow-hidden">
              <span className="block text-[17vw] md:text-[10.5vw]">
                <Chars text={dict.hero.line1} />
              </span>
            </span>{" "}
            <span className="cv-line block overflow-hidden">
              <span className="block text-[17vw] italic text-pink md:text-[10.5vw]">
                <Chars text={dict.hero.line2} />
              </span>
            </span>
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
              {film.label[lang]} · Wien · 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
