// Shared, mutable scene state read by the WebGL layer every frame.
// Deliberately NOT React state — updating it must never trigger re-renders.

export type DeviceTier = "high" | "mid" | "low";

type SceneState = {
  scroll: number; // 0..1 page scroll progress
  scrollPx: number; // raw scrollY
  velocity: number; // smoothed, signed scroll velocity (~ -1..1)
  pointerX: number; // smoothed pointer, -1..1
  pointerY: number;
  rawPointerX: number; // immediate pointer target, -1..1
  rawPointerY: number;
  introProgress: number; // 0..1 while the intro plays
  introDone: boolean;
  dark: number; // 0..1 how "deep/dark" the world is at the current scroll
  tier: DeviceTier;
  reduced: boolean;
};

export const scene: SceneState = {
  scroll: 0,
  scrollPx: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  rawPointerX: 0,
  rawPointerY: 0,
  introProgress: 0,
  introDone: false,
  dark: 0,
  tier: "high",
  reduced: false,
};

export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  if (coarse || w < 768) return mem <= 4 || cores <= 4 ? "low" : "mid";
  if (cores <= 4 || mem <= 4) return "mid";
  return "high";
}

// Per-tier tuning knobs used across the WebGL components.
export const TIER_CONFIG: Record<
  DeviceTier,
  { field: number; intro: number; dpr: [number, number] }
> = {
  high: { field: 9000, intro: 3200, dpr: [1, 1.75] },
  mid: { field: 5200, intro: 2400, dpr: [1, 1.5] },
  low: { field: 3200, intro: 1500, dpr: [1, 1.3] },
};

let lastScrollPx = 0;
let rawVelocity = 0;
let cleanup: (() => void) | null = null;

// Attach global listeners once. Returns a disposer.
export function initSceneInputs(): () => void {
  if (typeof window === "undefined") return () => {};
  if (cleanup) return cleanup;

  scene.tier = detectTier();
  scene.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  lastScrollPx = window.scrollY;
  scene.scrollPx = lastScrollPx;

  const onScroll = () => {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scene.scrollPx = y;
    scene.scroll = Math.min(1, Math.max(0, y / max));
    rawVelocity = y - lastScrollPx;
    lastScrollPx = y;
  };

  const onPointer = (e: PointerEvent) => {
    scene.rawPointerX = (e.clientX / window.innerWidth) * 2 - 1;
    scene.rawPointerY = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const onReduced = (e: MediaQueryListEvent) => {
    scene.reduced = e.matches;
  };
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  mq.addEventListener("change", onReduced);
  onScroll();

  cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointer);
    mq.removeEventListener("change", onReduced);
    cleanup = null;
  };
  return cleanup;
}

// Called once per frame from the R3F loop to smooth inputs.
export function tickScene(damp = 0.08) {
  scene.pointerX += (scene.rawPointerX - scene.pointerX) * damp;
  scene.pointerY += (scene.rawPointerY - scene.pointerY) * damp;
  // normalise + decay velocity so it spikes on fast scroll then relaxes
  const target = Math.max(-1, Math.min(1, rawVelocity / 40));
  scene.velocity += (target - scene.velocity) * 0.1;
  rawVelocity *= 0.9;
}
