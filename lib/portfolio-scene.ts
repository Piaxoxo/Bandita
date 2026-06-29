// Mutable, ref-based state for the Portfolio "floating worlds" journey.
// Written by the scroll/pointer layer, read every frame by the WebGL scene.
// Never triggers React re-renders.

type PortfolioState = {
  progress: number; // 0..1 travel along the journey
  velocity: number; // smoothed signed scroll velocity
  rawPointerX: number;
  rawPointerY: number;
  pointerX: number; // smoothed -1..1
  pointerY: number;
  moved: boolean;
  active: number; // index of the station nearest the camera (-1 none)
  soundOn: boolean;
};

export const portfolio: PortfolioState = {
  progress: 0,
  velocity: 0,
  rawPointerX: 0,
  rawPointerY: 0,
  pointerX: 0,
  pointerY: 0,
  moved: false,
  active: -1,
  soundOn: false,
};

let attached = 0;
let onPointer: ((e: PointerEvent) => void) | null = null;
let lastProgress = 0;

export function attachPortfolioInputs(): () => void {
  if (typeof window === "undefined") return () => {};
  attached += 1;
  if (!onPointer) {
    onPointer = (e: PointerEvent) => {
      portfolio.rawPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      portfolio.rawPointerY = -((e.clientY / window.innerHeight) * 2 - 1);
      portfolio.moved = true;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
  }
  return () => {
    attached -= 1;
    if (attached <= 0 && onPointer) {
      window.removeEventListener("pointermove", onPointer);
      onPointer = null;
      attached = 0;
    }
  };
}

export function tickPortfolio(damp = 0.08) {
  portfolio.pointerX += (portfolio.rawPointerX - portfolio.pointerX) * damp;
  portfolio.pointerY += (portfolio.rawPointerY - portfolio.pointerY) * damp;
  const v = portfolio.progress - lastProgress;
  portfolio.velocity += (v * 60 - portfolio.velocity) * 0.1;
  lastProgress = portfolio.progress;
}
