// Mutable, ref-based state for "The Studio" colour-room journey.
// Written by the scroll/observer layer, read every frame by the WebGL world.

type StudioState = {
  active: number; // index into the section list (0 = hero)
  color: string; // brand colour flooding the current room
  partnership: number; // 0..1 — the merge/logo climax strength
  rawPointerX: number;
  rawPointerY: number;
  pointerX: number;
  pointerY: number;
  scrollY: number;
};

export const studio: StudioState = {
  active: 0,
  color: "#FCF6EC",
  partnership: 0,
  rawPointerX: 0,
  rawPointerY: 0,
  pointerX: 0,
  pointerY: 0,
  scrollY: 0,
};

let attached = 0;
let onPointer: ((e: PointerEvent) => void) | null = null;
let onScroll: (() => void) | null = null;

export function attachStudioInputs(): () => void {
  if (typeof window === "undefined") return () => {};
  attached += 1;
  if (!onPointer) {
    onPointer = (e: PointerEvent) => {
      studio.rawPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      studio.rawPointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
  }
  if (!onScroll) {
    onScroll = () => {
      studio.scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  return () => {
    attached -= 1;
    if (attached <= 0) {
      if (onPointer) window.removeEventListener("pointermove", onPointer);
      if (onScroll) window.removeEventListener("scroll", onScroll);
      onPointer = null;
      onScroll = null;
      attached = 0;
    }
  };
}

export function tickStudio(damp = 0.08) {
  studio.pointerX += (studio.rawPointerX - studio.pointerX) * damp;
  studio.pointerY += (studio.rawPointerY - studio.pointerY) * damp;
}
