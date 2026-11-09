"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { useQuote } from "@/components/quote/QuoteProvider";
import { scrollToId } from "@/lib/scroll";
import { unmaskLines } from "@/lib/unmask";
import Parallax from "@/components/anim/Parallax";
import Wordmark from "@/components/Wordmark";
import Chapter from "./Chapter";

/*
  The cover.

  A magazine prints its masthead on the cover, and the running head only
  appears once you turn the page — so the masthead lives here, in the flow,
  and the fixed bar (Nav) fades in as it scrolls away. No spacer arithmetic,
  and the big BANDITA is simply the top of the page.

  Below it: the chapter head, the line, one cover image, and a text link.
  No film, no paragraph, no pill. The line is the whole argument.
*/

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
          {/* A non-breaking space: an inline-block holding only an ordinary
              space collapses to nothing, and the line reads "Bravwar". */}
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

  useEffect(() => {
    if (!introDone) return;
    const el = root.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el.querySelectorAll(".cv-anim"), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll(".cv-char"), { yPercent: 0 });
      unmaskLines(el, ".cv-line");
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      // The masthead is already on screen when the intro clears — it is
      // what the intro's particles become — so it only settles, it does not
      // arrive.
      tl.from(".cv-mast", { opacity: 0, y: 14, duration: 1.1 })
        .from(".cv-rule", { scaleX: 0, transformOrigin: "left center", duration: 1.0 }, "-=0.7")
        .from(".cv-meta", { opacity: 0, duration: 0.8 }, "-=0.8")
        // the line is set letter by letter, like type
        .from(
          ".cv-char",
          {
            yPercent: 115,
            duration: 1.0,
            stagger: 0.03,
            onComplete: () => unmaskLines(el, ".cv-line"),
          },
          "-=0.5",
        )
        .from(".cv-image", { opacity: 0, y: 30, duration: 1.2 }, "-=0.9")
        .from(".cv-anim", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "-=0.8");
    }, el);
    return () => ctx.revert();
  }, [introDone, reducedMotion]);

  return (
    <section id="top" ref={root} className="relative overflow-hidden px-5 pb-16 pt-6 text-ink md:px-10 md:pb-20 md:pt-8">
      <div className="mx-auto max-w-[1600px]">
        {/* ── masthead ─────────────────────────────────────────────────── */}
        <div className="cv-meta flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.42em] text-ink/55 md:text-[11px]">
          <span>{de ? "Kreativ- & Marketingagentur" : "Creative & Marketing Agency"}</span>
          <span className="hidden sm:inline">Wien</span>
        </div>
        <div className="cv-rule mt-3 h-px bg-ink" />

        <div className="cv-mast flex justify-center py-7 md:py-9">
          <Wordmark className="text-[15vw] sm:text-[12.5vw] lg:text-[10vw] xl:text-[8.5rem]" />
        </div>

        <div className="cv-rule h-px bg-ink" />

        {/* ── the cover itself ─────────────────────────────────────────── */}
        <Chapter n="01" title={de ? "Titel" : "Cover"} className="cv-anim mt-8 md:mt-12" />

        {/* items-start, not items-end: the line has to be on the first
            screen. Bottom-aligned to a tall image it slid under the fold. */}
        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-start md:gap-8">
          {/* the line */}
          <h1 className="font-display font-medium leading-[0.9] tracking-[-0.02em] md:col-span-7">
            <span className="cv-line block overflow-hidden">
              <span className="block text-[17vw] md:text-[9.5vw]">
                <Chars text={dict.hero.line1} />
              </span>
            </span>{" "}
            <span className="cv-line block overflow-hidden">
              <span className="block text-[17vw] italic text-pink md:text-[9.5vw]">
                <Chars text={dict.hero.line2} />
              </span>
            </span>
          </h1>

          {/* the cover image */}
          <figure className="cv-image md:col-span-5">
            <Parallax speed={-30}>
              <div className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
                <Image
                  src="/work/film-02.jpg"
                  alt={de ? "Bandita — Filmproduktion" : "Bandita — film production"}
                  fill
                  priority
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Parallax>
            <figcaption className="mt-3 flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.3em] text-ink/50">
              <span>{de ? "Filmproduktion" : "Film production"}</span>
              <span>Wien · 2026</span>
            </figcaption>
          </figure>
        </div>

        {/* ── the ask, as a line of type ───────────────────────────────── */}
        <div className="cv-anim mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 font-sans text-xs uppercase tracking-[0.3em] md:mt-14">
          <button
            onClick={() => open()}
            data-cursor="hover"
            className="group inline-flex items-center gap-3 text-ink transition-colors hover:text-pink"
          >
            {dict.hero.ctaPrimary}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <button
            onClick={() => scrollToId("work")}
            data-cursor="link"
            className="inline-flex items-center gap-3 text-ink/50 transition-colors hover:text-ink"
          >
            {de ? "Arbeiten ansehen" : "See the work"}
            <span aria-hidden>↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
