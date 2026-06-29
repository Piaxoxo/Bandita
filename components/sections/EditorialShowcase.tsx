"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ── A premium label: hairline + tracked uppercase ───────────────────────── */
function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.34em] ${className}`}>
      <span className="h-px w-8 bg-current opacity-50" />
      {children}
    </span>
  );
}

/* ── Parallax + Ken-Burns image with a soft mask reveal ──────────────────── */
function ParallaxImage({
  src,
  alt,
  className = "",
  imgClass = "",
  parallax = 14,
  reduced,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClass?: string;
  parallax?: number;
  reduced: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !wrap.current || !layer.current) return;
    const ctx = gsap.context(() => {
      // soft mask reveal on enter
      gsap.fromTo(
        wrap.current,
        { clipPath: "inset(6% 6% 6% 6% round 1.4rem)", opacity: 0.4 },
        {
          clipPath: "inset(0% 0% 0% 0% round 1.4rem)",
          opacity: 1,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: wrap.current, start: "top 84%" },
        },
      );
      // slow parallax drift on the inner layer
      gsap.fromTo(
        layer.current,
        { yPercent: -parallax },
        {
          yPercent: parallax,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, wrap);
    return () => ctx.revert();
  }, [reduced, parallax]);

  return (
    <div ref={wrap} className={`overflow-hidden rounded-[1.4rem] ${className}`}>
      <div ref={layer} className="relative h-[120%] w-full" style={{ marginTop: "-10%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover ${reduced ? "" : "kenburns"} ${imgClass}`}
        />
      </div>
    </div>
  );
}

/* ── Headline + sub with a luxury fade-up ────────────────────────────────── */
function Heading({
  children,
  className = "",
  reduced,
}: {
  children: ReactNode;
  className?: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current!.children,
        { y: 40, opacity: 0, filter: "blur(8px)" },
        {
          y: 0, opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default function EditorialShowcase({ dict }: { dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const s = dict.showcase;

  return (
    <div id="work">
      {/* ── SECTION 01 — cinema, almost full screen ───────────────────── */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-creme">
        <ParallaxImage
          src="/work/film-01.jpg"
          alt={s.s1.alt}
          className="absolute inset-0 !rounded-none"
          parallax={10}
          reduced={r}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/40" />
        <div className="absolute right-6 top-28 text-creme/70 md:right-12 md:top-32">
          <Label>{s.s1.label}</Label>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-[12vh] md:px-10">
          <Heading reduced={r} className="max-w-4xl">
            <h2 className="font-display text-5xl font-medium uppercase leading-[0.98] tracking-[-0.01em] sm:text-7xl md:text-8xl">
              {s.s1.heading}
            </h2>
            <p className="mt-8 max-w-xl font-sans text-base leading-relaxed text-creme/75 md:text-lg">
              {s.s1.sub}
            </p>
          </Heading>
        </div>
      </section>

      {/* ── SECTION 02 — clean magazine spread ────────────────────────── */}
      <section className="relative overflow-hidden bg-creme py-[14vh] text-ink">
        <div className="mx-auto max-w-[1500px] px-5 md:px-12">
          <div className="grid items-center gap-10 md:grid-cols-12">
            <Heading reduced={r} className="md:col-span-4">
              <span className="mb-7 block text-pink">
                <Label>{s.s2.label}</Label>
              </span>
              <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-6xl">
                {s.s2.heading}
              </h2>
              <p className="mt-8 max-w-sm font-sans text-base leading-relaxed text-ink/65 md:text-lg">
                {s.s2.sub}
              </p>
            </Heading>

            <div className="relative md:col-span-8">
              <ParallaxImage
                src="/work/film-02.jpg"
                alt={s.s2.alt}
                className="h-[52vh] md:h-[78vh]"
                parallax={12}
                reduced={r}
              />
              {/* partially overlapping smaller frame */}
              <div className="absolute -bottom-10 -left-6 w-[42%] max-w-[280px] md:-left-16 md:-bottom-16">
                <ParallaxImage
                  src="/work/film-01.jpg"
                  alt={s.s2.altSmall}
                  className="aspect-[4/5] shadow-2xl ring-1 ring-ink/10"
                  parallax={20}
                  reduced={r}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 03 — atmosphere, dark luxury ──────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink text-creme">
        <ParallaxImage
          src="/work/bar-01.jpg"
          alt={s.s3.alt}
          className="absolute inset-0 !rounded-none"
          parallax={9}
          reduced={r}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/40" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 md:px-10">
          <Heading reduced={r} className="max-w-3xl">
            <span className="mb-7 block text-rose">
              <Label>{s.s3.label}</Label>
            </span>
            <h2 className="font-display text-5xl font-medium uppercase leading-[0.98] tracking-[-0.01em] sm:text-7xl md:text-8xl">
              {s.s3.heading}
            </h2>
            <p className="mt-8 max-w-md font-sans text-base leading-relaxed text-creme/75 md:text-lg">
              {s.s3.sub}
            </p>
          </Heading>
        </div>
      </section>

      {/* ── SECTION 04 — real moments, emotional ──────────────────────── */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-creme">
        <ParallaxImage
          src="/work/guests-01.jpg"
          alt={s.s4.alt}
          className="absolute inset-0 !rounded-none"
          parallax={11}
          reduced={r}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/35" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-[12vh] md:px-10">
          <Heading reduced={r} className="max-w-4xl">
            <span className="mb-7 block text-rose">
              <Label>{s.s4.label}</Label>
            </span>
            <h2 className="font-display text-5xl font-medium uppercase leading-[0.98] tracking-[-0.01em] sm:text-7xl md:text-8xl">
              {s.s4.heading}
            </h2>
            <p className="mt-8 max-w-lg font-sans text-base leading-relaxed text-creme/75 md:text-lg">
              {s.s4.sub}
            </p>
          </Heading>
        </div>
      </section>
    </div>
  );
}
