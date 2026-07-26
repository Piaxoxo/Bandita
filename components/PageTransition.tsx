"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/*
  Liquid page transition: on every route change a pink slab wipes up and off,
  revealing the new page — a "curtain" flourish matching the Mercury world.
  Skipped on the first paint (the Loader owns that) and for reduced motion.
*/

export default function PageTransition() {
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = overlay.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap.timeline();
    tl.set(el, { display: "block", yPercent: 0 })
      .fromTo(
        el,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.42, ease: "power4.inOut" },
      )
      .to(el, { yPercent: -100, duration: 0.5, ease: "power4.inOut" }, "+=0.04")
      .set(el, { display: "none" });

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={overlay}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[85] hidden bg-pink"
      style={{ transform: "translateY(100%)" }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-3xl italic tracking-tight text-creme md:text-5xl">
          Bandita
        </span>
      </div>
    </div>
  );
}
