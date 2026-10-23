"use client";

import { useEffect, useRef } from "react";

/*
  The BANDITA particle intro, in Canvas 2D.

  This used to be a react-three-fiber scene. It looked right, but it put
  three.js (675 KB, ~1s of parse and compile on a mid-range phone) on the
  critical path of *every* page load — the loading screen was the single
  biggest reason the site felt frozen for its first few seconds.

  Nothing about the animation needed a GPU pipeline. It is a few thousand
  points with a position, a size and an alpha, drawn with normal blending and
  no depth. So the camera and the point-sprite shader are reimplemented here
  in about a hundred lines of arithmetic, and the whole 3D stack leaves the
  boot path.

  The maths below is deliberately the same as the shader it replaces, so the
  motion is identical frame for frame:

    pos        = mix(start, target, progress) + normalize(target) * scatter * …
    gl_PointSize = uSize * pixelRatio * (0.6 + seed * 0.8) * (16 / -z_view)
    alpha      = smoothstep(0, 0.28, progress) * (1 - scatter)

  Two details make this cheap enough to run at 60fps while the rest of the
  page hydrates:

  * alpha depends only on time, never on the individual particle, so it is a
    single `globalAlpha` write per frame instead of 3200 of them;
  * the soft dot is pre-rendered once per colour, so the per-particle cost is
    one `drawImage` and no path construction.
*/

const FOV = 45;
const WORD_W = 9; // world units the wordmark spans
const HALF = (FOV * Math.PI) / 180 / 2;
const FOCAL = 1 / Math.tan(HALF);

// Phase lengths, in seconds — unchanged from the WebGL version.
const FORM = 2.0;
const HOLD = 1.1;
const EXIT = 1.3;

const COLORS = ["#FCF6EC", "#FF5C9E", "#FB003F"] as const; // creme, rose, pink

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;

// Distance at which the word (plus margin) fits the current aspect ratio.
function fitDistance(aspect: number) {
  const z = (WORD_W * 1.18) / (2 * Math.tan(HALF) * aspect);
  return Math.max(7, Math.min(34, z));
}

type Buffers = {
  n: number;
  start: Float32Array;
  target: Float32Array;
  dir: Float32Array; // normalize(target), precomputed
  seed: Float32Array;
  color: Uint8Array; // index into COLORS
};

/*
  Sample the wordmark: draw "BANDITA" to an offscreen canvas, then keep an
  evenly spaced grid of the pixels it covers. Even spacing is what makes the
  dots read as letterforms rather than as noise.
*/
function sampleWord(count: number): Buffers | null {
  const cw = 1024;
  const ch = 280;
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Bodoni if the webfont has arrived, else a serif — only the silhouette
  // matters. Letter-spaced and medium weight so the dots trace open letters.
  ctx.font = "500 168px 'Bodoni Moda', Georgia, serif";
  ctx.letterSpacing = "14px";
  ctx.fillText("BANDITA", cw / 2, ch / 2 + 6);

  const data = ctx.getImageData(0, 0, cw, ch).data;
  const gap = 5;
  let raw: [number, number][] = [];
  for (let y = 0; y < ch; y += gap) {
    for (let x = 0; x < cw; x += gap) {
      if (data[(y * cw + x) * 4 + 3] > 128) raw.push([x, y]);
    }
  }
  if (!raw.length) return null;

  // Cap to the budget by striding, which preserves the even spacing.
  if (raw.length > count) {
    const stride = Math.ceil(raw.length / count);
    raw = raw.filter((_, i) => i % stride === 0);
  }
  const n = raw.length;

  const worldW = WORD_W;
  const worldH = (worldW * ch) / cw;
  const start = new Float32Array(n * 3);
  const target = new Float32Array(n * 3);
  const dir = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const color = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    const [px, py] = raw[i];
    const nx = px / cw - 0.5;
    const ny = -(py / ch - 0.5);
    const tx = nx * worldW + (Math.random() - 0.5) * 0.05;
    const ty = ny * worldH + (Math.random() - 0.5) * 0.05;
    const tz = (Math.random() - 0.5) * 0.6;
    target[i * 3] = tx;
    target[i * 3 + 1] = ty;
    target[i * 3 + 2] = tz;

    // normalize(target + epsilon), as the shader does
    const ex = tx + 0.0001;
    const ey = ty + 0.0001;
    const ez = tz + 0.0001;
    const len = Math.hypot(ex, ey, ez) || 1;
    dir[i * 3] = ex / len;
    dir[i * 3 + 1] = ey / len;
    dir[i * 3 + 2] = ez / len;

    // start from a wide cloud around the word
    const r = 10 + Math.random() * 16;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    start[i * 3] = r * Math.sin(b) * Math.cos(a);
    start[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.6;
    start[i * 3 + 2] = r * Math.cos(b) - 6;

    seed[i] = Math.random();
    const roll = Math.random();
    color[i] = roll < 0.78 ? 0 : roll < 0.92 ? 1 : 2;
  }

  return { n, start, target, dir, seed, color };
}

/*
  One soft dot per colour, pre-rendered. The gradient reproduces the
  fragment shader's `smoothstep(0.5, 0.34, d)` falloff: opaque out to 68% of
  the radius, then faded to nothing at the edge.
*/
function makeSprite(color: string): HTMLCanvasElement {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.68, color);
  g.addColorStop(0.84, color + "80"); // smoothstep is ~0.5 at the midpoint
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return c;
}

export default function IntroParticles2D({
  count,
  onExitStart,
  onComplete,
}: {
  count: number;
  onExitStart: () => void;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the callbacks in refs so the animation never restarts when the
  // parent re-renders (it re-renders on every counter tick).
  const exitCb = useRef(onExitStart);
  const doneCb = useRef(onComplete);
  exitCb.current = onExitStart;
  doneCb.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sprites = COLORS.map(makeSprite);
    let buffers: Buffers | null = null;
    let raf = 0;
    let disposed = false;
    let phase: "form" | "hold" | "exit" | "done" = "form";
    let elapsed = 0;
    let last = 0;
    let firedExit = false;

    let W = 0;
    let H = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = canvas.clientWidth || window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (progress: number, scatter: number, camZ: number) => {
      ctx.clearRect(0, 0, W, H);
      if (!buffers) return;

      // smoothstep(0, 0.28, progress)
      const t = Math.min(1, Math.max(0, progress / 0.28));
      const formAlpha = t * t * (3 - 2 * t);
      const alpha = formAlpha * (1 - scatter);
      if (alpha <= 0.002) return;
      ctx.globalAlpha = alpha;

      const { n, start, target, dir, seed, color } = buffers;
      const aspect = W / H;
      const fx = (FOCAL / aspect) * 0.5 * W;
      const fy = FOCAL * 0.5 * H;
      const cx = W / 2;
      const cy = H / 2;
      const scatterPush = scatter * 9;

      for (let i = 0; i < n; i++) {
        const i3 = i * 3;
        const s = seed[i];
        const push = scatterPush * (0.4 + s);

        const x = start[i3] + (target[i3] - start[i3]) * progress + dir[i3] * push;
        const y =
          start[i3 + 1] + (target[i3 + 1] - start[i3 + 1]) * progress + dir[i3 + 1] * push;
        const z =
          start[i3 + 2] +
          (target[i3 + 2] - start[i3 + 2]) * progress +
          dir[i3 + 2] * push +
          scatter * 7;

        // view space: the camera sits at (0, 0, camZ) looking down -z
        const vz = z - camZ;
        if (vz > -0.1) continue; // behind or level with the camera
        const inv = -1 / vz;

        const sx = cx + x * fx * inv;
        const sy = cy - y * fy * inv;
        // gl_PointSize in device px ÷ dpr — the pixel-ratio term cancels out
        const size = 2.7 * (0.6 + s * 0.8) * 16 * inv;
        if (size < 0.35) continue;

        const half = size / 2;
        if (sx + half < 0 || sx - half > W || sy + half < 0 || sy - half > H) continue;

        ctx.drawImage(sprites[color[i]], sx - half, sy - half, size, size);
      }

      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      if (disposed) return;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      elapsed += delta;

      const fitZ = fitDistance((W || 1) / (H || 1));
      let progress = 0;
      let scatter = 0;
      let camZ = fitZ;

      if (phase === "form") {
        const p = Math.min(1, elapsed / FORM);
        progress = easeOut(p);
        camZ = fitZ + 6 - easeOut(p) * 6;
        if (p >= 1) phase = "hold";
      } else if (phase === "hold") {
        progress = 1;
        camZ = fitZ;
        if (elapsed > FORM + HOLD) {
          phase = "exit";
          elapsed = 0;
        }
      } else if (phase === "exit") {
        if (!firedExit) {
          firedExit = true;
          exitCb.current();
        }
        const p = Math.min(1, elapsed / EXIT);
        progress = 1;
        scatter = easeIn(p);
        camZ = fitZ - easeIn(p) * fitZ * 0.55;
        if (p >= 1) {
          phase = "done";
          draw(progress, 1, camZ);
          doneCb.current();
          return;
        }
      }

      draw(progress, scatter, camZ);
      raf = requestAnimationFrame(frame);
    };

    // Sample the word once the webfont is in, so the dots trace Bodoni
    // rather than Georgia. Falls back on a timer if `fonts.ready` stalls.
    let built = false;
    const build = () => {
      if (built || disposed) return;
      built = true;
      buffers = sampleWord(count);
      raf = requestAnimationFrame(frame);
    };
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const fallback = window.setTimeout(build, 500);
    if (fonts?.ready) fonts.ready.then(build);
    else build();

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}
