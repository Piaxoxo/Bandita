"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Touch / coarse pointer → no custom cursor
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const html = document.documentElement;
    html.classList.add("has-custom-cursor");

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const glow = glowRef.current!;
    const label = labelRef.current!;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let raf = 0;

    const render = () => {
      // dot follows fast, ring trails, glow trails most (smooth lerp)
      dotX += (mouseX - dotX) * 0.55;
      dotY += (mouseY - dotY) * 0.55;
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const setState = (state: string, text = "") => {
      ring.dataset.state = state;
      label.textContent = text;
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor]",
      );
      if (target) {
        setState(target.dataset.cursor || "hover", target.dataset.cursorText || "");
      } else if ((e.target as HTMLElement)?.closest("a, button, [role='button']")) {
        setState("link");
      } else {
        setState("default");
      }
    };

    const onDown = () => (ring.dataset.press = "true");
    const onUp = () => (ring.dataset.press = "false");
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={glowRef}
        className="fixed left-0 top-0 h-40 w-40 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,0,63,0.35), rgba(255,92,158,0.12) 50%, transparent 70%)",
        }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-pink mix-blend-normal transition-opacity duration-300"
      />
      <div
        ref={ringRef}
        data-state="default"
        data-press="false"
        className="cursor-ring fixed left-0 top-0 flex items-center justify-center rounded-full transition-opacity duration-300"
      >
        <span
          ref={labelRef}
          className="select-none text-[10px] font-medium uppercase tracking-[0.2em] text-creme"
        />
      </div>
    </div>
  );
}
