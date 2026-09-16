"use client";

import { useEffect } from "react";
import { useSite } from "@/lib/site-context";

/*
  "The whole site flies." Every element marked data-fly is transformed in 3D
  based on its distance from the viewport centre: it rises tilted from below,
  flattens as it passes the centre (where you read it), then tilts away as it
  leaves — so scrolling feels like a camera dollying through stacked planes.

  Applied to section content wrappers (not full-bleed image backgrounds), so it
  never opens gaps. Skipped for reduced motion.

  Performance notes — this loop touches every animated element on the page, so
  it has to behave:
    • the element lists are cached and only re-queried when the DOM changes,
      instead of running querySelectorAll on every frame;
    • all getBoundingClientRect() reads happen first, all style writes second.
      Interleaving them forces a synchronous layout per element per frame
      (layout thrashing) — that was the main source of scroll stutter;
    • static properties (will-change, transform-style, transform-origin) are
      set once per element, not 60 times a second;
    • elements far outside the viewport are skipped entirely;
    • values are rounded and compared before writing, so an unchanged frame
      costs nothing at all — `color` in particular repaints text when written.
*/

type Flown = HTMLElement & { __fly?: string; __op?: string; __hl?: string; __col?: string };

export default function ScrollFlight() {
  const { reducedMotion } = useSite();

  useEffect(() => {
    if (reducedMotion) return;

    let flyEls: Flown[] = [];
    let headEls: Flown[] = [];
    let dirty = true;

    const collect = () => {
      flyEls = Array.from(document.querySelectorAll<Flown>("[data-fly]"));
      headEls = Array.from(document.querySelectorAll<Flown>("[data-hl]"));
      // one-time setup: keeping these on the element avoids re-assigning
      // compositor hints every frame
      for (const el of flyEls) {
        el.style.transformStyle = "preserve-3d";
        el.style.willChange = "transform, opacity";
      }
      for (const el of headEls) el.style.transformOrigin = "left center";
      dirty = false;
    };

    const mo = new MutationObserver(() => {
      dirty = true;
    });
    mo.observe(document.body, { childList: true, subtree: true });

    let raf = 0;
    let lastY = -1;
    let lastVH = -1;
    let lastFull = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);

      const vh = window.innerHeight || 1;
      const y = window.scrollY;

      // Nothing moved? Fall back to a low-rate refresh so entrance animations
      // that shift layout without scrolling are still picked up.
      if (!dirty && y === lastY && vh === lastVH && now - lastFull < 120) return;
      lastY = y;
      lastVH = vh;
      lastFull = now;

      if (dirty) collect();

      const mid = vh / 2;
      const guard = vh * 1.5;

      // ── read pass ──────────────────────────────────────────────────────
      const flyR: (number | null)[] = new Array(flyEls.length);
      for (let i = 0; i < flyEls.length; i++) {
        const rect = flyEls[i].getBoundingClientRect();
        flyR[i] =
          rect.height === 0 || rect.bottom < -guard || rect.top > vh + guard
            ? null
            : rect.top + rect.height / 2;
      }
      const headR: (number | null)[] = new Array(headEls.length);
      for (let i = 0; i < headEls.length; i++) {
        const rect = headEls[i].getBoundingClientRect();
        headR[i] =
          rect.height === 0 || rect.bottom < -guard || rect.top > vh + guard
            ? null
            : rect.top + rect.height / 2;
      }

      // ── write pass ─────────────────────────────────────────────────────
      for (let i = 0; i < flyEls.length; i++) {
        const centre = flyR[i];
        if (centre === null) continue;
        const el = flyEls[i];
        let r = (centre - mid) / vh; // ~ -1 (above) .. +1 (below)
        r = Math.max(-1.2, Math.min(1.2, r));
        const rot = (-r * 10).toFixed(2); // tilt toward the camera
        const ty = (-r * 78).toFixed(1); // strong counter-drift
        const sc = (1 - Math.abs(r) * 0.05).toFixed(4);
        const op = Math.max(0, 1 - Math.abs(r) * 0.3).toFixed(3);
        const t = `perspective(1400px) translateY(${ty}px) rotateX(${rot}deg) scale(${sc})`;
        if (el.__fly !== t) {
          el.style.transform = t;
          el.__fly = t;
        }
        if (el.__op !== op) {
          el.style.opacity = op;
          el.__op = op;
        }
      }

      // headlines grow + shift ink → pink as they cross the viewport centre
      for (let i = 0; i < headEls.length; i++) {
        const centre = headR[i];
        if (centre === null) continue;
        const el = headEls[i];
        const r = Math.max(-1, Math.min(1, (centre - mid) / vh));
        const k = Math.max(0, 1 - Math.abs(r) * 1.25); // 0 at edges, 1 at centre
        const t = `scale(${(1 + k * 0.07).toFixed(3)})`;
        if (el.__hl !== t) {
          el.style.transform = t;
          el.__hl = t;
        }
        const R = Math.round(18 + (251 - 18) * k);
        const G = Math.round(14 + (0 - 14) * k);
        const B = Math.round(18 + (63 - 18) * k);
        const col = `rgb(${R},${G},${B})`;
        if (el.__col !== col) {
          el.style.color = col;
          el.__col = col;
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, [reducedMotion]);

  return null;
}
