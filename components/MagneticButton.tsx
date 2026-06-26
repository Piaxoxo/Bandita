"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useSite } from "@/lib/site-context";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
  as?: "button" | "a";
  href?: string;
  ariaLabel?: string;
  cursor?: string;
};

export default function MagneticButton({
  children,
  onClick,
  className = "",
  strength = 0.4,
  as = "button",
  href,
  ariaLabel,
  cursor = "hover",
}: Props) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const { reducedMotion } = useSite();

  const onMove = (e: React.MouseEvent) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  const Tag = as as React.ElementType;
  const extraProps = as === "a" ? { href } : {};

  return (
    <Tag
      ref={ref}
      {...extraProps}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label={ariaLabel}
      data-cursor={cursor}
      className={`inline-flex items-center justify-center will-change-transform ${className}`}
    >
      {children}
    </Tag>
  );
}
