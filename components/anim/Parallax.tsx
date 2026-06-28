"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Scroll-linked vertical drift for typography / elements.
export default function Parallax({
  children,
  className = "",
  speed = -70,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -speed * 0.5 },
        {
          y: speed * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion, speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
