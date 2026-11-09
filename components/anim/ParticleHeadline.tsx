"use client";

import { useEffect, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/*
  A headline that assembles out of particles as it scrolls into view and
  dissolves as it scrolls out — the intro's technique, applied to the
  chapter lines.

  How it stays honest: the real headline is real text in the DOM, laid out
  by the browser exactly as it would be anyway, including line breaks. Once
  the particles are ready its colour is set to transparent — not hidden, so
  it stays in the accessibility tree and in the page for crawlers — and the
  canvas draws over it. The particle targets are sampled from the same text
  drawn with the computed font at each word's measured position, so the dots
  land where the letters are.

  Scroll-linked, not time-linked: progress is the headline's position in the
  viewport. The particles are the transition, the type is the type: the dots
  gather (0–34 %), hand over to the real Bodoni in a short crossfade, the
  line stands crisp and readable while it is in the middle of the screen
  (42–58 %), then the dots take it back and drift away (66–100 %). Scrolling
  back reverses it. Reduced motion shows the text and never mounts a canvas.
*/

type Particle = {
  tx: number; ty: number; // target
  sx: number; sy: number; // scattered start
  ex: number; ey: number; // dissolve end
  r: number; // radius
  c: 0 | 1; // colour index
  seed: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

function makeSprite(color: string): HTMLCanvasElement {
  const S = 32;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.6, color);
  g.addColorStop(0.82, color + "80");
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return c;
}

export default function ParticleHeadline({
  text,
  as: Tag = "h2",
  className = "",
  color = "#1A1216",
  accent = "#FB003F",
  accentRatio = 0.12,
  mode = "scroll",
  armed = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** particle colour — the headline's ink */
  color?: string;
  /** a few particles in the brand colour, so the line is never flat */
  accent?: string;
  accentRatio?: number;
  /**
   * "scroll": forms and dissolves with the line's position in the viewport.
   * "cover": the line is on screen from the start, so it forms on a clock
   * once `armed` (after the intro) and only the dissolve is scroll-driven.
   */
  mode?: "scroll" | "cover";
  armed?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useSite();
  // cover mode: the formation starts from the outside, via this ref, so a
  // change of `armed` does not rebuild the particles
  const startForm = useRef<() => void>(() => {});
  const armedRef = useRef(armed);
  armedRef.current = armed;

  useEffect(() => {
    if (mode === "cover" && armed) startForm.current();
  }, [mode, armed]);

  useEffect(() => {
    const el = textRef.current;
    const canvas = canvasRef.current;
    const box = wrap.current;
    if (!el || !canvas || !box || reducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = [makeSprite(color), makeSprite(accent)];
    let particles: Particle[] = [];
    let W = 0;
    let H = 0;
    let progress = 0;
    let active = false;
    let disposed = false;
    let raf = 0;

    const build = () => {
      if (disposed) return;
      const r = box.getBoundingClientRect();
      W = r.width;
      H = r.height;
      if (W < 2 || H < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Draw the words where the browser put them, with the font it used.
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(W));
      off.height = Math.max(1, Math.round(H));
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      octx.fillStyle = "#000";
      octx.textBaseline = "top";
      octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      octx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      el.querySelectorAll<HTMLElement>(".ph-word").forEach((w) => {
        const wr = w.getBoundingClientRect();
        // the em box sits centred in the line box
        const y = wr.top - r.top + (wr.height - fs) / 2;
        octx.fillText(w.textContent || "", wr.left - r.left, y);
      });

      const data = octx.getImageData(0, 0, off.width, off.height).data;
      // Dense enough that Bodoni's hairlines survive: a whole sentence needs
      // thousands of dots, not hundreds, or the letters come out as outlines.
      const gap = Math.max(3, Math.min(6, Math.round(fs / 30)));
      let raw: [number, number][] = [];
      for (let y = 0; y < off.height; y += gap) {
        for (let x = 0; x < off.width; x += gap) {
          if (data[(y * off.width + x) * 4 + 3] > 110) raw.push([x, y]);
        }
      }
      const CAP = window.innerWidth < 768 ? 3200 : 6500;
      if (raw.length > CAP) {
        const stride = Math.ceil(raw.length / CAP);
        raw = raw.filter((_, i) => i % stride === 0);
      }
      particles = raw.map(([x, y]) => {
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 200;
        const seed = Math.random();
        return {
          tx: x, ty: y,
          sx: x + Math.cos(a) * d, sy: y + Math.sin(a) * d * 0.6,
          ex: x + (Math.random() - 0.5) * 120, ey: y - 50 - Math.random() * 140,
          r: 1.3 + seed * 1.4,
          c: Math.random() < accentRatio ? 1 : 0,
          seed,
        };
      });
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!particles.length) return;
      const p = progress;

      // phase 0 forms, 1 holds (real type), 2 dissolves; `text` and `dots`
      // are the two layers' opacities and cross over at the hand-offs
      let phase: 0 | 1 | 2 = 1;
      let k = 0;
      let text = 0;
      let dots = 0;
      if (p < 0.34) { phase = 0; k = easeOut(p / 0.34); dots = smooth(Math.min(1, k * 1.5)); }
      else if (p < 0.42) { k = (p - 0.34) / 0.08; dots = 1 - k; text = k; }
      else if (p < 0.58) { text = 1; }
      else if (p < 0.66) { k = (p - 0.58) / 0.08; dots = k; text = 1 - k; }
      else { phase = 2; k = easeIn((p - 0.66) / 0.34); dots = 1 - k; }

      el.style.opacity = String(text);
      if (dots <= 0.01) return;
      ctx.globalAlpha = dots;
      const t = performance.now() / 1000;
      for (const q of particles) {
        let x: number;
        let y: number;
        if (phase === 0) { x = q.sx + (q.tx - q.sx) * k; y = q.sy + (q.ty - q.sy) * k; }
        else if (phase === 2) { x = q.tx + (q.ex - q.tx) * k; y = q.ty + (q.ey - q.ty) * k; }
        else {
          // formed: the faintest breathing, so a held line is never a bitmap
          x = q.tx + Math.sin(t * 1.3 + q.seed * 9) * 0.5;
          y = q.ty + Math.cos(t * 1.1 + q.seed * 7) * 0.5;
        }
        const s = q.r * 2;
        ctx.drawImage(sprites[q.c], x - q.r, y - q.r, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (disposed) return;
      if (active) draw();
      raf = requestAnimationFrame(loop);
    };

    let st: ScrollTrigger;
    let formTween: gsap.core.Tween | null = null;
    if (mode === "scroll") {
      st = ScrollTrigger.create({
        trigger: box,
        start: "top 88%",
        end: "bottom 10%",
        scrub: 0.5,
        onUpdate: (self) => { progress = self.progress; },
        onToggle: (self) => { active = self.isActive; if (!active) draw(); },
      });
    } else {
      // Formation on a clock, dissolve on scroll: the two never overlap in
      // time, so whichever is further along owns the progress value.
      const form = { v: 0 };
      let dissolve = 0;
      const apply = () => {
        progress = dissolve > 0.002 ? 0.58 + 0.42 * dissolve : form.v * 0.5;
      };
      active = true;
      startForm.current = () => {
        if (formTween || disposed) return;
        formTween = gsap.to(form, { v: 1, duration: 2.2, delay: 0.15, ease: "power2.out", onUpdate: apply });
      };
      if (armedRef.current) startForm.current();
      st = ScrollTrigger.create({
        trigger: box,
        start: "top 35%",
        end: "top -20%",
        scrub: 0.4,
        onUpdate: (self) => { dissolve = self.progress; apply(); },
      });
    }

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      build();
      raf = requestAnimationFrame(loop);
    });

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const start = () => {
      if (disposed) return;
      build();
      ro.observe(box);
      raf = requestAnimationFrame(loop);
    };
    if (fonts?.ready) fonts.ready.then(start);
    else start();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      st.kill();
      formTween?.kill();
      el.style.opacity = "";
    };
  }, [text, color, accent, accentRatio, reducedMotion, mode]);

  // A span headline (one line of a larger heading) needs a span wrapper, so
  // the markup stays valid inside the parent's <h1>/<h2>.
  const Wrap: ElementType = Tag === "span" ? "span" : "div";

  return (
    <Wrap ref={wrap} className="relative block">
      <Tag ref={textRef as React.Ref<HTMLElement>} className={className}>
        {text.split(" ").map((word, i, arr) => (
          <span key={i}>
            <span className="ph-word inline-block">{word}</span>
            {i < arr.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
    </Wrap>
  );
}
