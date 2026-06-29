"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import Reveal from "@/components/anim/Reveal";
import MagneticButton from "@/components/MagneticButton";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ── Tracked kicker label with a hairline ───────────────────────────────── */
function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.34em] ${className}`}
    >
      <span className="h-px w-8 bg-current opacity-50" />
      {children}
    </span>
  );
}

/* ── Image that drops in when the asset exists, else an elegant placeholder ─ */
function SmartImage({
  src,
  alt,
  monogram,
  className = "",
  imgClass = "",
  label,
}: {
  src: string;
  alt: string;
  monogram?: string;
  className?: string;
  imgClass?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-ink/[0.04] ${className}`}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClass}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink/[0.06] via-pink/[0.05] to-ink/[0.03]">
          {monogram && (
            <span className="font-display text-5xl font-medium tracking-tight text-ink/30 md:text-6xl">
              {monogram}
            </span>
          )}
          {label && (
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/30">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const PORTRAITS = [
  { slug: "pia-alice", initials: "PA" },
  { slug: "dino", initials: "D" },
  { slug: "niddl", initials: "N" },
  { slug: "noemi-santo", initials: "NS" },
];

export default function AboutStory({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const a = dict.about;
  const { introDone, reducedMotion: r } = useSite();
  const root = useRef<HTMLDivElement>(null);

  /* Hero intro */
  useEffect(() => {
    if (!introDone || !root.current) return;
    if (r) {
      gsap.set(root.current.querySelectorAll(".ah-line span"), { yPercent: 0 });
      gsap.set(root.current.querySelectorAll(".ah-fade"), { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".ah-eyebrow", { opacity: 0, y: 18, duration: 0.8 })
        .from(".ah-line span", { yPercent: 120, duration: 1.2, stagger: 0.14 }, "-=0.4")
        .from(".ah-scroll", { opacity: 0, duration: 0.8 }, "-=0.4");
    }, root);
    return () => ctx.revert();
  }, [introDone, r]);

  /* Scroll-scrubbed reveals (manifesto + psychology lists) */
  useEffect(() => {
    if (r || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".manifesto-belief",
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: ".manifesto-list",
            start: "top 78%",
            end: "bottom 70%",
            scrub: true,
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [r]);

  return (
    <div ref={root} className="about-root">
      {/* ════════ ① HERO — over the live scene ════════ */}
      <section
        id="top"
        className="relative flex min-h-[100svh] items-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-creme/75 via-creme/30 to-creme/75 md:from-creme/35 md:via-transparent md:to-creme/60" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 md:px-10">
          <p className="ah-eyebrow mb-7 font-sans text-[11px] uppercase tracking-[0.4em] text-pink md:text-xs">
            {a.hero.eyebrow}
          </p>
          <h1 className="font-display font-medium leading-[0.95] tracking-[-0.02em] text-ink">
            <span className="ah-line block overflow-hidden">
              <span className="block text-[10.5vw] md:text-[8vw] lg:text-[7vw]">
                {a.hero.line1}
              </span>
            </span>
            <span className="ah-line block overflow-hidden">
              <span className="block text-[10.5vw] italic text-pink md:text-[8vw] lg:text-[7vw]">
                {a.hero.line2}
              </span>
            </span>
          </h1>
        </div>
        <div className="ah-scroll absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-ink/50">
            {a.hero.scroll}
          </span>
          <span className="relative h-12 w-px overflow-hidden bg-ink/15">
            <span className="motion-only absolute inset-x-0 top-0 h-4 w-px animate-[scrollLine_2s_ease-in-out_infinite] bg-pink" />
          </span>
        </div>
      </section>

      {/* ════════ ② THE NAME — intimate origin story ════════ */}
      <section className="relative overflow-hidden bg-creme py-28 text-ink md:py-40">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-6 top-10 select-none font-display text-[34vw] italic leading-none text-pink/[0.05] md:text-[24vw]"
        >
          B
        </span>
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:grid-cols-12 md:px-10">
          <div className="md:col-span-7">
            <Reveal as="div">
              <span className="mb-9 block text-pink">
                <Kicker>{a.name.kicker}</Kicker>
              </span>
            </Reveal>
            <Reveal as="h2" y={30} className="max-w-2xl font-display text-4xl font-medium italic leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-6xl">
              {a.name.heading}
            </Reveal>
            <div className="mt-10 max-w-xl space-y-5 font-sans text-lg leading-relaxed text-ink/75">
              {a.name.paras.map((p, i) => (
                <Reveal as="p" key={i} delay={i * 0.05} blur={false} y={24}>
                  {p}
                </Reveal>
              ))}
            </div>
            <Reveal as="blockquote" className="mt-10 max-w-xl border-l-2 border-pink pl-6">
              <p className="font-display text-2xl italic leading-snug text-ink md:text-3xl">
                “{a.name.quote}”
              </p>
              <p className="mt-4 font-sans text-base leading-relaxed text-ink/60">
                {a.name.quoteSub}
              </p>
            </Reveal>
            <Reveal as="p" className="mt-10 font-display text-2xl text-pink md:text-3xl">
              {a.name.close}
            </Reveal>
          </div>

          {/* Illustration slot — the line-art namesake */}
          <div className="md:col-span-5">
            <Reveal>
              <SmartImage
                src="/about/illustration.png"
                alt={a.name.illoAlt}
                monogram="Bandita"
                label={lang === "de" ? "Illustration folgt" : "Illustration"}
                className="aspect-[4/5] rounded-[1.4rem] ring-1 ring-ink/10"
                imgClass="object-contain p-2"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════ ③ WHY US — cinematic, dark ════════ */}
      <section className="relative overflow-hidden bg-ink py-28 text-creme md:py-44">
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <span className="mb-9 block text-pink">
              <Kicker>{a.why.kicker}</Kicker>
            </span>
          </Reveal>
          <Reveal as="h2" y={30} className="max-w-4xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl lg:text-7xl">
            {a.why.heading}
          </Reveal>

          <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="space-y-5 font-sans text-lg leading-relaxed text-creme/70 md:text-xl">
              {a.why.lines.map((l, i) => (
                <Reveal as="p" key={i} delay={i * 0.04} blur={false} y={22}>
                  {l}
                </Reveal>
              ))}
            </div>
            <div className="flex flex-col justify-center gap-8">
              <Reveal as="p" className="font-display text-3xl leading-tight text-creme md:text-4xl">
                {a.why.punchA}
              </Reveal>
              <Reveal as="p" className="font-display text-3xl leading-tight text-creme md:text-4xl">
                {a.why.punchB}
              </Reveal>
            </div>
          </div>

          <Reveal as="p" className="mt-20 max-w-4xl font-display text-3xl italic leading-tight text-pink sm:text-4xl md:text-5xl">
            {a.why.close}
          </Reveal>
        </div>
      </section>

      {/* ════════ ④ PSYCHOLOGY — minimal, generous space ════════ */}
      <section className="relative overflow-hidden bg-creme py-32 text-ink md:py-48">
        <div className="relative mx-auto max-w-[1200px] px-5 text-center md:px-10">
          <Reveal>
            <span className="mb-10 inline-block text-pink">
              <Kicker>{a.psychology.kicker}</Kicker>
            </span>
          </Reveal>
          <Reveal as="h2" y={30} className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {a.psychology.heading}
          </Reveal>
          <Reveal as="p" className="mx-auto mt-10 max-w-2xl font-sans text-lg leading-relaxed text-ink/70 md:text-xl">
            {a.psychology.body}
          </Reveal>
          <Reveal as="p" className="mt-10 font-display text-2xl italic text-ink md:text-3xl">
            {a.psychology.detail}
          </Reveal>

          <div className="mt-16 flex flex-col items-center gap-2">
            {a.psychology.nothing.map((n, i) => (
              <Reveal as="span" key={i} delay={i * 0.06} className="font-display text-2xl text-ink/40 md:text-3xl">
                {n}
              </Reveal>
            ))}
            <Reveal as="span" className="mt-6 font-display text-3xl font-medium text-pink md:text-4xl">
              {a.psychology.verdict}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════ ⑤ THE BANDITAS — team gallery ════════ */}
      <section className="relative overflow-hidden bg-ink py-28 text-creme md:py-40">
        <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
          <Reveal>
            <span className="mb-9 block text-pink">
              <Kicker>{a.team.kicker}</Kicker>
            </span>
          </Reveal>
          <div className="grid items-end gap-8 md:grid-cols-12">
            <Reveal as="h2" y={30} className="md:col-span-7 font-display text-4xl font-medium leading-[1.06] tracking-[-0.01em] sm:text-5xl md:text-6xl">
              {a.team.heading}
            </Reveal>
            <Reveal as="p" className="md:col-span-5 font-sans text-base leading-relaxed text-creme/65 md:text-lg">
              {a.team.intro}
            </Reveal>
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {a.team.members.map((m, i) => {
              const p = PORTRAITS[i] ?? { slug: `member-${i}`, initials: m.name.slice(0, 1) };
              return (
                <Reveal key={m.name} delay={i * 0.06} className="group">
                  <SmartImage
                    src={`/about/team/${p.slug}.jpg`}
                    alt={`${m.name} — ${m.role}`}
                    monogram={p.initials}
                    className="aspect-[4/5] rounded-[1.1rem] ring-1 ring-creme/10 grayscale transition-all duration-700 group-hover:grayscale-0"
                  />
                  <h3 className="mt-5 font-display text-2xl font-medium leading-tight">
                    {m.name}
                  </h3>
                  <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.2em] text-pink">
                    {m.role}
                  </p>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-creme/60">
                    {m.craft}
                  </p>
                </Reveal>
              );
            })}
          </div>

          <Reveal as="p" className="mt-14 font-display text-xl italic text-creme/50 md:text-2xl">
            {a.team.note}
          </Reveal>
        </div>
      </section>

      {/* ════════ ⑥ WHAT WE DO — kinetic service type ════════ */}
      <section className="relative overflow-hidden bg-creme py-28 text-ink md:py-40">
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal>
            <span className="mb-9 block text-pink">
              <Kicker>{a.services.kicker}</Kicker>
            </span>
          </Reveal>
          <Reveal as="h2" y={30} className="max-w-3xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {a.services.heading}
          </Reveal>

          <div className="mt-14 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {a.services.items.map((s, i) => (
              <Reveal
                as="span"
                key={s}
                delay={i * 0.02}
                blur={false}
                y={18}
                className="cursor-default font-display text-2xl leading-tight text-ink/55 transition-colors duration-300 hover:text-pink sm:text-3xl md:text-4xl"
              >
                {s}
                {i < a.services.items.length - 1 && (
                  <span className="px-3 text-pink/40">·</span>
                )}
              </Reveal>
            ))}
          </div>

          <div className="mt-20 flex flex-col gap-1">
            <Reveal as="span" className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-ink sm:text-6xl md:text-7xl">
              {a.services.everything}
            </Reveal>
            <div className="flex gap-6">
              <Reveal as="span" delay={0.06} className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-ink/30 sm:text-6xl md:text-7xl">
                {a.services.online}
              </Reveal>
              <Reveal as="span" delay={0.12} className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-ink/30 sm:text-6xl md:text-7xl">
                {a.services.offline}
              </Reveal>
            </div>
          </div>

          <Reveal as="p" className="mt-12 font-display text-2xl italic text-pink md:text-3xl">
            {a.services.close}
          </Reveal>
        </div>
      </section>

      {/* ════════ ⑦ VIENNA — atmospheric, full-bleed ════════ */}
      <section className="relative flex min-h-[80svh] items-end overflow-hidden bg-ink text-creme">
        <SmartImage
          src="/about/pia-vineyard.jpg"
          alt={a.vienna.imageAlt}
          className="absolute inset-0 !bg-ink"
          imgClass={r ? "" : "kenburns"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/45" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-[10vh] md:px-10">
          <Reveal>
            <span className="mb-7 block text-creme/70">
              <Kicker>{a.vienna.kicker}</Kicker>
            </span>
          </Reveal>
          <Reveal as="h2" y={30} className="max-w-4xl font-display text-4xl font-medium leading-[1.0] tracking-[-0.01em] sm:text-6xl md:text-7xl">
            {a.vienna.heading}
          </Reveal>
          <Reveal as="p" className="mt-8 max-w-xl font-sans text-base leading-relaxed text-creme/75 md:text-lg">
            {a.vienna.body}
          </Reveal>
        </div>
      </section>

      {/* ════════ ⑧ THE MANIFESTO — emotional peak ════════ */}
      <section className="relative overflow-hidden bg-ink py-32 text-creme md:py-52">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 top-16 select-none font-display text-[28vw] italic leading-none text-pink/[0.06] md:text-[20vw]"
        >
          Bandita
        </span>
        <div className="relative mx-auto max-w-[1300px] px-5 md:px-10">
          <Reveal>
            <span className="mb-12 block text-pink">
              <Kicker>{a.manifesto.kicker}</Kicker>
            </span>
          </Reveal>
          <div className="manifesto-list space-y-3 font-display text-3xl font-medium leading-[1.12] tracking-[-0.01em] sm:text-4xl md:text-5xl lg:text-6xl">
            {a.manifesto.beliefs.map((b, i) => (
              <p key={i} className="manifesto-belief">
                {b}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ⑨ FINAL LINE — provocation + CTA ════════ */}
      <section className="relative overflow-hidden bg-pink py-32 text-creme md:py-48">
        <div
          aria-hidden
          className="motion-only pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1300px] px-5 text-center md:px-10">
          <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-7xl">
            {a.final.line1}
            <br />
            <span className="italic">{a.final.line2}</span>
          </Reveal>
          <Reveal>
            <div className="mt-12 flex flex-col items-center gap-5">
              <MagneticButton
                onClick={() => scrollToId("contact")}
                as="a"
                href={`/${lang}#contact`}
                strength={0.5}
                className="rounded-full bg-creme px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme"
              >
                {a.final.cta}
              </MagneticButton>
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-creme/60">
                {a.final.note}
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
