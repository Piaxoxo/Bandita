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
      gsap.set(chars, { opacity: 1, yPercent: 0, filter: "none" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0, yPercent: 90, filter: "blur(6px)" },
        {
          opacity: 1,
          yPercent: 0,
          filter: "blur(0px)",
          duration: 0.9,
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
          {wi < arr.length - 1 && <span className="split-char inline-block w-[0.26em]" />}
        </span>
      ))}
    </Tag>
  );
}
