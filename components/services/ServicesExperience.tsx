"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import SplitText from "@/components/anim/SplitText";
import MagneticButton from "@/components/MagneticButton";
import ContactCTA from "@/components/sections/ContactCTA";
import {
  HERO, INTRO, CHAPTERS, AISTUDIO, CATALOGUE, INDUSTRIES,
  PRICING, BLACK, EXCLUSIVES, ADDONS, MORE, PROCESS, CLOSE,
} from "./services-data";

// A proof photo that tilts toward the cursor and drifts on scroll — the "wow"
// without a full WebGL scene, keeping the light home look intact.
function TiltCard({
  src, alt, className = "", rounded = "rounded-2xl", reduced,
}: {
  src: string; alt: string; className?: string; rounded?: string; reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(ref.current, { rotateY: px * 12, rotateX: -py * 12, duration: 0.5, ease: "power3.out", transformPerspective: 900, transformOrigin: "center" });
  };
  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} data-cursor="hover"
      className={`overflow-hidden ${rounded} shadow-[0_30px_80px_-30px_rgba(20,12,18,0.45)] will-change-transform ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

// A small reusable filter-chip row.
function Chips({
  active, onPick, all, filters, lang,
}: {
  active: string;
  onPick: (k: string) => void;
  all: string;
  filters: { key: string; label: { en: string; de: string } }[];
  lang: Locale;
}) {
  const base = "rounded-full px-4 py-2 font-sans text-[13px] uppercase tracking-[0.08em] transition-colors";
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      <button data-cursor="link" onClick={() => onPick("all")}
        className={`${base} ${active === "all" ? "bg-ink text-creme" : "border border-ink/15 text-ink/70 hover:border-ink/40"}`}>
        {all}
      </button>
      {filters.map((f) => (
        <button key={f.key} data-cursor="link" onClick={() => onPick(f.key)}
          className={`${base} ${active === f.key ? "bg-pink text-creme" : "border border-ink/15 text-ink/70 hover:border-pink hover:text-pink"}`}>
          {f.label[lang]}
        </button>
      ))}
    </div>
  );
}

export default function ServicesExperience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const [active, setActive] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowIndex(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const secs = Array.from(root.current.querySelectorAll<HTMLElement>("[data-chapter]"));
    const ratios = new Map<HTMLElement, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target as HTMLElement, e.isIntersecting ? e.intersectionRatio : 0));
        let bestEl: HTMLElement | undefined;
        let bestR = 0;
        for (const s of secs) {
          const v = ratios.get(s) ?? 0;
          if (v >= bestR) { bestR = v; bestEl = s; }
        }
        if (bestEl && bestR > 0) setActive(Number(bestEl.dataset.chapter));
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-20% 0px -20% 0px" },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const cats = useMemo(
    () => (catFilter === "all" ? CATALOGUE.categories : CATALOGUE.categories.filter((c) => c.key === catFilter)),
    [catFilter],
  );
  const tiers = useMemo(
    () => (priceFilter === "all" ? PRICING.tiers : PRICING.tiers.filter((t) => t.tags.includes(priceFilter))),
    [priceFilter],
  );

  return (
    <div ref={root} className="relative bg-creme text-ink">
      {/* ── Sticky chapter index (desktop) ── */}
      <nav aria-label={HERO.index[lang]}
        className={`pointer-events-none fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 transition-opacity duration-500 xl:flex ${showIndex ? "opacity-100" : "opacity-0"}`}>
        {CHAPTERS.map((c, i) => {
          const on = active === i;
          return (
            <button key={c.id} onClick={() => scrollToId(`svc-${c.id}`)} data-cursor="link"
              className={`group flex items-center justify-end gap-3 text-right ${showIndex ? "pointer-events-auto" : "pointer-events-none"}`}>
              <span className={`whitespace-nowrap rounded-full bg-creme/85 px-2 py-0.5 font-sans text-[11px] uppercase tracking-[0.14em] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 ${on ? "text-ink" : "text-ink/50"}`}>
                {c.label[lang]}
              </span>
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="block rounded-full transition-all duration-300"
                  style={{ width: on ? 10 : 6, height: on ? 10 : 6, backgroundColor: on ? c.color : "rgba(26,18,22,0.25)" }} />
              </span>
            </button>
          );
        })}
      </nav>

      {/* ① HERO */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(251,0,63,0.22), rgba(255,92,158,0.10) 45%, transparent 70%)" }} />
        <Reveal>
          <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{HERO.eyebrow[lang]}</p>
        </Reveal>
        <h1 className="relative font-display text-[13vw] font-medium leading-[0.92] tracking-[-0.02em] md:text-[8.5vw]">
          <SplitText as="span" text={HERO.line1[lang]} className="block" />
          <SplitText as="span" text={HERO.line2[lang]} className="block italic text-pink" />
        </h1>
        <Reveal>
          <p className="mx-auto mt-9 max-w-2xl font-sans text-base leading-relaxed text-ink/70 md:text-lg">{HERO.sub[lang]}</p>
        </Reveal>
        <Reveal className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton onClick={() => scrollToId("svc-brand")} strength={0.5}
            className="rounded-full bg-ink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-pink">
            {HERO.button[lang]}
          </MagneticButton>
          <Link href={`/${lang}/portfolio`} data-cursor="link"
            className="rounded-full border border-ink/20 px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:border-pink hover:text-pink">
            {HERO.button2[lang]}
          </Link>
        </Reveal>
        <span className="absolute bottom-8 font-sans text-[10px] uppercase tracking-[0.3em] text-ink/40">↓</span>
      </section>

      {/* ② INTRO manifesto */}
      <section className="relative flex min-h-[70svh] items-center px-5 md:px-10">
        <div className="mx-auto max-w-[1100px] space-y-4">
          {INTRO.map((l, i) => (
            <Reveal as="p" key={i} delay={i * 0.04}
              className={`font-display text-3xl font-medium leading-[1.14] tracking-[-0.01em] sm:text-4xl md:text-5xl ${i === 1 ? "text-pink" : "text-ink"}`}>
              {l[lang]}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ③–⑩ CHAPTERS */}
      {CHAPTERS.map((c, i) => {
        const flip = i % 2 === 1;
        return (
          <section key={c.id} id={`svc-${c.id}`} data-chapter={i}
            className="relative flex min-h-[100svh] items-center overflow-hidden px-5 py-24 md:px-10">
            <div aria-hidden className="pointer-events-none absolute top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full opacity-40 blur-[130px]"
              style={{ background: `radial-gradient(circle, ${c.color}55, transparent 68%)`, left: flip ? "auto" : "-10vmin", right: flip ? "-10vmin" : "auto" }} />
            <span aria-hidden className="pointer-events-none absolute -z-0 select-none font-display font-semibold leading-none text-ink/[0.04]"
              style={{ fontSize: "34vw", top: "50%", transform: "translateY(-50%)", [flip ? "left" : "right"]: "-2vw" } as React.CSSProperties}>
              {c.num}
            </span>
            <div className={`relative mx-auto grid w-full max-w-[1400px] items-center gap-12 md:grid-cols-12 md:gap-16 ${flip ? "md:[direction:rtl]" : ""}`}>
              <div className={`md:col-span-6 ${flip ? "md:[direction:ltr]" : ""}`}>
                <Reveal>
                  <span className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.3em] text-ink/50">
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.num} · {c.label[lang]}
                  </span>
                </Reveal>
                <Reveal as="h2" y={26} className="mt-4 font-display text-3xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-4xl md:text-5xl">
                  {c.claim[lang]}
                </Reveal>
                <div className="mt-6 max-w-xl space-y-3 font-sans text-base leading-relaxed text-ink/70 md:text-lg">
                  {c.lines.map((l, li) => (
                    <Reveal as="p" key={li} delay={li * 0.05} blur={false} y={16}>{l[lang]}</Reveal>
                  ))}
                </div>
                <ul className="mt-8 flex flex-wrap gap-2.5">
                  {c.services.map((sv, si) => (
                    <Reveal as="li" key={sv} delay={si * 0.02} blur={false} y={10}
                      className="rounded-full border border-ink/12 bg-ink/[0.02] px-4 py-2 font-sans text-[13px] tracking-[0.01em] text-ink/75">
                      {sv}
                    </Reveal>
                  ))}
                </ul>
                {c.portfolioId && (
                  <Reveal className="mt-7">
                    <Link href={`/${lang}/portfolio`} data-cursor="link"
                      className="group inline-flex items-center gap-2 font-sans text-sm uppercase tracking-[0.12em] text-ink/70 transition-colors hover:text-pink">
                      {lang === "de" ? "Im Portfolio ansehen" : "See it in the portfolio"}
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </Reveal>
                )}
              </div>
              <div className={`md:col-span-6 ${flip ? "md:[direction:ltr]" : ""}`}>
                <Parallax speed={r ? 0 : -50}>
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px]">
                    <TiltCard src={c.images[0]} alt={`Bandita — ${c.title[lang]}`} reduced={r} className="absolute inset-0 z-10" />
                    {c.images[1] && (
                      <TiltCard src={c.images[1]} alt={`Bandita — ${c.title[lang]}`} reduced={r} rounded="rounded-xl"
                        className={`absolute -bottom-8 z-20 aspect-square w-[45%] border-4 border-creme ${flip ? "right-[-1.25rem]" : "left-[-1.25rem]"}`} />
                    )}
                    <span aria-hidden className="absolute -right-3 -top-3 z-0 h-24 w-24 rounded-2xl" style={{ backgroundColor: c.color, opacity: 0.9 }} />
                  </div>
                </Parallax>
              </div>
            </div>
          </section>
        );
      })}

      {/* ⑪ AI STUDIO — flagship */}
      <section id="ai-studio" className="relative overflow-hidden bg-ink px-5 py-28 text-creme md:px-10 md:py-40">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[60vmin] w-[90vmin] -translate-x-1/2 rounded-full opacity-40 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(251,0,63,0.5), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1400px]">
          <div className="text-center">
            <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{AISTUDIO.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-7xl">
              {AISTUDIO.heading[lang]}
            </Reveal>
            <Reveal><p className="mx-auto mt-7 max-w-2xl font-sans text-base leading-relaxed text-creme/70 md:text-lg">{AISTUDIO.sub[lang]}</p></Reveal>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AISTUDIO.studios.map((s, i) => (
              <Reveal key={s.id} delay={(i % 4) * 0.06}
                className="group flex flex-col overflow-hidden rounded-3xl border border-creme/10 bg-creme/[0.03] transition-colors hover:border-creme/25">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={`Bandita ${s.name[lang]}`} loading="lazy"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
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
                      {s.tags.map((t) => (
                        <span key={t} className="rounded-full border border-creme/15 px-2.5 py-1 font-sans text-[11px] text-creme/70">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <MagneticButton onClick={() => scrollToId("pricing")} strength={0.5}
              className="rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink">
              {AISTUDIO.cta[lang]}
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      {/* ⑫ OUR SERVICES — filterable catalogue */}
      <section id="catalogue" className="relative px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{CATALOGUE.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{CATALOGUE.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-5 max-w-xl font-sans text-base text-ink/60 md:text-lg">{CATALOGUE.sub[lang]}</p></Reveal>
          </div>
          <div className="mt-12">
            <Chips active={catFilter} onPick={setCatFilter} all={CATALOGUE.allLabel[lang]} filters={CATALOGUE.filters} lang={lang} />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cats.map((cat) => (
              <div key={cat.num} className="flex flex-col rounded-3xl border border-ink/10 bg-ink/[0.015] p-7 transition-colors hover:border-ink/25">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-medium text-pink">{cat.num}</span>
                  <h3 className="font-display text-xl font-medium leading-tight tracking-[-0.01em]">{cat.title[lang]}</h3>
                </div>
                <p className="mt-3 font-display text-lg italic text-ink/70">{cat.claim[lang]}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {cat.items.map((it) => (
                    <span key={it} className="rounded-full border border-ink/12 px-2.5 py-1 font-sans text-[12px] text-ink/70">{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑬ BROWSE BY INDUSTRY */}
      <section id="industries" className="relative bg-ink/[0.02] px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{INDUSTRIES.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{INDUSTRIES.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-5 max-w-xl font-sans text-base text-ink/60 md:text-lg">{INDUSTRIES.sub[lang]}</p></Reveal>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.items.map((ind, i) => (
              <Reveal key={ind.id} delay={(i % 3) * 0.06}>
                <Link href={`/${lang}/portfolio`} data-cursor="link"
                  className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-creme p-7 transition-all hover:-translate-y-1 hover:border-pink hover:shadow-[0_30px_60px_-30px_rgba(20,12,18,0.35)]">
                  <span className="text-3xl">{ind.emoji}</span>
                  <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.01em] group-hover:text-pink">{ind.name[lang]}</h3>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {ind.items.map((it) => (
                      <span key={it} className="rounded-full border border-ink/12 px-2.5 py-1 font-sans text-[12px] text-ink/65">{it}</span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.12em] text-ink/50 group-hover:text-pink">
                    {lang === "de" ? "Arbeiten ansehen" : "See the work"} <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ⑭ PRICING — filterable */}
      <section id="pricing" className="relative px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{PRICING.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{PRICING.heading[lang]}</Reveal>
            <Reveal><p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ink/60 md:text-lg">{PRICING.sub[lang]}</p></Reveal>
          </div>
          <div className="mt-12">
            <Chips active={priceFilter} onPick={setPriceFilter} all={PRICING.allLabel[lang]} filters={PRICING.filters} lang={lang} />
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((t) => {
              const feat = !!t.featured;
              return (
                <div key={t.id}
                  className={`relative flex flex-col rounded-3xl p-7 transition-transform hover:-translate-y-1 ${feat ? "bg-ink text-creme shadow-[0_40px_90px_-40px_rgba(20,12,18,0.7)]" : "border border-ink/12 bg-ink/[0.015] text-ink"}`}>
                  {feat && (
                    <span className="absolute right-6 top-6 rounded-full bg-pink px-3 py-1 font-sans text-[10px] uppercase tracking-[0.16em] text-creme">{PRICING.featuredLabel[lang]}</span>
                  )}
                  <h3 className="pr-16 font-display text-2xl font-medium tracking-[-0.01em]">{t.name}</h3>
                  <p className={`mt-1 font-sans text-sm ${feat ? "text-creme/65" : "text-ink/55"}`}>{t.tagline[lang]}</p>
                  <p className="mt-5 font-display text-3xl font-medium" style={{ color: feat ? "#FCF6EC" : undefined }}>
                    <span className={feat ? "" : "text-ink"}>{t.price}</span>
                  </p>
                  <ul className={`mt-5 flex-1 space-y-2 font-sans text-[14px] ${feat ? "text-creme/80" : "text-ink/70"}`}>
                    {t.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => scrollToId("contact")} data-cursor="link"
                    className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.14em] transition-colors ${feat ? "bg-creme text-ink hover:bg-pink hover:text-creme" : "bg-ink text-creme hover:bg-pink"}`}>
                    {PRICING.button[lang]}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add-ons */}
          <div className="mt-20 rounded-3xl border border-ink/10 bg-ink/[0.015] p-8 md:p-12">
            <Reveal><p className="mb-2 font-sans text-[11px] uppercase tracking-[0.3em] text-pink">{ADDONS.kicker[lang]}</p></Reveal>
            <Reveal as="h3" className="font-display text-3xl font-medium tracking-[-0.01em] md:text-4xl">{ADDONS.heading[lang]}</Reveal>
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

      {/* ⑮ BANDITA BLACK */}
      <section id="bandita-black" className="relative overflow-hidden bg-ink px-5 py-28 text-creme md:px-10 md:py-40">
        <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full opacity-30 blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(251,0,63,0.55), transparent 70%)" }} />
        <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{BLACK.kicker[lang]}</p></Reveal>
            <Reveal as="h2" className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{BLACK.heading[lang]}</Reveal>
            <Reveal><p className="mt-6 max-w-md font-sans text-base leading-relaxed text-creme/70 md:text-lg">{BLACK.sub[lang]}</p></Reveal>
            <Reveal className="mt-9 flex items-baseline gap-3">
              <span className="font-display text-4xl font-medium md:text-5xl">{BLACK.price}</span>
              <span className="font-sans text-sm uppercase tracking-[0.14em] text-creme/50">{BLACK.priceNote[lang]}</span>
            </Reveal>
            <Reveal className="mt-9">
              <MagneticButton onClick={() => scrollToId("contact")} strength={0.5}
                className="rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink">
                {BLACK.button[lang]}
              </MagneticButton>
            </Reveal>
          </div>
          <Reveal>
            <div className="flex flex-wrap gap-2.5">
              {BLACK.features.map((f) => (
                <span key={f} className="rounded-full border border-creme/15 bg-creme/[0.03] px-4 py-2 font-sans text-sm text-creme/80">{f}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ⑯ BANDITA EXCLUSIVES */}
      <section id="exclusives" className="relative px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{EXCLUSIVES.kicker[lang]}</p></Reveal>
          <Reveal as="h2" className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{EXCLUSIVES.heading[lang]}</Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {EXCLUSIVES.items.map((it, i) => (
              <Reveal key={it} delay={(i % 3) * 0.03} blur={false} y={12}
                className="flex items-center gap-3 border-b border-ink/10 py-3.5 font-sans text-[15px] text-ink/80">
                <span className="text-pink">🩷</span>{it}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ⑰ AND MORE — marquee */}
      <section className="relative overflow-hidden border-y border-ink/10 py-16">
        <Reveal><p className="mb-8 px-5 text-center font-display text-2xl italic text-ink/80 md:text-3xl">{MORE.kicker[lang]}</p></Reveal>
        <div className="relative flex overflow-hidden">
          <div className={`marquee-track ${r ? "" : "animate-[marquee-left_36s_linear_infinite]"}`}>
            {[...MORE.items, ...MORE.items].map((it, i) => (
              <span key={i} className="mx-6 font-display text-4xl font-medium text-ink/25 md:text-6xl">
                {it}<span className="mx-6 text-pink">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ⑱ PROCESS */}
      <section className="relative px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <Reveal><p className="mb-5 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{PROCESS.kicker[lang]}</p></Reveal>
          <Reveal as="h2" className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">{PROCESS.heading[lang]}</Reveal>
          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.06} className="border-t border-ink/15 pt-6">
                <span className="font-display text-5xl font-medium text-pink md:text-6xl">{s.num}</span>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.01em]">{s.title[lang]}</h3>
                <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/65">{s.body[lang]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ⑲ CLOSING */}
      <section className="relative px-5 pt-24 text-center md:pt-32">
        <Parallax speed={r ? 0 : -40}>
          <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl">{CLOSE.heading[lang]}</Reveal>
        </Parallax>
        <Reveal className="mt-6 space-y-1 font-display text-xl italic text-ink/70 md:text-2xl">
          <p>{CLOSE.line1[lang]}</p>
          <p>{CLOSE.line2[lang]}</p>
        </Reveal>
      </section>

      <ContactCTA dict={dict} lang={lang} />
    </div>
  );
}
