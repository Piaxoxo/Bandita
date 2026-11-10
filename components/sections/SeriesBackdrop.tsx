"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { scene as store } from "@/lib/scene-store";

/*
  Four worlds behind four glasses, on one canvas.

  Each cocktail owns a particle world drawn in 2D: steam and cinnamon for
  the Chai Latte, falling leaves for the Pumpkin Martini, black sugar
  glitter for the Onyx Margarita, gold leaf in candlelight for the Truffle
  Sour. The series' scroll position (a float, 0..n-1) says which two worlds
  are on screen and how far the hand-off has come; both are drawn, cross-
  faded. Everything reacts to the pointer (or the phone's tilt, through the
  scene store): steam is stirred, leaves are blown, glitter gathers, gold
  swirls.

  One 2D canvas instead of four WebGL ones: the page already runs the glass
  window and the ribbon, and a third context per slide would be the old
  site's mistake again. Sprites are pre-rendered once; particle counts are
  halved on phones; the loop stops when the section is off screen.
*/

type Pointer = { x: number; y: number; vx: number; vy: number };

interface World {
  resize(w: number, h: number): void;
  step(dt: number, t: number, p: Pointer): void;
  draw(ctx: CanvasRenderingContext2D, alpha: number, t: number): void;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

function radialSprite(size: number, stops: [number, string][]): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/* ── 01 Chai Latte: steam and cinnamon ─────────────────────────────────── */
class Steam implements World {
  w = 1; h = 1;
  puffs: { x: number; y: number; r: number; a: number; life: number; max: number; vx: number; seed: number }[] = [];
  dust: { x: number; y: number; vx: number; vy: number; s: number; seed: number }[] = [];
  puff = radialSprite(256, [[0, "rgba(255,246,236,0.55)"], [0.45, "rgba(255,246,236,0.18)"], [1, "rgba(255,246,236,0)"]]);
  grain = radialSprite(16, [[0, "rgba(74,30,12,1)"], [0.6, "rgba(74,30,12,0.9)"], [1, "rgba(74,30,12,0)"]]);
  constructor(public scale: number) {}
  resize(w: number, h: number) {
    this.w = w; this.h = h;
    const np = Math.round(46 * this.scale);
    const nd = Math.round(260 * this.scale);
    this.puffs = Array.from({ length: np }, () => this.spawn(true));
    this.dust = Array.from({ length: nd }, () => ({
      x: rnd(0, w), y: rnd(0, h), vx: 0, vy: 0, s: rnd(1.6, 3.8), seed: Math.random(),
    }));
  }
  spawn(anywhere = false) {
    const max = rnd(5, 9);
    return {
      x: this.w * rnd(0.3, 0.7), y: anywhere ? rnd(0, this.h) : this.h * rnd(0.55, 0.8),
      r: rnd(100, 210), a: 0, life: anywhere ? rnd(0, max) : 0, max, vx: rnd(-6, 6), seed: Math.random(),
    };
  }
  step(dt: number, t: number, p: Pointer) {
    const { w, h } = this;
    for (let i = 0; i < this.puffs.length; i++) {
      const q = this.puffs[i];
      q.life += dt;
      if (q.life > q.max) { this.puffs[i] = this.spawn(); continue; }
      const k = q.life / q.max;
      q.a = Math.sin(k * Math.PI);
      q.y -= (28 + 22 * q.seed) * dt;
      q.x += (q.vx + Math.sin(t * 0.6 + q.seed * 9) * 14) * dt;
      q.r += 9 * dt;
      // the pointer stirs: puffs near it are pushed aside and set spinning
      const dx = q.x - p.x; const dy = q.y - p.y;
      const d = Math.hypot(dx, dy) + 1;
      if (d < 320) {
        const f = (1 - d / 320) * 160 * dt;
        q.x += (dx / d) * f - (dy / d) * f * 0.8;
        q.y += (dy / d) * f + (dx / d) * f * 0.8;
      }
    }
    for (const g of this.dust) {
      // a slow convection field, warm air rising through the middle
      const ang = Math.sin(g.y * 0.004 + t * 0.3) * 1.4 + Math.cos(g.x * 0.003 - t * 0.2) * 1.1;
      g.vx += (Math.cos(ang) * 10 - g.vx) * 0.6 * dt;
      g.vy += (-14 + Math.sin(ang) * 10 - g.vy) * 0.6 * dt;
      const dx = g.x - p.x; const dy = g.y - p.y;
      const d = Math.hypot(dx, dy) + 1;
      if (d < 200) { const f = (1 - d / 200) * 420 * dt; g.vx += (dx / d) * f + p.vx * 0.4 * dt; g.vy += (dy / d) * f + p.vy * 0.4 * dt; }
      g.x += g.vx * dt; g.y += g.vy * dt;
      if (g.y < -10) { g.y = h + 10; g.x = rnd(0, w); }
      if (g.x < -10) g.x = w + 10; else if (g.x > w + 10) g.x = -10;
    }
  }
  draw(ctx: CanvasRenderingContext2D, alpha: number) {
    // plain creme haze on the pink: soft-light was invisible on this field
    for (const q of this.puffs) {
      ctx.globalAlpha = alpha * q.a * 0.34;
      ctx.drawImage(this.puff, q.x - q.r, q.y - q.r, q.r * 2, q.r * 2);
    }
    ctx.globalAlpha = alpha * 0.8;
    for (const g of this.dust) ctx.drawImage(this.grain, g.x - g.s, g.y - g.s, g.s * 2, g.s * 2);
    ctx.globalAlpha = 1;
  }
}

/* ── 02 Pumpkin Martini: autumn leaves in the wind ─────────────────────── */
class Leaves implements World {
  w = 1; h = 1;
  leaves: { x: number; y: number; vx: number; vy: number; s: number; rot: number; vr: number; flip: number; vf: number; c: string }[] = [];
  colors = ["#FF8A5B", "#FFC23D", "#C2452D", "#8A3A1A", "#E0642B"];
  constructor(public scale: number) {}
  resize(w: number, h: number) {
    this.w = w; this.h = h;
    this.leaves = Array.from({ length: Math.round(54 * this.scale) }, () => this.spawn(true));
  }
  spawn(anywhere = false) {
    return {
      x: rnd(-40, this.w + 40), y: anywhere ? rnd(-40, this.h) : rnd(-160, -40),
      vx: rnd(-20, 20), vy: rnd(30, 70), s: rnd(14, 38), rot: rnd(0, TAU), vr: rnd(-1.5, 1.5),
      flip: rnd(0, TAU), vf: rnd(1, 2.6), c: this.colors[Math.floor(Math.random() * this.colors.length)],
    };
  }
  step(dt: number, t: number, p: Pointer) {
    const { w, h } = this;
    const gust = Math.sin(t * 0.35) * 18;
    for (let i = 0; i < this.leaves.length; i++) {
      const l = this.leaves[i];
      // falling, swaying, tumbling; the pointer is a gust of wind
      l.vx += ((gust + Math.sin(t * 1.3 + l.flip) * 12) - l.vx) * 0.5 * dt;
      l.vy += ((40 + l.s * 0.9) - l.vy) * 0.5 * dt;
      const dx = l.x - p.x; const dy = l.y - p.y;
      const d = Math.hypot(dx, dy) + 1;
      if (d < 260) {
        const f = (1 - d / 260) * 900 * dt;
        l.vx += (dx / d) * f + p.vx * 1.2 * dt;
        l.vy += (dy / d) * f * 0.6 + p.vy * 1.2 * dt;
        l.vr += (Math.random() - 0.5) * 6 * dt;
      }
      l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt; l.flip += l.vf * dt;
      l.vr *= 1 - 0.4 * dt;
      if (l.y > h + 60 || l.x < -120 || l.x > w + 120) this.leaves[i] = this.spawn();
    }
  }
  draw(ctx: CanvasRenderingContext2D, alpha: number) {
    ctx.globalAlpha = alpha;
    for (const l of this.leaves) {
      const sy = Math.cos(l.flip); // the tumble: a leaf seen edge-on is a line
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.scale(1, Math.max(0.08, Math.abs(sy)));
      ctx.fillStyle = l.c;
      ctx.globalAlpha = alpha * (0.75 + 0.25 * Math.abs(sy));
      const s = l.s;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s);
      ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s);
      ctx.fill();
      ctx.strokeStyle = "rgba(26,18,22,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 0.9); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

/* ── 03 Onyx Margarita: black sugar glitter ────────────────────────────── */
class Glitter implements World {
  w = 1; h = 1;
  specks: { x: number; y: number; vx: number; vy: number; s: number; ph: number; sp: number; gold: boolean }[] = [];
  shards: { x: number; y: number; r: number; rot: number; vr: number; pts: [number, number][]; depth: number }[] = [];
  constructor(public scale: number) {}
  resize(w: number, h: number) {
    this.w = w; this.h = h;
    this.specks = Array.from({ length: Math.round(900 * this.scale) }, () => ({
      x: rnd(0, w), y: rnd(0, h), vx: 0, vy: 0, s: rnd(0.8, 2.4), ph: rnd(0, TAU), sp: rnd(1.5, 5), gold: Math.random() < 0.14,
    }));
    this.shards = Array.from({ length: 7 }, () => {
      const r = rnd(90, 220);
      const k = 5 + Math.floor(Math.random() * 3);
      const pts: [number, number][] = Array.from({ length: k }, (_, i) => {
        const a = (i / k) * TAU + rnd(-0.3, 0.3);
        const rr = r * rnd(0.6, 1);
        return [Math.cos(a) * rr, Math.sin(a) * rr];
      });
      return { x: rnd(0, w), y: rnd(0, h), r, rot: rnd(0, TAU), vr: rnd(-0.08, 0.08), pts, depth: rnd(0.3, 1) };
    });
  }
  step(dt: number, t: number, p: Pointer) {
    const { w, h } = this;
    for (const s of this.specks) {
      // glitter gathers around the pointer in a slow ring, like sugar on a rim
      const dx = p.x - s.x; const dy = p.y - s.y;
      const d = Math.hypot(dx, dy) + 1;
      if (d < 300) {
        const ring = 110;
        const f = (d - ring) * 2.2 * dt;
        s.vx += (dx / d) * f - (dy / d) * 40 * dt;
        s.vy += (dy / d) * f + (dx / d) * 40 * dt;
      }
      s.vx += (Math.sin(t * 0.5 + s.ph) * 4 - s.vx) * 1.2 * dt;
      s.vy += (3 - s.vy) * 1.2 * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y > h + 4) { s.y = -4; s.x = rnd(0, w); }
      if (s.x < -4) s.x = w + 4; else if (s.x > w + 4) s.x = -4;
    }
    for (const sh of this.shards) {
      sh.rot += sh.vr * dt;
      // deep parallax: shards drift against the pointer by their depth
      sh.x += ((this.w / 2 + (this.w / 2 - p.x) * 0.12 * sh.depth + Math.sin(t * 0.1 + sh.r) * 40) - sh.x) * 0.02;
      sh.y += ((sh.y + 6 * sh.depth * dt));
      sh.y = sh.y > h + sh.r ? -sh.r : sh.y;
    }
  }
  draw(ctx: CanvasRenderingContext2D, alpha: number, t: number) {
    for (const sh of this.shards) {
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.rot);
      ctx.globalAlpha = alpha * 0.07 * sh.depth;
      ctx.fillStyle = "#1A1216";
      ctx.beginPath();
      sh.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for (const s of this.specks) {
      const tw = Math.pow(Math.abs(Math.sin(t * s.sp + s.ph)), 3);
      ctx.globalAlpha = alpha * (0.25 + 0.75 * tw);
      ctx.fillStyle = s.gold ? "#B8862B" : "#1A1216";
      const r = s.s * (0.7 + 0.6 * tw);
      ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }
}

/* ── 04 Truffle Sour: gold leaf in candlelight ─────────────────────────── */
class GoldLeaf implements World {
  w = 1; h = 1;
  flakes: { x: number; y: number; vx: number; vy: number; s: number; rot: number; vr: number; flip: number; vf: number; pts: [number, number][] }[] = [];
  glow = radialSprite(512, [[0, "rgba(255,170,80,0.55)"], [0.35, "rgba(255,140,60,0.22)"], [1, "rgba(255,120,50,0)"]]);
  constructor(public scale: number) {}
  resize(w: number, h: number) {
    this.w = w; this.h = h;
    this.flakes = Array.from({ length: Math.round(80 * this.scale) }, () => this.spawn(true));
  }
  spawn(anywhere = false) {
    const k = 5 + Math.floor(Math.random() * 3);
    const pts: [number, number][] = Array.from({ length: k }, (_, i) => {
      const a = (i / k) * TAU + rnd(-0.4, 0.4);
      const rr = rnd(0.5, 1);
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });
    return {
      x: rnd(0, this.w), y: anywhere ? rnd(0, this.h) : rnd(-80, -20),
      vx: 0, vy: rnd(14, 34), s: rnd(7, 26), rot: rnd(0, TAU), vr: rnd(-0.8, 0.8), flip: rnd(0, TAU), vf: rnd(0.8, 2), pts,
    };
  }
  step(dt: number, t: number, p: Pointer) {
    const { w, h } = this;
    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];
      // gold leaf swirls around the pointer rather than fleeing it
      const dx = f.x - p.x; const dy = f.y - p.y;
      const d = Math.hypot(dx, dy) + 1;
      if (d < 280) {
        const k = (1 - d / 280) * 700 * dt;
        f.vx += (-dy / d) * k + (dx / d) * k * 0.3 + p.vx * 0.8 * dt;
        f.vy += (dx / d) * k + (dy / d) * k * 0.3 + p.vy * 0.8 * dt;
        f.vr += k * 0.01;
      }
      f.vx += (Math.sin(t * 0.7 + f.flip) * 8 - f.vx) * 0.8 * dt;
      f.vy += ((14 + f.s * 0.6) - f.vy) * 0.8 * dt;
      f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; f.flip += f.vf * dt;
      f.vr *= 1 - 0.6 * dt;
      if (f.y > h + 40 || f.x < -80 || f.x > w + 80) this.flakes[i] = this.spawn();
    }
  }
  draw(ctx: CanvasRenderingContext2D, alpha: number, t: number) {
    // candlelight, low and to the left, flickering
    const fl = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
    const gr = this.h * 0.9 * fl;
    ctx.globalAlpha = alpha * 0.9;
    ctx.drawImage(this.glow, this.w * 0.18 - gr, this.h * 0.92 - gr, gr * 2, gr * 2);
    for (const f of this.flakes) {
      const sy = Math.cos(f.flip);
      const glint = Math.pow(Math.max(0, 1 - Math.abs(sy) * 3), 2); // the flash as it turns edge-on
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.scale(1, Math.max(0.06, Math.abs(sy)));
      const g = ctx.createLinearGradient(-f.s, -f.s, f.s, f.s);
      g.addColorStop(0, "#F6DE8C");
      g.addColorStop(0.5, "#D4A24C");
      g.addColorStop(1, "#8E6520");
      ctx.fillStyle = g;
      ctx.globalAlpha = alpha * (0.8 + 0.2 * Math.abs(sy));
      ctx.beginPath();
      f.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * f.s, y * f.s) : ctx.moveTo(x * f.s, y * f.s)));
      ctx.closePath();
      ctx.fill();
      if (glint > 0.05) {
        ctx.globalAlpha = alpha * glint;
        ctx.fillStyle = "#FFF6E0";
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

export default function SeriesBackdrop({
  pos,
  active,
}: {
  /** series position as a float, 0..n-1, written by the scroll timeline */
  pos: MutableRefObject<number>;
  /** whether the pinned section is on screen */
  active: MutableRefObject<boolean>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = window.innerWidth < 768 ? 0.5 : 1;
    const worlds: World[] = [new Steam(scale), new Leaves(scale), new Glitter(scale), new GoldLeaf(scale)];
    let W = 0;
    let H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      worlds.forEach((w) => w.resize(W, H));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const p: Pointer = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!active.current || W < 2) return;
      const t = now / 1000;

      // the pointer in canvas space; its velocity is what the leaves feel
      const nx = ((store.pointerX + 1) / 2) * W;
      const ny = ((1 - store.pointerY) / 2) * H;
      p.vx = (nx - p.x) / Math.max(dt, 0.001) * 0.1;
      p.vy = (ny - p.y) / Math.max(dt, 0.001) * 0.1;
      p.x = nx; p.y = ny;

      const f = Math.max(0, Math.min(worlds.length - 1, pos.current));
      const a = Math.floor(f);
      const b = Math.min(worlds.length - 1, a + 1);
      const k = f - a;

      ctx.clearRect(0, 0, W, H);
      if (k < 0.999) { worlds[a].step(dt, t, p); worlds[a].draw(ctx, 1 - k, t); }
      if (k > 0.001 && b !== a) { worlds[b].step(dt, t, p); worlds[b].draw(ctx, k, t); }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [pos, active]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
