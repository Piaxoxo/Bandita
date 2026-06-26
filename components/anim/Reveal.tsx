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
};

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  y = 44,
  blur = true,
  stagger = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, filter: "none" });
      if (stagger) gsap.set(el.children, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    const targets = stagger ? Array.from(el.children) : el;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y,
          filter: blur ? "blur(10px)" : "blur(0px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.1,
          delay,
          ease: "expo.out",
          stagger: stagger ? 0.12 : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, delay, y, blur, stagger]);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
