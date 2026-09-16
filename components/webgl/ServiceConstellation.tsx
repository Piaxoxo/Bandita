"use client";

import { useEffect, useRef } from "react";
import { useSite } from "@/lib/site-context";

// A luxury orbiting constellation of the service words. Pure JS-driven
// pseudo-3D (CSS transforms) so it can use the brand Bodoni face and react
// to the pointer without any font/network dependency.
export default function ServiceConstellation({ items }: { items: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { reducedMotion } = useSite();

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;
    const N = items.length;

    let angle = 0;
    let targetMX = 0;
    let targetMY = 0;
    let mx = 0;
    let my = 0;
    let raf = 0;
    let last = performance.now();

    const baseY = items.map((_, i) => ((i % 2 === 0 ? -1 : 1) * (18 + ((i * 53) % 70))));

    const onMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      targetMX = (e.clientX - r.left) / r.width - 0.5;
      targetMY = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => {
      targetMX = 0;
      targetMY = 0;
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    // The loop only runs while the constellation is actually on screen —
    // otherwise it burned a frame budget on every scroll of the whole page.
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        const next = entries.some((e) => e.isIntersecting);
        if (next && !visible) {
          last = performance.now();
          raf = requestAnimationFrame(render);
        }
        visible = next;
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(container);

    const render = (t: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      mx += (targetMX - mx) * 0.05;
      my += (targetMY - my) * 0.05;
      angle += dt * 0.22 + mx * dt * 1.8;

      const r = container.getBoundingClientRect();
      const R = r.width * 0.33;

      for (let i = 0; i < N; i++) {
        const el = wordsRef.current[i];
        if (!el) continue;
        const a = angle + (i / N) * Math.PI * 2;
        const depth = Math.cos(a); // -1 (back) .. 1 (front)
        const norm = (depth + 1) / 2;
        const x = Math.sin(a) * R;
        const y = baseY[i] + my * 36 + Math.sin(t / 1000 + i * 1.3) * 7;
        // Depth is carried by scale + opacity + z-order alone. A per-frame
        // `filter: blur()` on every word meant N full re-rasterisations every
        // single frame — by far the most expensive thing on the services page.
        const scale = 0.48 + norm * 0.67;
        const opacity = 0.08 + norm * 0.92;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(Math.round(norm * 100));
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [items, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="relative mx-auto h-[380px] w-full max-w-[1100px] md:h-[520px]"
    >
      {items.map((w, i) => (
        <div
          key={w}
          ref={(el) => {
            wordsRef.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 whitespace-nowrap font-display text-4xl italic text-ink will-change-transform md:text-7xl"
        >
          {w}
          <span className="text-pink">.</span>
        </div>
      ))}
    </div>
  );
}
