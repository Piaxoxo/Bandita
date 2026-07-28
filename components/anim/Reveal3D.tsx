"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/*
  Staggered 3D entrance for a grid/row: each direct child tilts up out of the
  page (rotateX) and settles as it scrolls into view. One ScrollTrigger per
  container (cheap), transform + opacity only — no blur, no scrub.
*/
export default function Reveal3D({
  children,
  as: Tag = "div",
  className = "",
  stagger = 0.08,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children);
    if (!items.length) return;
    if (reducedMotion) {
      gsap.set(items, { opacity: 1, y: 0, rotateX: 0, filter: "none" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 64, rotateX: -26, transformPerspective: 1000, transformOrigin: "center bottom" },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 1, ease: "expo.out", stagger,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion, stagger]);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={{ perspective: "1200px" }} {...rest}>
      {children}
    </Tag>
  );
}
