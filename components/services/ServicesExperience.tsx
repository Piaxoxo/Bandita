"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import Reveal from "@/components/anim/Reveal";
import Reveal3D from "@/components/anim/Reveal3D";
import SplitText from "@/components/anim/SplitText";
import MagneticButton from "@/components/MagneticButton";
import ContactCTA from "@/components/sections/ContactCTA";
import InlineCTA from "@/components/InlineCTA";
import { useQuote } from "@/components/quote/QuoteProvider";
import {
  HERO, CHAPTERS, AISTUDIO, CATALOGUE, INDUSTRIES,
  PRICING, BLACK, EXCLUSIVES, ADDONS, MORE, PROCESS, CLOSE, OFFER,
} from "./services-data";
import type { Chapter } from "./services-data";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Cheap, GPU-friendly 3D tilt.
function useTilt(reduced: boolean, max = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (reduced || !el || busy.current) return;
    busy.current = true;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    requestAnimationFrame(() => {
      busy.current = false;
      el.style.transition = "transform 0s";
      el.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  };
  return { ref, onMove, onLeave };
}

// Muted, looping, autoplay background video.
function AutoVideo({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (v) { v.muted = true; v.play().catch(() => {}); }
  }, []);
  return (
    <video ref={ref} className={className} autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden>
      <source src={src} type="video/mp4" />
    </video>
  );
}

function Chips({ active, onPick, all, filters, lang }: {
  active: string; onPick: (k: string) => void; all: string;
  filters: { key: string; label: { en: string; de: string } }[]; lang: Locale;
}) {
  const base = "rounded-full px-4 py-2 font-sans text-[13px] uppercase tracking-[0.08em] transition-colors";
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      <button data-cursor="link" onClick={() => onPick("all")}
        className={`${base} ${active === "all" ? "bg-ink text-creme" : "border border-ink/15 text-ink/70 hover:border-ink/40"}`}>{all}</button>
      {filters.map((f) => (
        <button key={f.key} data-cursor="link" onClick={() => onPick(f.key)}
          className={`${base} ${active === f.key ? "bg-pink text-creme" : "border border-ink/15 text-ink/70 hover:border-pink hover:text-pink"}`}>{f.label[lang]}</button>
      ))}
    </div>
  );
}

// Recurring "tailored offer" band.
function OfferBand({ lang, onOpen }: { lang: Locale; onOpen: () => void }) {
  return (
    <section className="relative overflow-hidden bg-pink px-5 py-20 text-center text-creme md:py-24">
      <div aria-hidden className="motion-only pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(255,255,255,0.4), transparent 70%)" }} />
      <div className="relative mx-auto max-w-3xl">
        <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-creme/80">{OFFER.bandKicker[lang]}</p></Reveal>
        <Reveal as="h2" className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.01em] md:text-5xl">{OFFER.bandHeading[lang]}</Reveal>
        <Reveal><p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-creme/85 md:text-lg">{OFFER.bandSub[lang]}</p></Reveal>
        <Reveal className="mt-9">
          <MagneticButton onClick={onOpen} strength={0.5}
            className="rounded-full bg-creme px-10 py-4 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme">
            {OFFER.cta[lang]}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

const TAG_TO_SERVICE: Record<string, string> = {
  aicontent: "ai", ai: "ai", web: "web", social: "social", film: "film", seo: "seo", premium: "fullservice",
};
const prefillFor = (tags: string[]) => tags.map((t) => TAG_TO_SERVICE[t]).find(Boolean) ?? null;

// catalogue category → offer-builder service preselection
const CAT_TO_SERVICE: Record<string, string> = {
  brand: "brand", web: "web", ai: "ai", seo: "seo", social: "social",
  film: "film", audio: "audio", events: "events", print: "merch", hospitality: "fullservice",
};

export default function ServicesExperience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const [catFilter, setCatFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [activeSec, setActiveSec] = useState("");
  const { open: openQuote } = useQuote();
  const hero = useTilt(r, 7);
  const clusterRef = useRef<HTMLDivElement>(null);

  const NAV = [
    { id: "leistungen", label: { en: "Services", de: "Leistungen" } },
    { id: "preise", label: { en: "Pricing", de: "Preise" } },
    { id: "disziplinen", label: { en: "Disciplines", de: "Disziplinen" } },
    { id: "ai-studio", label: { en: "AI Studio", de: "AI Studio" } },
    { id: "contact", label: { en: "Contact", de: "Kontakt" } },
  ];

  // active section for the sticky sub-nav
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActiveSec(vis.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // subtle scroll parallax on the hero cluster (single trigger, transform-only)
  useEffect(() => {
    if (r || !clusterRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(clusterRef.current, { y: 40 }, {
        y: -60, ease: "none",
        scrollTrigger: { trigger: clusterRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [r]);

  const cats = useMemo(
    () => (catFilter === "all" ? CATALOGUE.categories : CATALOGUE.categories.filter((c) => c.key === catFilter)),
    [catFilter],
  );
  const tiers = useMemo(
    () => (priceFilter === "all" ? PRICING.tiers : PRICING.tiers.filter((t) => t.tags.includes(priceFilter))),
    [priceFilter],
  );

  return (
    <div className="relative bg-creme text-ink">
      {/* ① HERO — 3D cluster (with video) + headline */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pt-28 pb-16 md:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 40% at 30% 30%, rgba(251,0,63,0.12), transparent 70%)" }} />
        <div className="relative mx-auto grid w-full max-w-[1500px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal><p className="mb-6 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{HERO.eyebrow[lang]}</p></Reveal>
            <h1 className="font-display text-[12vw] font-medium leading-[0.9] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-[5.4vw]">
              <SplitText as="span" text={HERO.line1[lang]} className="block" />
              <SplitText as="span" text={HERO.line2[lang]} className="block italic text-pink" />
            </h1>
            <Reveal><p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-ink/70 md:text-lg">{HERO.sub[lang]}</p></Reveal>
            <Reveal className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton onClick={() => openQuote()} strength={0.5}
                className="rounded-full bg-pink px-8 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-ink">
                {OFFER.cta[lang]}
              </MagneticButton>
              <button onClick={() => scrollToId("preise")} data-cursor="link"
                className="rounded-full border border-ink/20 px-8 py-4 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:border-pink hover:text-pink">
                {lang === "de" ? "Leistungen & Preise" : "Services & Pricing"}
              </button>
            </Reveal>
            <Reveal className="mt-5">
              <Link href={`/${lang}/portfolio`} data-cursor="link" className="group inline-flex items-center gap-2 font-sans text-sm uppercase tracking-[0.12em] text-ink/60 transition-colors hover:text-pink">
                {HERO.button2[lang]} <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Reveal>
          </div>
          {/* 3D cluster */}
          <div className="relative hidden lg:block" style={{ perspective: "1400px" }}>
            <div ref={clusterRef} className="[transform-style:preserve-3d]">
              <div ref={hero.ref} onMouseMove={hero.onMove} onMouseLeave={hero.onLeave}
                className="relative mx-auto h-[520px] w-full max-w-[560px] [transform-style:preserve-3d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/work/film-01.jpg" alt="Bandita — Filmproduktion" loading="eager" decoding="async"
                  className="absolute left-[6%] top-[4%] h-[62%] w-[62%] rounded-2xl object-cover shadow-[0_40px_90px_-30px_rgba(20,12,18,0.6)]"
                  style={{ transform: "translateZ(60px)" }} />
                {/* front card = live reel */}
                <div className="absolute right-[2%] top-[24%] h-[56%] w-[46%] overflow-hidden rounded-2xl border-4 border-creme shadow-[0_40px_90px_-30px_rgba(20,12,18,0.65)]"
                  style={{ transform: "translateZ(130px)" }}>
                  <AutoVideo src="/portfolio/video/portugal-reel-01.mp4" poster="/portfolio/video/portugal-reel-01-poster.jpg" className="h-full w-full object-cover" />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/work/food-01.jpg" alt="Bandita — Food" loading="lazy" decoding="async"
                  className="absolute bottom-[2%] left-[18%] h-[38%] w-[40%] rounded-2xl border-4 border-creme object-cover shadow-[0_40px_90px_-30px_rgba(20,12,18,0.6)]"
                  style={{ transform: "translateZ(30px)" }} />
                <span aria-hidden className="absolute -right-2 top-[14%] h-24 w-24 rounded-2xl bg-pink" style={{ transform: "translateZ(-10px)" }} />
              </div>
            </div>
          </div>
        </div>
        <span className="absolute bottom-7 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.3em] text-ink/40">↓</span>
      </section>

      {/* ② STICKY JUMP-NAV */}
      <div className="sticky top-[58px] z-40 border-y border-ink/10 bg-creme/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-4 py-2.5 md:px-10">
          <div className="flex flex-1 items-center gap-1 md:justify-center">
            {NAV.map((n) => (
              <button key={n.id} data-cursor="link" onClick={() => scrollToId(n.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 font-sans text-xs uppercase tracking-[0.12em] transition-colors ${
                  activeSec === n.id ? "bg-pink text-creme" : "text-ink/60 hover:text-pink"}`}>
                {n.label[lang]}
              </button>
            ))}
          </div>
          <button onClick={() => openQuote()} data-cursor="link"
            className="ml-2 hidden whitespace-nowrap rounded-full bg-ink px-4 py-1.5 font-sans text-xs uppercase tracking-[0.12em] text-creme transition-colors hover:bg-pink md:inline-flex">
            {OFFER.ctaShort[lang]}
          </button>
        </div>
      </div>

      {/* ③ LEISTUNGEN — filterable catalogue */}
      <section id="leistungen" className="relative px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="text-center">
            <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{CATALOGUE.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{CATALOGUE.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-4 max-w-xl font-sans text-base text-ink/60 md:text-lg">{CATALOGUE.sub[lang]}</p></Reveal>
          </div>
          <div className="mt-10"><Chips active={catFilter} onPick={setCatFilter} all={CATALOGUE.allLabel[lang]} filters={CATALOGUE.filters} lang={lang} /></div>
          <Reveal3D key={catFilter} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <div key={cat.num} className="flex flex-col rounded-3xl border border-ink/10 bg-ink/[0.015] p-7 transition-colors hover:border-pink/40">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-medium text-pink">{cat.num}</span>
                  <h3 className="font-display text-xl font-medium leading-tight tracking-[-0.01em]">{cat.title[lang]}</h3>
                </div>
                <p className="mt-3 font-display text-lg italic text-ink/70">{cat.claim[lang]}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {cat.items.map((it) => (<span key={it} className="rounded-full border border-ink/12 px-2.5 py-1 font-sans text-[12px] text-ink/70">{it}</span>))}
                </div>
                <button
                  onClick={() => openQuote(CAT_TO_SERVICE[cat.key] ?? null)}
                  data-cursor="link"
                  className="group mt-6 inline-flex items-center gap-2 self-start font-sans text-xs uppercase tracking-[0.14em] text-pink transition-colors hover:text-ink"
                >
                  {lang === "de" ? "Angebot anfordern" : "Request an offer"}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            ))}
          </Reveal3D>
          <InlineCTA
            lang={lang}
            de="Nicht sicher, was du brauchst? Wir schon — nach einem Gespräch."
            en="Not sure what you need? We will be — after one call."
            buttonDe="Unverbindlich anfragen"
            buttonEn="Ask us — non-binding"
          />
        </div>
      </section>

      {/* ④ PREISE */}
      <section id="preise" className="relative bg-ink/[0.02] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="text-center">
            <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{PRICING.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{PRICING.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-ink/60 md:text-lg">{PRICING.sub[lang]}</p></Reveal>
          </div>
          <div className="mt-10"><Chips active={priceFilter} onPick={setPriceFilter} all={PRICING.allLabel[lang]} filters={PRICING.filters} lang={lang} /></div>
          <Reveal3D key={priceFilter} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {tiers.map((t) => {
              const feat = !!t.featured;
              return (
                <div key={t.id}
                  className={`relative flex flex-col rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1 ${feat ? "bg-ink text-creme shadow-[0_30px_70px_-35px_rgba(20,12,18,0.6)]" : "border border-ink/12 bg-creme text-ink"}`}>
                  {feat && <span className="absolute right-6 top-6 rounded-full bg-pink px-3 py-1 font-sans text-[10px] uppercase tracking-[0.16em] text-creme">{PRICING.featuredLabel[lang]}</span>}
                  <h3 className="pr-16 font-display text-2xl font-medium tracking-[-0.01em]">{t.name}</h3>
                  <p className={`mt-1 font-sans text-sm ${feat ? "text-creme/65" : "text-ink/55"}`}>{t.tagline[lang]}</p>
                  <p className={`mt-5 font-display text-3xl font-medium ${feat ? "text-creme" : "text-ink"}`}>{t.price}</p>
                  <ul className={`mt-5 flex-1 space-y-2 font-sans text-[14px] ${feat ? "text-creme/80" : "text-ink/70"}`}>
                    {t.features.map((f, fi) => (<li key={fi} className="flex items-start gap-2.5"><span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />{f}</li>))}
                  </ul>
                  <button onClick={() => openQuote(prefillFor(t.tags))} data-cursor="link"
                    className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.14em] transition-colors ${feat ? "bg-creme text-ink hover:bg-pink hover:text-creme" : "bg-ink text-creme hover:bg-pink"}`}>
                    {PRICING.button[lang]}
                  </button>
                </div>
              );
            })}
          </Reveal3D>

          <div className="mt-14 rounded-3xl border border-ink/10 bg-creme p-8 md:p-12">
            <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.3em] text-pink">{ADDONS.kicker[lang]}</p>
            <h3 className="font-display text-3xl font-medium tracking-[-0.01em] md:text-4xl">{ADDONS.heading[lang]}</h3>
            <div className="mt-8 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {ADDONS.items.map((a) => (
                <div key={a.label.en} className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3">
                  <span className="font-sans text-[15px] text-ink/80">{a.label[lang]}</span>
                  <span className="whitespace-nowrap font-display text-base italic text-pink">{a.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ⑤ TAILORED-OFFER band */}
      <OfferBand lang={lang} onOpen={() => openQuote()} />

      {/* ⑥ BANDITA BLACK */}
      <section className="relative overflow-hidden bg-ink px-5 py-24 text-creme md:px-10 md:py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 60% at 85% 40%, rgba(251,0,63,0.22), transparent 70%)" }} />
        <div className="relative mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{BLACK.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{BLACK.heading[lang]}</Reveal>
            <Reveal><p className="mt-6 max-w-md font-sans text-base leading-relaxed text-creme/70 md:text-lg">{BLACK.sub[lang]}</p></Reveal>
            <Reveal className="mt-8 flex items-baseline gap-3">
              <span className="font-display text-4xl font-medium md:text-5xl">{BLACK.price}</span>
              <span className="font-sans text-sm uppercase tracking-[0.14em] text-creme/50">{BLACK.priceNote[lang]}</span>
            </Reveal>
            <Reveal className="mt-8">
              <MagneticButton onClick={() => openQuote("fullservice")} strength={0.5}
                className="rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink">
                {BLACK.button[lang]}
              </MagneticButton>
            </Reveal>
          </div>
          <Reveal3D className="flex flex-wrap gap-2.5" stagger={0.03}>
            {BLACK.features.map((f) => (
              <span key={f} className="rounded-full border border-creme/15 bg-creme/[0.03] px-4 py-2 font-sans text-sm text-creme/80">{f}</span>
            ))}
          </Reveal3D>
        </div>
      </section>

      {/* ⑦ MARQUEE divider */}
      <section className="relative overflow-hidden border-b border-ink/10 py-12">
        <div className="relative flex overflow-hidden">
          <div className={`marquee-track ${r ? "" : "animate-[marquee-left_38s_linear_infinite]"}`}>
            {[...MORE.items, ...MORE.items].map((it, i) => (
              <span key={i} className="mx-6 font-display text-3xl font-medium text-ink/20 md:text-5xl">{it}<span className="mx-6 text-pink">·</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* ⑧ DISZIPLINEN — 3D tilt card grid */}
      <section id="disziplinen" className="relative px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 text-center">
            <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{lang === "de" ? "Die Disziplinen" : "The Disciplines"}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">
              {lang === "de" ? "Acht Disziplinen. Eine Handschrift." : "Eight disciplines. One handwriting."}
            </Reveal>
          </div>
          <Reveal3D className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((c) => (<DisciplineCard key={c.id} c={c} lang={lang} reduced={r} />))}
          </Reveal3D>
        </div>
      </section>

      {/* ⑨ SHOWREEL — cinematic video band */}
      <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
        <AutoVideo src="/portfolio/video/deutschland-gta.mp4" poster="/portfolio/video/deutschland-gta-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-creme">
          <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">Showreel</p></Reveal>
          <Reveal as="h2" className="max-w-3xl font-display text-4xl font-medium leading-[1.03] tracking-[-0.02em] md:text-6xl">
            {lang === "de" ? "Gedreht wie ein Film. Gebaut, um zu verkaufen." : "Shot like a film. Built to sell."}
          </Reveal>
          <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${lang}/portfolio`} data-cursor="hover"
              className="rounded-full bg-creme px-8 py-4 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-pink hover:text-creme">
              {HERO.button2[lang]}
            </Link>
            <button onClick={() => openQuote("film")} data-cursor="link"
              className="rounded-full border border-creme/40 px-8 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:border-creme hover:bg-creme hover:text-ink">
              {OFFER.ctaShort[lang]}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ⑩ BROWSE BY INDUSTRY */}
      <section id="industries" className="relative bg-ink/[0.02] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="text-center">
            <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{INDUSTRIES.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{INDUSTRIES.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-4 max-w-xl font-sans text-base text-ink/60 md:text-lg">{INDUSTRIES.sub[lang]}</p></Reveal>
          </div>
          <Reveal3D className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.items.map((ind) => (
              <Link key={ind.id} href={`/${lang}/portfolio`} data-cursor="link"
                className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-creme p-7 transition-all duration-300 hover:-translate-y-1 hover:border-pink hover:shadow-[0_24px_50px_-28px_rgba(20,12,18,0.3)]">
                <span className="text-3xl">{ind.emoji}</span>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.01em] group-hover:text-pink">{ind.name[lang]}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ind.items.map((it) => (<span key={it} className="rounded-full border border-ink/12 px-2.5 py-1 font-sans text-[12px] text-ink/65">{it}</span>))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.12em] text-ink/50 group-hover:text-pink">
                  {lang === "de" ? "Arbeiten ansehen" : "See the work"} <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </Reveal3D>
        </div>
      </section>

      {/* ⑪ AI STUDIO */}
      <section id="ai-studio" className="relative overflow-hidden bg-ink px-5 py-24 text-creme md:px-10 md:py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 40% at 50% 0%, rgba(251,0,63,0.28), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="text-center">
            <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{AISTUDIO.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-7xl">{AISTUDIO.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-creme/70 md:text-lg">{AISTUDIO.sub[lang]}</p></Reveal>
          </div>
          <Reveal3D className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
            {AISTUDIO.studios.map((s) => (
              <div key={s.id} className="group flex flex-col overflow-hidden rounded-3xl border border-creme/10 bg-creme/[0.03] transition-colors hover:border-creme/25">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {s.id === "video" ? (
                    <AutoVideo src="/portfolio/video/portugal-reel-02.mp4" poster="/portfolio/video/portugal-reel-02-poster.jpg"
                      className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={`Bandita ${s.name[lang]}`} loading="lazy" decoding="async"
                      className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: s.color }} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-medium tracking-[-0.01em]">{s.name[lang]}</h3>
                  <p className="mt-2 font-display text-lg italic" style={{ color: s.color }}>{s.claim[lang]}</p>
                  <div className="mt-3 space-y-2 font-sans text-sm leading-relaxed text-creme/65">
                    {s.lines.map((l, li) => <p key={li}>{l[lang]}</p>)}
                  </div>
                  <div className="mt-5">
                    <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-creme/40">{s.tagsLabel[lang]}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map((t) => (<span key={t} className="rounded-full border border-creme/15 px-2.5 py-1 font-sans text-[11px] text-creme/70">{t}</span>))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Reveal3D>
          <Reveal className="mt-12 flex flex-wrap justify-center gap-4 text-center">
            <MagneticButton onClick={() => openQuote("ai")} strength={0.5}
              className="rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink">
              {OFFER.cta[lang]}
            </MagneticButton>
            <button onClick={() => scrollToId("preise")} data-cursor="link"
              className="rounded-full border border-creme/40 px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:border-creme hover:bg-creme hover:text-ink">
              {AISTUDIO.cta[lang]}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ⑫ EXCLUSIVES */}
      <section className="relative px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{EXCLUSIVES.kicker[lang]}</p></Reveal>
          <Reveal as="h2" className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{EXCLUSIVES.heading[lang]}</Reveal>
          <div className="mt-10 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {EXCLUSIVES.items.map((it) => (
              <div key={it} className="flex items-center gap-3 border-b border-ink/10 py-3.5 font-sans text-[15px] text-ink/80"><span className="text-pink">🩷</span>{it}</div>
            ))}
          </div>
          <InlineCTA
            lang={lang}
            de="Eines dieser Systeme für dein Business? Preis auf Anfrage."
            en="One of these systems for your business? Price on request."
            buttonDe="System anfragen"
            buttonEn="Request a system"
            prefill="ai"
          />
        </div>
      </section>

      {/* ⑬ PROCESS */}
      <section className="relative bg-ink/[0.02] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <Reveal><p className="mb-4 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{PROCESS.kicker[lang]}</p></Reveal>
          <Reveal as="h2" className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{PROCESS.heading[lang]}</Reveal>
          <Reveal3D className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.steps.map((s) => (
              <div key={s.num} className="border-t border-ink/15 pt-6">
                <span className="font-display text-5xl font-medium text-pink md:text-6xl">{s.num}</span>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.01em]">{s.title[lang]}</h3>
                <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/65">{s.body[lang]}</p>
              </div>
            ))}
          </Reveal3D>
          <InlineCTA
            lang={lang}
            de="Schritt 01 beginnt mit einer Nachricht. Kostenlos, unverbindlich."
            en="Step 01 starts with one message. Free, non-binding."
            buttonDe="Los geht's"
            buttonEn="Let's go"
          />
        </div>
      </section>

      {/* ⑭ CLOSING + tailored-offer band + contact */}
      <section className="relative px-5 pt-20 text-center md:pt-28">
        <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl">{CLOSE.heading[lang]}</Reveal>
        <Reveal className="mt-6 space-y-1 font-display text-xl italic text-ink/70 md:text-2xl">
          <p>{CLOSE.line1[lang]}</p><p>{CLOSE.line2[lang]}</p>
        </Reveal>
        <Reveal className="mt-10">
          <MagneticButton onClick={() => openQuote()} strength={0.5}
            className="rounded-full bg-pink px-10 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-ink">
            {OFFER.cta[lang]}
          </MagneticButton>
        </Reveal>
      </section>

      <ContactCTA dict={dict} lang={lang} />
    </div>
  );
}

// Discipline card: on-theme photo, 3D tilt on hover, links into the portfolio.
function DisciplineCard({ c, lang, reduced }: { c: Chapter; lang: Locale; reduced: boolean }) {
  const t = useTiltCard(reduced);
  return (
    <Link href={`/${lang}/portfolio`} data-cursor="hover"
      ref={t.ref} onMouseMove={t.onMove} onMouseLeave={t.onLeave}
      className="group relative block aspect-[3/4] overflow-hidden rounded-3xl [transform-style:preserve-3d]"
      style={{ willChange: "transform" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.images[0]} alt={`Bandita — ${c.title[lang]}`} loading="lazy" decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/10" />
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: c.color }} />
      <div className="absolute left-5 top-5 flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.2em] text-creme/80">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />{c.num}
      </div>
      <div className="absolute inset-x-5 bottom-5">
        <h3 className="font-display text-2xl font-medium leading-tight tracking-[-0.01em] text-creme">{c.title[lang]}</h3>
        <p className="mt-1 font-display text-base italic" style={{ color: c.color }}>{c.claim[lang]}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {c.services.slice(0, 4).map((s) => (<span key={s} className="rounded-full border border-creme/25 px-2 py-0.5 font-sans text-[10px] text-creme/85">{s}</span>))}
        </div>
        <span className="mt-3 inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-[0.14em] text-creme/70">
          {lang === "de" ? "Ansehen" : "See it"} <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

function useTiltCard(reduced: boolean) {
  const ref = useRef<HTMLAnchorElement>(null);
  const busy = useRef(false);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (reduced || !el || busy.current) return;
    busy.current = true;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    requestAnimationFrame(() => {
      busy.current = false;
      el.style.transition = "transform 0s";
      el.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateZ(0)`;
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  };
  return { ref, onMove, onLeave };
}
