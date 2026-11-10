"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { useQuote } from "@/components/quote/QuoteProvider";
import { scrollToId } from "@/lib/scroll";
import { skipHeavyMedia } from "@/lib/defer";
import Wordmark from "@/components/Wordmark";
import ParticleHeadline from "@/components/anim/ParticleHeadline";
import Chapter from "./Chapter";

const Saal = dynamic(() => import("@/components/webgl/Saal"), { ssr: false });

/*
  The cover — the hall.

  The section is two screens tall and its content sticks for the first one:
  that scroll is the camera's flight through the room (see webgl/Saal). The
  masthead, chapter head and the ask are printed on top and fade as the
  flight begins. The headline exists twice: as glass letters in the room,
  and as real text for readers, screen readers and search — visible only
  when the room cannot be shown (reduced motion, saved data, no WebGL).
*/

const FILM = {
  video: "/video/cocktail.mp4",
  poster: "/video/cocktail.jpg",
  aspect: 640 / 866,
  label: { de: "Film · Cocktail", en: "Film · Cocktail" },
};

export default function Cover({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const { introDone, reducedMotion } = useSite();
  const { open } = useQuote();
  const root = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [room, setRoom] = useState(false);
  const de = lang === "de";

  // the room, or the flat fallback — decided once on the client
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    setRoom(Boolean(gl) && !reducedMotion && !skipHeavyMedia());
  }, [reducedMotion]);

  // scroll through the pinned cover → 0..1, and the overlay fades with it
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      progress.current = p;
      if (overlay.current) overlay.current.style.opacity = String(1 - Math.min(1, p * 2.2));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const el = root.current;
    if (!el) return;
    if (reducedMotion) {
      gsap.set(el.querySelectorAll(".cv-anim, .cv-mast, .cv-meta"), { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll(".cv-rule"), { scaleX: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".cv-mast", { opacity: 0, y: 18, duration: 1.2 }, 0.3)
        .from(".cv-rule", { scaleX: 0, transformOrigin: "left center", duration: 1.0 }, "-=0.8")
        .from(".cv-meta", { opacity: 0, duration: 0.8 }, "-=0.8")
        .from(".cv-anim", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "+=1.2");
    }, el);
    return () => ctx.revert();
  }, [introDone, reducedMotion]);

  return (
    <section id="top" ref={root} data-tone="dark" className="relative h-[200svh] text-creme">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
        {/* the room, or the poster */}
        {room ? (
          introDone && (
            <Saal
              lines={{ line1: dict.hero.line1, line2: dict.hero.line2 }}
              video={FILM.video}
              aspect={FILM.aspect}
              armed={introDone}
              progress={progress}
            />
          )
        ) : (
          <>
            <Image src={FILM.poster} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/80" />
          </>
        )}

        {/* printed on top */}
        <div ref={overlay} className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col px-5 pt-6 md:px-10 md:pt-8">
          <div className="cv-meta flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.42em] text-creme/60 md:text-[11px]">
            <span>{de ? "Kreativ- & Marketingagentur" : "Creative & Marketing Agency"}</span>
            <span className="hidden sm:inline">Wien</span>
          </div>
          <div className="cv-rule mt-3 h-px bg-creme/50" />
          {/* smaller than on paper: in the hall the letters are the headline */}
          <div className="cv-mast flex justify-center py-5 md:py-6">
            <Wordmark tone="creme" className="text-[13vw] sm:text-[9vw] lg:text-[6.5vw] xl:text-[5.6rem]" />
          </div>
          <div className="cv-rule h-px bg-creme/50" />

          <div className="mt-auto pb-24 pt-12 md:pb-20 md:pt-16">
            <Chapter n="01" title={de ? "Titel" : "Cover"} tone="creme" className="cv-anim mb-8 md:mb-10" />

            {/* the line: glass in the room, real text otherwise */}
            {room ? (
              <h1 className="sr-only">
                {dict.hero.line1} {dict.hero.line2}
              </h1>
            ) : (
              <h1 className="font-display font-medium leading-[0.9] tracking-[-0.02em]">
                <ParticleHeadline as="span" mode="cover" armed={introDone} text={dict.hero.line1} color="#FCF6EC" accent="#FB003F" className="block text-[17vw] text-creme md:text-[10.5vw]" />
                <ParticleHeadline as="span" mode="cover" armed={introDone} text={dict.hero.line2} color="#FB003F" accent="#FCF6EC" accentRatio={0.1} className="block text-[17vw] italic text-pink md:text-[10.5vw]" />
              </h1>
            )}

            <div className="cv-anim mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 font-sans text-xs uppercase tracking-[0.3em] md:mt-12">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                <button onClick={() => open()} data-cursor="hover" className="group inline-flex items-center gap-3 text-creme transition-colors hover:text-pink">
                  {dict.hero.ctaPrimary}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button onClick={() => scrollToId("work")} data-cursor="link" className="inline-flex items-center gap-3 text-creme/55 transition-colors hover:text-creme">
                  {de ? "Arbeiten ansehen" : "See the work"}
                  <span aria-hidden>↓</span>
                </button>
              </div>
              <span className="hidden text-[10px] text-creme/45 md:inline">
                {FILM.label[lang]} · Wien · 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
