"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { HERO, INTRO, CHAPTERS, MORE, PROCESS, PRICING, CLOSE } from "./services-data";

// A proof photo that tilts toward the cursor and drifts on scroll — the "wow"
// without a full WebGL scene, keeping the light home look intact.
function TiltCard({
  src,
  alt,
  className = "",
  rounded = "rounded-2xl",
  reduced,
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(ref.current, {
      rotateY: px * 12,
      rotateX: -py * 12,
      duration: 0.5,
      ease: "power3.out",
      transformPerspective: 900,
      transformOrigin: "center",
    });
  };
  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor="hover"
      className={`overflow-hidden ${rounded} shadow-[0_30px_80px_-30px_rgba(20,12,18,0.45)] will-change-transform ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

export default function ServicesExperience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const [active, setActive] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Reveal the sticky index only once past the hero, so it never sits on the
  // full-bleed headline.
  useEffect(() => {
    const onScroll = () => setShowIndex(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which chapter is centred → drive the sticky index highlight.
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
          if (v >= bestR) {
            bestR = v;
            bestEl = s;
          }
        }
        if (bestEl && bestR > 0) setActive(Number(bestEl.dataset.chapter));
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-20% 0px -20% 0px" },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="relative bg-creme text-ink">
      {/* ── Sticky chapter index (desktop) ── */}
      <nav
        aria-label={HERO.index[lang]}
        className={`pointer-events-none fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 transition-opacity duration-500 xl:flex ${
          showIndex ? "opacity-100" : "opacity-0"
        }`}
      >
        {CHAPTERS.map((c, i) => {
          const on = active === i;
          return (
            <button
              key={c.id}
              onClick={() => scrollToId(`svc-${c.id}`)}
              data-cursor="link"
              className={`group flex items-center justify-end gap-3 text-right ${
                showIndex ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <span
                className={`whitespace-nowrap rounded-full bg-creme/85 px-2 py-0.5 font-sans text-[11px] uppercase tracking-[0.14em] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 ${
                  on ? "text-ink" : "text-ink/50"
                }`}
              >
                {c.label[lang]}
              </span>
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: on ? 10 : 6,
                    height: on ? 10 : 6,
                    backgroundColor: on ? c.color : "rgba(26,18,22,0.25)",
                  }}
                />
              </span>
            </button>
          );
        })}
      </nav>

      {/* ① HERO */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(251,0,63,0.22), rgba(255,92,158,0.10) 45%, transparent 70%)" }}
        />
        <Reveal>
          <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{HERO.eyebrow[lang]}</p>
        </Reveal>
        <h1 className="relative font-display text-[13vw] font-medium leading-[0.92] tracking-[-0.02em] md:text-[8.5vw]">
          <SplitText as="span" text={HERO.line1[lang]} className="block" />
          <SplitText as="span" text={HERO.line2[lang]} className="block italic text-pink" />
        </h1>
        <Reveal>
          <p className="mx-auto mt-9 max-w-2xl font-sans text-base leading-relaxed text-ink/70 md:text-lg">
            {HERO.sub[lang]}
          </p>
        </Reveal>
        <Reveal className="mt-11">
          <MagneticButton
            onClick={() => scrollToId("svc-brand")}
            strength={0.5}
            className="rounded-full bg-ink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-pink"
          >
            {HERO.button[lang]}
          </MagneticButton>
        </Reveal>
        <span className="absolute bottom-8 font-sans text-[10px] uppercase tracking-[0.3em] text-ink/40">↓</span>
      </section>

      {/* ② INTRO manifesto */}
      <section className="relative flex min-h-[70svh] items-center px-5 md:px-10">
        <div className="mx-auto max-w-[1100px] space-y-4">
          {INTRO.map((l, i) => (
            <Reveal
              as="p"
              key={i}
              delay={i * 0.04}
              className={`font-display text-3xl font-medium leading-[1.14] tracking-[-0.01em] sm:text-4xl md:text-5xl ${
                i === 1 ? "text-pink" : "text-ink"
              }`}
            >
              {l[lang]}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ③–⑩ CHAPTERS */}
      {CHAPTERS.map((c, i) => {
        const flip = i % 2 === 1; // alternate text/image sides
        return (
          <section
            key={c.id}
            id={`svc-${c.id}`}
            data-chapter={i}
            className="relative flex min-h-[100svh] items-center overflow-hidden px-5 py-24 md:px-10"
          >
            {/* mood glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full opacity-40 blur-[130px]"
              style={{
                background: `radial-gradient(circle, ${c.color}55, transparent 68%)`,
                left: flip ? "auto" : "-10vmin",
                right: flip ? "-10vmin" : "auto",
              }}
            />
            {/* giant number watermark */}
            <span
              aria-hidden
              className="pointer-events-none absolute -z-0 select-none font-display font-semibold leading-none text-ink/[0.04]"
              style={{
                fontSize: "34vw",
                top: "50%",
                transform: "translateY(-50%)",
                [flip ? "left" : "right"]: "-2vw",
              } as React.CSSProperties}
            >
              {c.num}
            </span>

            <div
              className={`relative mx-auto grid w-full max-w-[1400px] items-center gap-12 md:grid-cols-12 md:gap-16 ${
                flip ? "md:[direction:rtl]" : ""
              }`}
            >
              {/* copy */}
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
                    <Reveal as="p" key={li} delay={li * 0.05} blur={false} y={16}>
                      {l[lang]}
                    </Reveal>
                  ))}
                </div>
                <ul className="mt-8 flex flex-wrap gap-2.5">
                  {c.services.map((sv, si) => (
                    <Reveal
                      as="li"
                      key={sv}
                      delay={si * 0.03}
                      blur={false}
                      y={10}
                      className="rounded-full border border-ink/12 bg-ink/[0.02] px-4 py-2 font-sans text-[13px] tracking-[0.01em] text-ink/75"
                    >
                      {sv}
                    </Reveal>
                  ))}
                </ul>
              </div>

              {/* proof images */}
              <div className={`md:col-span-6 ${flip ? "md:[direction:ltr]" : ""}`}>
                <Parallax speed={r ? 0 : -50}>
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px]">
                    <TiltCard
                      src={c.images[0]}
                      alt={`Bandita — ${c.title[lang]}`}
                      reduced={r}
                      className="absolute inset-0 z-10"
                    />
                    {c.images[1] && (
                      <TiltCard
                        src={c.images[1]}
                        alt={`Bandita — ${c.title[lang]}`}
                        reduced={r}
                        rounded="rounded-xl"
                        className={`absolute -bottom-8 z-20 aspect-square w-[45%] border-4 border-creme ${
                          flip ? "right-[-1.25rem]" : "left-[-1.25rem]"
                        }`}
                      />
                    )}
                    {/* colour edge accent */}
                    <span
                      aria-hidden
                      className="absolute -right-3 -top-3 z-0 h-24 w-24 rounded-2xl"
                      style={{ backgroundColor: c.color, opacity: 0.9 }}
                    />
                  </div>
                </Parallax>
              </div>
            </div>
          </section>
        );
      })}

      {/* ⑪ AND MORE — marquee */}
      <section className="relative overflow-hidden border-y border-ink/10 py-16">
        <Reveal>
          <p className="mb-8 px-5 text-center font-display text-2xl italic text-ink/80 md:text-3xl">
            {MORE.kicker[lang]}
          </p>
        </Reveal>
        <div className="relative flex overflow-hidden">
          <div className={`marquee-track ${r ? "" : "animate-[marquee-left_36s_linear_infinite]"}`}>
            {[...MORE.items, ...MORE.items].map((it, i) => (
              <span key={i} className="mx-6 font-display text-4xl font-medium text-ink/25 md:text-6xl">
                {it}
                <span className="mx-6 text-pink">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ⑫ PROCESS */}
      <section className="relative px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="mb-5 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{PROCESS.kicker[lang]}</p>
          </Reveal>
          <Reveal as="h2" className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">
            {PROCESS.heading[lang]}
          </Reveal>
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

      {/* ⑬ PRICING — starter models */}
      <section className="relative px-5 py-28 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <Reveal>
              <p className="mb-5 font-sans text-[11px] uppercase tracking-[0.35em] text-pink">{PRICING.kicker[lang]}</p>
            </Reveal>
            <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">
              {PRICING.heading[lang]}
            </Reveal>
            <Reveal>
              <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ink/65 md:text-lg">
                {PRICING.sub[lang]}
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {PRICING.tiers.map((t, i) => {
              const feat = t.featured;
              return (
                <Reveal
                  key={t.id}
                  delay={i * 0.06}
                  className={`relative flex flex-col rounded-3xl p-8 md:p-10 ${
                    feat
                      ? "bg-ink text-creme shadow-[0_40px_90px_-40px_rgba(20,12,18,0.7)]"
                      : "border border-ink/12 bg-ink/[0.015] text-ink"
                  }`}
                >
                  {feat && (
                    <span className="absolute right-8 top-8 rounded-full bg-pink px-3 py-1 font-sans text-[10px] uppercase tracking-[0.16em] text-creme">
                      {PRICING.featuredLabel[lang]}
                    </span>
                  )}
                  <h3 className="font-display text-3xl font-medium tracking-[-0.01em] md:text-4xl">{t.name[lang]}</h3>
                  <p className={`mt-2 font-sans text-sm ${feat ? "text-creme/70" : "text-ink/60"}`}>{t.tagline[lang]}</p>
                  <ul className={`mt-8 space-y-3 font-sans text-[15px] ${feat ? "text-creme/85" : "text-ink/75"}`}>
                    {t.includes.map((inc, ii) => (
                      <li key={ii} className="flex items-start gap-3">
                        <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />
                        {inc[lang]}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-9">
                    <span className={`block font-display text-xl italic ${feat ? "text-creme" : "text-ink"}`}>
                      {PRICING.priceLabel[lang]}
                    </span>
                    <button
                      onClick={() => scrollToId("contact")}
                      data-cursor="link"
                      className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-7 py-3.5 font-sans text-xs uppercase tracking-[0.14em] transition-colors ${
                        feat
                          ? "bg-creme text-ink hover:bg-pink hover:text-creme"
                          : "bg-ink text-creme hover:bg-pink"
                      }`}
                    >
                      {PRICING.button[lang]}
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ⑭ CLOSING — cheeky pre-CTA line, then the shared contact block */}
      <section className="relative px-5 pt-24 text-center md:pt-32">
        <Parallax speed={r ? 0 : -40}>
          <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {CLOSE.heading[lang]}
          </Reveal>
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
