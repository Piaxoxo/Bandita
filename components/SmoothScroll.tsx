"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll() {
  const { reducedMotion } = useSite();
  const pathname = usePathname();

  // Anchor links from other routes arrive as `/<lang>#section`. Once this
  // route has settled, scroll to the target (Lenis if available, native else).
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const t = setTimeout(() => scrollToId(hash), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (reducedMotion) {
      // No inertia for reduced-motion users; native scroll only.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Expose for programmatic anchor scrolling
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, [reducedMotion]);

  return null;
}
