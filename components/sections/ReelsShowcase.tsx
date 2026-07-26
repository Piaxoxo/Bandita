"use client";

import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";

/*
  "Reels we produce" — a moving strip of BANDITA's own content films (drinks,
  bar, food) in vertical phone-format frames, autoplaying muted on loop. The
  strip glides continuously like a feed and pauses on hover.
*/

const REELS = [
  { src: "/video/reel-mojito.mp4", poster: "/video/reel-mojito.jpg", de: "Bar & Nightlife", en: "Bar & Nightlife" },
  { src: "/video/cocktail.mp4", poster: "/video/cocktail.jpg", de: "Getränke-Film", en: "Beverage film" },
  { src: "/video/reel-ice.mp4", poster: "/video/reel-ice.jpg", de: "Cinematic Product", en: "Cinematic product" },
  { src: "/video/reel-food.mp4", poster: "/video/reel-food.jpg", de: "Food & Genuss", en: "Food & flavour" },
];

const COPY = {
  de: {
    eyebrow: "Content & Social · Reels",
    heading: "Reels, die man nicht wegswipet.",
    sub: "Vom cinematischen Produktfilm bis zum Social-Reel — Content, den wir für Marken produzieren, der gespeichert und geteilt wird.",
  },
  en: {
    eyebrow: "Content & Social · Reels",
    heading: "Reels people don't swipe away.",
    sub: "From cinematic product films to scroll-stopping social reels — the content we produce for brands, made to be saved and shared.",
  },
};

function Reel({ src, poster, label }: { src: string; poster: string; label: string }) {
  return (
    <div className="group relative aspect-[9/16] w-[210px] shrink-0 overflow-hidden rounded-2xl bg-ink shadow-[0_20px_50px_-20px_rgba(20,12,18,0.5)] ring-1 ring-ink/10 md:w-[260px]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
      <span className="absolute bottom-4 left-4 font-sans text-[11px] uppercase tracking-[0.22em] text-creme">
        {label}
      </span>
    </div>
  );
}

export default function ReelsShowcase({ lang }: { lang: Locale }) {
  const t = COPY[lang] ?? COPY.de;
  const strip = [...REELS, ...REELS]; // duplicated for a seamless marquee

  return (
    <section id="reels" className="relative overflow-hidden py-28 md:py-40">
      <div data-fly className="mx-auto mb-14 max-w-[1400px] px-5 md:mb-20 md:px-10">
        <Reveal>
          <p className="mb-6 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{t.eyebrow}</p>
        </Reveal>
        <Reveal as="h2" className="max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] text-ink sm:text-5xl md:text-6xl">
          {t.heading}
        </Reveal>
        <Reveal>
          <p className="mt-8 max-w-2xl font-sans text-lg leading-relaxed text-ink/65">{t.sub}</p>
        </Reveal>
      </div>

      {/* edge fades */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-creme to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-creme to-transparent md:w-32" />
        <div className="reel-marquee flex w-max gap-5 md:gap-7">
          {strip.map((r, i) => (
            <Reel key={i} src={r.src} poster={r.poster} label={lang === "en" ? r.en : r.de} />
          ))}
        </div>
      </div>
    </section>
  );
}
