"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { STATIONS, coverOf, mediaCount } from "./portfolio-data";
import { portfolio, setMood } from "@/lib/portfolio-scene";
import { useQuote } from "@/components/quote/QuoteProvider";
import { INSTAGRAM, utm } from "@/lib/social";
import { InstagramIcon } from "@/components/SocialIcons";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function PortfolioWall({
  lang,
  dict,
  onOpen,
  reduced,
}: {
  lang: Locale;
  dict: Dictionary;
  onOpen: (index: number) => void;
  reduced: boolean;
}) {
  const t = dict.portfolio;
  const { open: openQuote } = useQuote();
  const gridRef = useRef<HTMLDivElement>(null);

  // pointer parallax — the whole wall tilts subtly toward the cursor
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const loop = () => {
      const el = gridRef.current;
      if (el) {
        const rx = portfolio.pointerY * 4.5;
        const ry = portfolio.pointerX * 5.5;
        el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // scroll-driven life: cards enter on scroll, columns drift at different
  // speeds, and each card counter-rotates a touch as it travels the viewport
  useEffect(() => {
    if (reduced || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".portfolio-card").forEach((el, i) => {
        const col = i % 4;
        const depthSpeed = 40 + col * 26; // outer columns travel further
        gsap.fromTo(
          el,
          { yPercent: 18, autoAlpha: 0, rotateX: -12 },
          {
            yPercent: 0,
            autoAlpha: 1,
            rotateX: 0,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 96%", end: "top 62%", scrub: 1 },
          },
        );
        gsap.fromTo(
          el,
          { y: depthSpeed },
          {
            y: -depthSpeed,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, gridRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="relative z-10 min-h-screen px-5 pb-28 pt-28 md:px-10 md:pt-32">
      <div className="mx-auto max-w-[1600px]">
        {/* header */}
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{t.enter}</span>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.01em] text-creme sm:text-6xl md:text-7xl">
              {t.fallbackHeading}
            </h1>
          </div>
          <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-creme/50">
            {STATIONS.length} {t.projects}
          </p>
        </div>

        {/* 3D card wall */}
        <div style={{ perspective: "1800px" }}>
          <div
            ref={gridRef}
            className="grid grid-cols-2 gap-4 [transform-style:preserve-3d] will-change-transform sm:grid-cols-3 md:gap-6 lg:grid-cols-4"
            style={{
              transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
              transition: "transform 200ms ease-out",
            }}
          >
            {STATIONS.map((st, i) => {
              return (
                <button
                  key={st.id}
                  type="button"
                  data-cursor="link"
                  onClick={() => onOpen(i)}
                  onMouseEnter={() => setMood(st.color)}
                  onMouseLeave={() => setMood(null)}
                  className="portfolio-card group relative block overflow-hidden rounded-[1rem] text-left ring-1 ring-creme/10"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0d0b0e]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverOf(st)}
                      alt={`${st.name[lang]} — ${st.tag[lang]}`}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-85 grayscale transition-all duration-700 group-hover:scale-[1.06] group-hover:opacity-100 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-[#08070a]/25 to-transparent" />
                    {/* mood accent line */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: st.color }}
                    />
                    {/* index */}
                    <span className="absolute left-4 top-3 font-sans text-[11px] tabular-nums tracking-[0.2em] text-creme/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {st.video && (
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 font-sans text-[9px] uppercase tracking-[0.18em] text-creme/80 backdrop-blur">
                        ▶ Film
                      </span>
                    )}
                    {/* name block */}
                    <div className="absolute inset-x-4 bottom-4">
                      <h2 className="font-display text-xl font-medium leading-tight tracking-[-0.01em] text-creme md:text-2xl">
                        {st.name[lang]}
                      </h2>
                      <p className="mt-1 flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] text-creme/60">
                        <span style={{ color: st.color }}>{st.tag[lang]}</span>
                        <span className="text-creme/30">· {mediaCount(st)}</span>
                      </p>
                    </div>
                    {/* view cue */}
                    <span className="absolute right-4 bottom-4 translate-y-1 font-sans text-lg text-creme/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-creme">
                      ↗
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cross-link into Services — "you've seen it, here's how we make it" */}
        <div className="mt-24 flex flex-col items-center gap-6 rounded-[1.75rem] border border-creme/12 bg-creme/[0.03] px-6 py-16 text-center backdrop-blur-sm md:mt-32 md:py-20">
          <span className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
            {lang === "de" ? "So entsteht das" : "How it's made"}
          </span>
          <h2 className="max-w-3xl font-display text-3xl font-medium leading-[1.05] tracking-[-0.01em] text-creme sm:text-5xl md:text-6xl">
            {lang === "de"
              ? "Du hast die Arbeit gesehen. Jetzt sieh, was wir alles können."
              : "You've seen the work. Now see everything we do."}
          </h2>
          <p className="max-w-xl font-sans text-base leading-relaxed text-creme/60">
            {lang === "de"
              ? "Branding, Film, Web, Social, KI-Content und mehr — mit echten Preisen und Startermodellen."
              : "Branding, film, web, social, AI content and more — with real prices and starter models."}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/services`}
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink"
            >
              {lang === "de" ? "Leistungen & Preise" : "Services & Pricing"}
              <span aria-hidden>→</span>
            </Link>
            <button
              onClick={() => openQuote()}
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full border border-creme/40 px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:border-creme hover:bg-creme hover:text-ink"
            >
              {lang === "de" ? "Angebot anfordern" : "Request an offer"}
            </button>
          </div>

          {/* Instagram cross-sell */}
          <div className="mt-10 flex flex-col items-center gap-4 border-t border-creme/10 pt-10">
            <p className="font-display text-xl italic text-creme/70 md:text-2xl">
              {lang === "de" ? "Das war die Kurzfassung. Der Rest läuft auf Instagram." : "That was the short version. The rest runs on Instagram."}
            </p>
            <a
              href={utm(INSTAGRAM.url, "portfolio")}
              target="_blank" rel="noopener"
              aria-label={`Bandita ${lang === "de" ? "auf" : "on"} Instagram — ${INSTAGRAM.handle}`}
              data-cursor="hover"
              className="inline-flex items-center gap-2.5 rounded-full border border-creme/30 px-8 py-3.5 font-sans text-xs uppercase tracking-[0.14em] text-creme transition-all hover:border-transparent hover:bg-[#E4405F] hover:text-white focus-visible:ring-2 focus-visible:ring-pink/60"
            >
              <InstagramIcon className="h-4 w-4" /> {INSTAGRAM.handle}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
