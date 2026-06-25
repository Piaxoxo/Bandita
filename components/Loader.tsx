"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useSite } from "@/lib/site-context";
import type { Dictionary } from "@/i18n/types";

export default function Loader({ dict }: { dict: Dictionary }) {
  const { setIntroDone } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);

  const finish = useRef(() => {});
  const doneOnce = useRef(false);

  // Run exactly once on mount. Read the reduced-motion preference directly from
  // the media query to avoid the context's first-render false→true race.
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // Lock scroll while the intro plays
    document.body.style.overflow = "hidden";

    const done = () => {
      if (doneOnce.current) return;
      doneOnce.current = true;
      document.body.style.overflow = "";
      setIntroDone(true);
      setHidden(true);
    };
    finish.current = done;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Safety net: never let the intro trap the page, whatever happens.
    const safety = window.setTimeout(done, reduce ? 800 : 6500);

    if (reduce) {
      // Minimal, accessible intro: brief hold then reveal.
      setCount(100);
      const t = window.setTimeout(done, 600);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(safety);
        document.body.style.overflow = "";
      };
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // counter 0 -> 100
      const counter = { v: 0 };
      tl.to(counter, {
        v: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      });

      tl.from(
        ".loader-word .ld-char",
        {
          yPercent: 120,
          opacity: 0,
          duration: 1.1,
          stagger: 0.05,
          ease: "expo.out",
        },
        0.25,
      );
      tl.from(
        ".loader-sub",
        { opacity: 0, y: 14, duration: 0.8 },
        0.9,
      );
      tl.to(".loader-aura", { opacity: 1, scale: 1, duration: 1.6 }, 0);

      // exit
      tl.to(".loader-word, .loader-sub, .loader-count", {
        yPercent: -40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.04,
        ease: "power3.in",
      });
      tl.to(
        el,
        {
          yPercent: -100,
          duration: 1.1,
          ease: "expo.inOut",
          onComplete: done,
        },
        "-=0.2",
      );
    }, el);

    return () => {
      window.clearTimeout(safety);
      ctx.revert();
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  const word = "BANDITA".split("");

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-ink text-creme"
      role="status"
      aria-live="polite"
      aria-label="Loading Bandita"
    >
      {/* animated aura */}
      <div
        className="loader-aura pointer-events-none absolute h-[80vmin] w-[80vmin] scale-50 rounded-full opacity-0 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(251,0,63,0.65), rgba(255,92,158,0.25) 45%, transparent 70%)",
        }}
      />

      <div className="loader-count absolute right-6 top-6 font-sans text-sm tabular-nums tracking-widest text-creme/60 md:right-10 md:top-10">
        {String(count).padStart(3, "0")}
      </div>

      <p className="loader-sub mb-6 font-sans text-[11px] uppercase tracking-[0.4em] text-creme/55">
        {dict.loader.enter}
      </p>

      <div
        className="loader-word relative font-display text-[18vw] font-semibold leading-none tracking-tight md:text-[12vw]"
        aria-hidden
      >
        {word.map((c, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span className="ld-char inline-block">{c}</span>
          </span>
        ))}
      </div>

      <div className="loader-sub mt-8 flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-creme/55">
        <span>{dict.loader.line1}</span>
        <span className="h-px w-8 bg-creme/30" />
        <span>{dict.loader.line2}</span>
      </div>

      <button
        onClick={() => finish.current()}
        className="loader-sub absolute bottom-8 font-sans text-[11px] uppercase tracking-[0.25em] text-creme/45 transition-colors hover:text-creme"
      >
        {dict.loader.skip}
      </button>
    </div>
  );
}
