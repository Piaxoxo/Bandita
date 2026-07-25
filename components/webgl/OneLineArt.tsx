"use client";

import { useEffect, useRef } from "react";

/*
  BANDITA — "one-line" background illustrations.

  Continuous single-line drawings of on-brand objects (martini glass, phone,
  cinema camera, bandit mask) that DRAW THEMSELVES as you scroll — like a pen
  tracing the shape — then float and tilt in 3D for depth. Pure SVG over the
  marble backdrop; decorative and pointer-transparent.
*/

type Shape = {
  id: string;
  d: string; // single continuous-ish path (pathLength normalised to 1)
  accent?: string; // optional second path (drawn with the same progress)
  color: string;
  // viewport placement + feel
  top: string;
  left: string;
  size: number;
  parallax: number; // px travelled over full scroll
  float: number; // idle bob amplitude (px)
  speed: number; // idle bob speed
  tilt: number; // deg of 3D tilt across scroll
  start: number; // scroll progress where the draw begins
  end: number; // scroll progress where the draw completes
  phase: number;
};

const PINK = "#FB003F";
const ROSE = "#FF5C9E";

const SHAPES: Shape[] = [
  {
    // martini glass
    id: "martini",
    d: "M16,18 H84 L50,58 L16,18 M50,58 V84 M34,85 H66",
    accent: "M52,50 L72,28",
    color: PINK,
    top: "12%",
    left: "68%",
    size: 260,
    parallax: -140,
    float: 10,
    speed: 0.5,
    tilt: 12,
    start: -0.12,
    end: 0.07,
    phase: 0,
  },
  {
    // bandit mask — the brand nod
    id: "mask",
    d: "M10,44 Q10,33 25,34 Q40,35 50,41 Q60,35 75,34 Q90,33 90,44 Q90,57 74,55 Q60,53 50,47 Q40,53 26,55 Q10,57 10,44 Z",
    accent:
      "M27,43 m-4,0 a4,3 0 1,0 8,0 a4,3 0 1,0 -8,0 M73,43 m-4,0 a4,3 0 1,0 8,0 a4,3 0 1,0 -8,0",
    color: ROSE,
    top: "58%",
    left: "10%",
    size: 240,
    parallax: 90,
    float: 12,
    speed: 0.42,
    tilt: -14,
    start: -0.04,
    end: 0.13,
    phase: 1.6,
  },
  {
    // smartphone
    id: "phone",
    d: "M35,8 h30 q6,0 6,6 v72 q0,6 -6,6 h-30 q-6,0 -6,-6 v-72 q0,-6 6,-6 Z M45,15 h10 M50,84 m-2.4,0 a2.4,2.4 0 1,0 4.8,0 a2.4,2.4 0 1,0 -4.8,0",
    accent: "M38,42 q12,-12 24,0 M38,54 q12,12 24,0",
    color: PINK,
    top: "26%",
    left: "80%",
    size: 190,
    parallax: -190,
    float: 14,
    speed: 0.55,
    tilt: 16,
    start: 0.12,
    end: 0.34,
    phase: 0.8,
  },
  {
    // cinema camera
    id: "camera",
    d: "M14,46 h34 v24 h-34 Z M48,56 l14,-5 v26 l-14,-5 M20,46 v-6 h13 v6 M26,34 a7,7 0 0,1 0.1,0",
    accent: "M26,34 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0",
    color: ROSE,
    top: "62%",
    left: "66%",
    size: 220,
    parallax: 150,
    float: 11,
    speed: 0.48,
    tilt: -12,
    start: 0.2,
    end: 0.4,
    phase: 2.4,
  },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export default function OneLineArt() {
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const accents = useRef<(SVGPathElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    const tick = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scroll = clamp01(window.scrollY / max);
      const t = performance.now() / 1000;

      SHAPES.forEach((s, i) => {
        const prog = easeInOut(clamp01((scroll - s.start) / (s.end - s.start)));
        const off = 1 - prog;
        const p = paths.current[i];
        const a = accents.current[i];
        if (p) p.style.strokeDashoffset = String(off);
        // the accent finishes drawing in the last 40% of the shape's draw
        if (a) a.style.strokeDashoffset = String(1 - clamp01((prog - 0.6) / 0.4));

        const w = wraps.current[i];
        if (w) {
          const bob = Math.sin(t * s.speed + s.phase) * s.float;
          const par = (scroll - 0.5) * s.parallax;
          const rotX = (scroll - 0.5) * s.tilt + pointer.current.y * 4;
          const rotY = pointer.current.x * 8 + (scroll - 0.5) * s.tilt * 0.6;
          w.style.transform = `translate3d(0, ${par + bob}px, 0) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          // fade in with the first sliver of the draw so nothing pops
          w.style.opacity = String(clamp01(prog * 6));
        }
      });
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {SHAPES.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => {
            wraps.current[i] = el;
          }}
          className="absolute will-change-transform"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0 }}
        >
          <svg viewBox="0 0 100 100" width={s.size} height={s.size} fill="none">
            <path
              ref={(el) => {
                paths.current[i] = el;
              }}
              d={s.d}
              pathLength={1}
              stroke={s.color}
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
            {s.accent && (
              <path
                ref={(el) => {
                  accents.current[i] = el;
                }}
                d={s.accent}
                pathLength={1}
                stroke={s.color}
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0.85 }}
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
}
