"use client";

import { useEffect, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/*
  Per-letter headline reveal: each character rises + un-blurs on a stagger as
  the heading scrolls into view. Text is real text in the DOM (spans), so it
  stays selectable and accessible; reduced-motion shows it instantly.
*/
export default function SplitText({
  text,
  as: Tag = "h2",
  className = "",
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".split-char");
    if (reducedMotion) {
      gsap.set(chars, { opacity: 1, yPercent: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      // Transform + opacity only. The old blur(6px) → blur(0) ran a filter
      // re-rasterisation per character per frame, right while the visitor was
      // scrolling. The scale settle gives the same focus-pull feel on the GPU.
      gsap.fromTo(
        chars,
        { opacity: 0, yPercent: 90, scale: 1.08 },
        {
          opacity: 1,
          yPercent: 0,
          scale: 1,
          duration: 0.95,
          ease: "expo.out",
          stagger: 0.02,
          scrollTrigger: { trigger: el, start: "top 84%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="split-char inline-block will-change-transform">
              {ch}
            </span>
          ))}
          {/* A REAL space, not an empty box of the right width. The old spacer
              had no text in it, so a crawler read this heading as one run-on
              token — "Alles,wasdeineMarkebraucht." */}
          {wi < arr.length - 1 && (
            <span className="split-char inline-block">{" "}</span>
          )}
        </span>
      ))}
    </Tag>
  );
}
