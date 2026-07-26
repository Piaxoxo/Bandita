"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { detectTier } from "@/lib/scene-store";
import { portfolio, attachPortfolioInputs, tickPortfolio } from "@/lib/portfolio-scene";
import PortfolioWall from "./PortfolioWall";
import PortfolioProject from "./PortfolioProject";

const PortfolioAtmosphere = dynamic(() => import("@/components/webgl/portfolio/PortfolioAtmosphere"), {
  ssr: false,
});

export default function PortfolioExperience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { reducedMotion: r } = useSite();
  const [canvas, setCanvas] = useState(false);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(-1); // -1 = wall, >=0 = project index
  const [soundOn, setSoundOn] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const t = dict.portfolio;

  useEffect(() => {
    const tier = detectTier();
    setCompact(tier !== "high");
    setCanvas(!r && tier !== "low");
  }, [r]);

  // pointer smoothing + mood glow follow (ref-driven, no re-renders)
  useEffect(() => {
    if (r) return;
    const detach = attachPortfolioInputs();
    let raf = 0;
    const loop = () => {
      tickPortfolio(0.06);
      if (glowRef.current) {
        const [rr, gg, bb] = portfolio.mood;
        const c = `${Math.round(rr * 255)},${Math.round(gg * 255)},${Math.round(bb * 255)}`;
        glowRef.current.style.background = `radial-gradient(60% 55% at 50% 42%, rgba(${c},0.22), transparent 70%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      detach();
    };
  }, [r]);

  // ── ambient pad (simple on/off drone) ──
  const audio = useRef<{ ctx: AudioContext; master: GainNode } | null>(null);
  const toggleSound = () => {
    if (!audio.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      filter.Q.value = 1.5;
      filter.connect(master);
      [110, 164.81, 220].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? "sawtooth" : "sine";
        o.frequency.value = f;
        o.detune.value = (i - 1) * 5;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.14 : 0.28;
        o.connect(g);
        g.connect(filter);
        o.start();
      });
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lg = ctx.createGain();
      lg.gain.value = 260;
      lfo.connect(lg);
      lg.connect(filter.frequency);
      lfo.start();
      audio.current = { ctx, master };
    }
    const a = audio.current;
    const on = !soundOn;
    setSoundOn(on);
    a.ctx.resume();
    a.master.gain.cancelScheduledValues(a.ctx.currentTime);
    a.master.gain.linearRampToValueAtTime(on ? 0.2 : 0.0001, a.ctx.currentTime + (on ? 1.4 : 0.5));
  };
  useEffect(() => () => void audio.current?.ctx.close(), []);

  return (
    <>
      {/* continuous 3D world behind everything */}
      <div className="fixed inset-0 -z-10 bg-[#08070a]">
        <div ref={glowRef} className="absolute inset-0" />
        {canvas && (
          <div className="absolute inset-0">
            <PortfolioAtmosphere compact={compact} />
          </div>
        )}
      </div>

      {/* mode content */}
      <div key={open} className="portfolio-fade">
        {open < 0 ? (
          <PortfolioWall lang={lang} dict={dict} reduced={r} onOpen={(i) => setOpen(i)} />
        ) : (
          <PortfolioProject
            index={open}
            lang={lang}
            dict={dict}
            reduced={r}
            onBack={() => {
              setOpen(-1);
              window.scrollTo(0, 0);
            }}
            onSelect={(i) => setOpen(i)}
          />
        )}
      </div>

      {/* sound toggle */}
      {!r && (
        <button
          type="button"
          onClick={toggleSound}
          data-cursor="link"
          aria-pressed={soundOn}
          className="fixed bottom-6 left-5 z-30 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-creme/60 backdrop-blur transition-colors hover:text-pink md:left-10"
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${soundOn ? "bg-pink" : "bg-creme/40"}`} />
          {t.sound}
        </button>
      )}
    </>
  );
}
