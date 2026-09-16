"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
  stagger?: boolean;
} & Record<string, unknown>;

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  y = 44,
  blur = true,
  stagger = false,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      if (stagger) gsap.set(el.children, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const targets = stagger ? Array.from(el.children) : el;
    const ctx = gsap.context(() => {
      // This wrapper is used on nearly every block of the site, so it must be
      // compositor-only: a `filter: blur()` here meant the browser re-rasterised
      // the whole element on every frame of every reveal, while scrolling.
      // `scale` reproduces the soft "settle" and runs on the GPU.
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y,
          scale: blur ? 1.03 : 1,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          delay,
          ease: "expo.out",
          stagger: stagger ? 0.12 : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, delay, y, blur, stagger]);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} {...rest}>
      {children}
    </Tag>
  );
}
