"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { detectTier } from "@/lib/scene-store";
import { portfolio, attachPortfolioInputs } from "@/lib/portfolio-scene";
import { STATIONS, QUOTES } from "./portfolio-data";
import MagneticButton from "@/components/MagneticButton";
import { scrollToId } from "@/lib/scroll";

const PortfolioScene = dynamic(() => import("@/components/webgl/portfolio/PortfolioScene"), { ssr: false });

const TRACK_VH = (STATIONS.length + 1) * 200; // virtual scroll length (slow, cinematic travel)

export default function PortfolioExperience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const [canvas, setCanvas] = useState(false);
  const [compact, setCompact] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const quoteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const t = dict.portfolio;

  // ── ambient sound (WebAudio pad that shifts per station) ──
  const audio = useRef<{
    ctx: AudioContext;
    master: GainNode;
    oscs: OscillatorNode[];
    filter: BiquadFilterNode;
  } | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const NOTES = [110, 130.81, 146.83, 164.81, 196, 220, 246.94, 293.66];

  const toggleSound = () => {
    if (!audio.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      filter.Q.value = 3;
      filter.connect(master);
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.38;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      filter.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(master);
      const oscs: OscillatorNode[] = [];
      [0, 1, 2].forEach((i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? "sine" : "sawtooth";
        o.frequency.value = 110;
        o.detune.value = (i - 1) * 7;
        const g = ctx.createGain();
        g.gain.value = i === 2 ? 0.5 : 0.2;
        o.connect(g);
        g.connect(filter);
        o.start();
        oscs.push(o);
      });
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lg = ctx.createGain();
      lg.gain.value = 160;
      lfo.connect(lg);
      lg.connect(filter.frequency);
      lfo.start();
      audio.current = { ctx, master, oscs, filter };
    }
    const a = audio.current;
    const on = !soundOn;
    setSoundOn(on);
    portfolio.soundOn = on;
    a.ctx.resume();
    a.master.gain.cancelScheduledValues(a.ctx.currentTime);
    a.master.gain.linearRampToValueAtTime(on ? 0.16 : 0.0001, a.ctx.currentTime + (on ? 1.4 : 0.6));
  };

  useEffect(
    () => () => {
      audio.current?.ctx.close();
    },
    [],
  );

  useEffect(() => {
    const tier = detectTier();
    setCompact(tier !== "high");
    setCanvas(!r); // canvas on every device unless reduce-motion
  }, [r]);

  // scroll → progress + overlay sync (ref-driven, no re-renders)
  useEffect(() => {
    if (r) return;
    const detach = attachPortfolioInputs();
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      portfolio.progress = Math.min(1, Math.max(0, window.scrollY / max));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const quotePoints = QUOTES.map((_, i) => (i + 1) / (QUOTES.length + 1));
    const loop = () => {
      const p = portfolio.progress;
      if (introRef.current) introRef.current.style.opacity = `${Math.max(0, 1 - p * 14)}`;
      const act = portfolio.active;
      if (tagRef.current)
        tagRef.current.textContent = act >= 0 ? STATIONS[act].tag[lang] : "";
      if (counterRef.current)
        counterRef.current.textContent = act >= 0 ? `${String(act + 1).padStart(2, "0")} / ${String(STATIONS.length).padStart(2, "0")}` : "";
      quotePoints.forEach((qp, i) => {
        const el = quoteRefs.current[i];
        if (!el) return;
        const d = Math.abs(p - qp);
        const vis = Math.max(0, 1 - d / 0.05);
        el.style.opacity = `${vis}`;
        el.style.transform = `translate(-50%,-50%) translateY(${(p - qp) * 600}px) scale(${0.9 + vis * 0.1})`;
      });
      if (ctaRef.current) ctaRef.current.style.opacity = `${Math.max(0, (p - 0.965) / 0.035)}`;
      // ambient pad follows the active station
      const a = audio.current;
      if (a && portfolio.soundOn) {
        const idx = portfolio.active >= 0 ? portfolio.active : 0;
        const base = NOTES[idx % NOTES.length];
        a.oscs.forEach((o, i) => o.frequency.setTargetAtTime(base * (i === 2 ? 2 : 1), a.ctx.currentTime, 0.5));
        a.filter.frequency.setTargetAtTime(portfolio.active >= 0 ? 1200 : 500, a.ctx.currentTime, 0.6);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      detach();
    };
  }, [r, lang]);

  /* ───────── reduced-motion / no-JS: content-complete lit gallery ───────── */
  if (r) {
    return (
      <div className="min-h-screen bg-[#08070a] px-5 pb-32 pt-32 text-creme md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <span className="font-sans text-[11px] uppercase tracking-[0.34em] text-pink">{t.fallbackKicker}</span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-6xl">
            {t.fallbackHeading}
          </h1>
          <div className="mt-16 space-y-24">
            {STATIONS.map((st) => (
              <section key={st.id}>
                <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-creme/55">{st.tag[lang]}</span>
                <div className={`mt-4 grid gap-4 ${st.orientation === "portrait" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                  {st.video
                    ? st.video.map((v, i) => (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video key={v} src={v} poster={st.images[i]} muted loop playsInline autoPlay className="w-full rounded-[1rem] ring-1 ring-creme/10" />
                      ))
                    : st.images.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={src} src={src} alt={st.tag[lang]} loading="lazy" className="w-full rounded-[1rem] ring-1 ring-creme/10" />
                      ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-24">
            <MagneticButton as="a" href={`/${lang}#contact`} onClick={() => scrollToId("contact")} className="rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme">
              {t.cta}
            </MagneticButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* fixed world */}
      <div className="fixed inset-0 -z-10 bg-[#08070a]">{canvas && <PortfolioScene compact={compact} />}</div>

      {/* floating advertising quotes */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        {QUOTES.map((q, i) => (
          <div
            key={i}
            ref={(el) => {
              quoteRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 w-[90%] max-w-5xl text-center font-display text-4xl font-medium italic leading-[1.05] tracking-[-0.01em] text-creme sm:text-6xl md:text-7xl"
            style={{ opacity: 0, transform: "translate(-50%,-50%)", textShadow: "0 0 40px rgba(0,0,0,0.6)" }}
          >
            {q[lang]}
          </div>
        ))}
      </div>

      {/* intro */}
      <div ref={introRef} className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center text-center">
        <span className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{t.enter}</span>
        <p className="mt-6 max-w-md px-6 font-display text-2xl italic text-creme/80 md:text-3xl">{t.fallbackHeading}</p>
        <span className="mt-10 font-sans text-[10px] uppercase tracking-[0.3em] text-creme/45">{t.scroll} ↓</span>
      </div>

      {/* HUD */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex items-center justify-between px-5 font-sans text-[11px] uppercase tracking-[0.2em] text-creme/60 md:px-10">
        <span ref={counterRef} className="tabular-nums" />
        <button
          type="button"
          onClick={toggleSound}
          data-cursor="link"
          className="pointer-events-auto flex items-center gap-2 text-creme/55 transition-colors hover:text-pink"
          aria-pressed={soundOn}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${soundOn ? "bg-pink" : "bg-creme/40"}`} />
          {t.sound}
        </button>
        <span ref={tagRef} className="text-creme/75" />
      </div>

      {/* end CTA */}
      <div ref={ctaRef} className="fixed inset-0 z-20 flex items-center justify-center" style={{ opacity: 0 }}>
        <div className="pointer-events-auto text-center">
          <p className="mb-8 font-display text-3xl italic text-creme md:text-5xl">{t.fallbackHeading}</p>
          <MagneticButton as="a" href={`/${lang}#contact`} onClick={() => scrollToId("contact")} strength={0.5} className="rounded-full bg-pink px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink">
            {t.cta}
          </MagneticButton>
        </div>
      </div>

      {/* virtual scroll track */}
      <div style={{ height: `${TRACK_VH}vh` }} aria-hidden />
    </>
  );
}
