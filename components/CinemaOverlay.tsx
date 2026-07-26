"use client";

import { useEffect, useState } from "react";

/*
  Site-wide cinematic finish: a faint film-grain that flickers over everything
  plus a soft vignette, so the whole page reads like graded film — not just the
  WebGL background. Purely decorative and pointer-transparent. Disabled for
  reduced-motion (grain flicker) but the vignette stays.
*/

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function CinemaOverlay() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      {/* grain */}
      <div
        className={reduced ? "" : "cinema-grain"}
        style={{
          position: "absolute",
          inset: "-50%",
          backgroundImage: `url("${GRAIN}")`,
          backgroundRepeat: "repeat",
          opacity: 0.05,
          mixBlendMode: "overlay",
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 58%, rgba(30,12,20,0.16) 88%, rgba(30,12,20,0.3) 100%)",
        }}
      />
    </div>
  );
}
