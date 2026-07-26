"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { STATIONS, projectMedia } from "./portfolio-data";
import { setMood } from "@/lib/portfolio-scene";
import MagneticButton from "@/components/MagneticButton";
import { scrollToId } from "@/lib/scroll";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function PortfolioProject({
  index,
  lang,
  dict,
  onBack,
  onSelect,
  reduced,
}: {
  index: number;
  lang: Locale;
  dict: Dictionary;
  onBack: () => void;
  onSelect: (i: number) => void;
  reduced: boolean;
}) {
  const t = dict.portfolio;
  const st = STATIONS[index];
  const media = projectMedia(st);
  const root = useRef<HTMLDivElement>(null);
  const next = (index + 1) % STATIONS.length;

  useEffect(() => {
    setMood(st.color);
    window.scrollTo(0, 0);
  }, [st.color, index]);

  // scroll reveals + gentle parallax + pointer tilt
  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".pf-media").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 90, rotateX: 8, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
        const img = el.querySelector<HTMLElement>(".pf-inner");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -6 },
            { yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        }
      });
      gsap.fromTo(
        ".pf-title-line",
        { opacity: 0, yPercent: 120, rotateX: -50 },
        { opacity: 1, yPercent: 0, rotateX: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.1 },
      );
    }, root);
    return () => ctx.revert();
  }, [index, reduced]);

  const onTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = e.currentTarget.querySelector<HTMLElement>(".pf-inner");
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: px * 8, rotateX: -py * 8, duration: 0.5, ease: "power3.out", transformPerspective: 1000 });
  };
  const onLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget.querySelector<HTMLElement>(".pf-inner");
    if (el) gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1,0.5)" });
  };

  return (
    <div ref={root} className="relative z-10 min-h-screen text-creme">
      {/* top bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-24 md:px-10 md:pt-28">
        <button
          type="button"
          onClick={onBack}
          data-cursor="link"
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-creme/80 backdrop-blur transition-colors hover:text-pink"
        >
          ← {t.overview}
        </button>
        <span className="font-sans text-[11px] tabular-nums tracking-[0.2em] text-creme/50">
          {String(index + 1).padStart(2, "0")} / {String(STATIONS.length).padStart(2, "0")}
        </span>
      </div>

      {/* index rail */}
      <nav className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
        {STATIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-cursor="link"
            onClick={() => onSelect(i)}
            className="pointer-events-auto group flex items-center justify-end gap-2"
            aria-label={s.name[lang]}
          >
            <span className="whitespace-nowrap font-sans text-[10px] uppercase tracking-[0.16em] text-creme/0 transition-colors duration-300 group-hover:text-creme/70">
              {s.name[lang]}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === index ? st.color : "rgba(245,236,230,0.3)",
                transform: i === index ? "scale(1.6)" : "scale(1)",
              }}
            />
          </button>
        ))}
      </nav>

      {/* hero title */}
      <header className="mx-auto max-w-[1500px] px-5 pt-36 md:px-10 md:pt-44">
        <div className="flex items-baseline gap-4">
          <span
            className="font-display text-6xl font-medium leading-none tracking-[-0.02em] md:text-8xl"
            style={{ color: st.color }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-creme/15" />
        </div>
        <h1 className="mt-6 overflow-hidden">
          <span className="pf-title-line block font-display text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-7xl md:text-8xl">
            {st.name[lang]}
          </span>
        </h1>
        <p className="pf-title-line mt-5 font-sans text-xs uppercase tracking-[0.28em] text-creme/60">
          {st.tag[lang]}
        </p>
        {st.note && (
          <p className="pf-title-line mt-6 max-w-xl font-display text-xl italic leading-snug text-creme/80 md:text-2xl">
            {st.note[lang]}
          </p>
        )}
      </header>

      {/* media stream */}
      <div className="mx-auto mt-20 flex max-w-[1300px] flex-col gap-16 px-5 pb-16 md:mt-28 md:gap-28 md:px-10">
        {media.map((m, i) => (
          <figure
            key={m.src}
            className="pf-media relative [transform-style:preserve-3d]"
            onPointerMove={onTilt}
            onPointerLeave={onLeave}
          >
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem] opacity-40 blur-3xl"
              style={{ background: `radial-gradient(closest-side, ${st.color}55, transparent)` }}
            />
            <div className="pf-inner overflow-hidden rounded-[1.1rem] ring-1 ring-creme/10 will-change-transform">
              {m.isVideo ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={m.src}
                  poster={m.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="mx-auto max-h-[82vh] w-full bg-black object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.src}
                  alt={`${st.name[lang]} — ${st.tag[lang]} (${i + 1})`}
                  loading="lazy"
                  className="mx-auto max-h-[82vh] w-full bg-[#0d0b0e] object-contain"
                />
              )}
            </div>
            <figcaption className="mt-3 flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.2em] text-creme/40">
              <span>{st.name[lang]}</span>
              <span className="tabular-nums">
                {String(i + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* footer — next project + CTA */}
      <footer className="mx-auto max-w-[1300px] border-t border-creme/10 px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <button
            type="button"
            onClick={() => onSelect(next)}
            data-cursor="link"
            className="group text-left"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-creme/45">{t.nextProject}</span>
            <span
              className="mt-2 block font-display text-4xl font-medium leading-none tracking-[-0.01em] transition-colors md:text-6xl"
              style={{ color: "inherit" }}
            >
              <span className="transition-colors group-hover:text-pink">{STATIONS[next].name[lang]} →</span>
            </span>
          </button>
          <MagneticButton
            as="a"
            href={`/${lang}#contact`}
            onClick={() => scrollToId("contact")}
            strength={0.5}
            className="shrink-0 rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink"
          >
            {t.cta}
          </MagneticButton>
        </div>
      </footer>
    </div>
  );
}
