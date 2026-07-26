"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { STATIONS, coverOf, mediaCount } from "./portfolio-data";
import { portfolio, setMood } from "@/lib/portfolio-scene";

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
        el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
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
            style={{ transition: "transform 200ms ease-out" }}
          >
            {STATIONS.map((st, i) => {
              const depth = ((i % 4) - 1.5) * 10; // gentle concave wall
              return (
                <button
                  key={st.id}
                  type="button"
                  data-cursor="link"
                  onClick={() => onOpen(i)}
                  onMouseEnter={() => setMood(st.color)}
                  onMouseLeave={() => setMood(null)}
                  className="portfolio-card group relative block overflow-hidden rounded-[1rem] text-left ring-1 ring-creme/10 [transform-style:preserve-3d]"
                  style={{
                    transform: `translateZ(${depth}px)`,
                    animation: reduced ? undefined : `cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both`,
                    animationDelay: reduced ? undefined : `${0.04 * i}s`,
                  }}
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
      </div>
    </div>
  );
}
