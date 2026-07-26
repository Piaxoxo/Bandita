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
*/
export default function ScrollFlight() {
  const { reducedMotion } = useSite();

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const tick = () => {
      const vh = window.innerHeight || 1;
      const mid = vh / 2;
      const els = document.querySelectorAll<HTMLElement>("[data-fly]");
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.height === 0) return;
        const centre = rect.top + rect.height / 2;
        let r = (centre - mid) / vh; // ~ -1 (above) .. +1 (below)
        r = Math.max(-1.2, Math.min(1.2, r));
        const rot = -r * 10; // tilt toward the camera
        const ty = -r * 78; // strong counter-drift → the page is always moving
        const sc = 1 - Math.abs(r) * 0.05;
        const op = Math.max(0, 1 - Math.abs(r) * 0.3);
        el.style.transform = `perspective(1400px) translateY(${ty}px) rotateX(${rot}deg) scale(${sc})`;
        el.style.opacity = String(op);
        el.style.transformStyle = "preserve-3d";
        el.style.willChange = "transform, opacity";
      });

      // headlines grow + shift ink → pink as they cross the viewport centre
      const heads = document.querySelectorAll<HTMLElement>("[data-hl]");
      heads.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.height === 0) return;
        const centre = rect.top + rect.height / 2;
        const r = Math.max(-1, Math.min(1, (centre - mid) / vh));
        const k = Math.max(0, 1 - Math.abs(r) * 1.25); // 0 at edges, 1 at centre
        el.style.transformOrigin = "left center";
        el.style.transform = `scale(${(1 + k * 0.07).toFixed(3)})`;
        const R = Math.round(18 + (251 - 18) * k);
        const G = Math.round(14 + (0 - 14) * k);
        const B = Math.round(18 + (63 - 18) * k);
        el.style.color = `rgb(${R},${G},${B})`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return null;
}
