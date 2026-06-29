// Mutable, ref-based state for the About page's bespoke particle world.
// Written by AboutStory (scroll/observer), read every frame by AboutScene.
// Deliberately NOT React state — never triggers re-renders.

type AboutSceneState = {
  cohesion: number; // 0 = dispersed cloud, 1 = formed into the illustration
  rawPointerX: number;
  rawPointerY: number;
  pointerX: number; // smoothed
  pointerY: number;
  intensity: number; // ambient energy boost (e.g. manifesto peak)
};

export const aboutScene: AboutSceneState = {
  cohesion: 0,
  rawPointerX: 0,
  rawPointerY: 0,
  pointerX: 0,
  pointerY: 0,
  intensity: 0,
};

let attached = 0;
let onPointer: ((e: PointerEvent) => void) | null = null;

// Attach the pointer listener once (ref-counted across mounts).
export function attachAboutInputs(): () => void {
  if (typeof window === "undefined") return () => {};
  attached += 1;
  if (!onPointer) {
    onPointer = (e: PointerEvent) => {
      aboutScene.rawPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      aboutScene.rawPointerY = -((e.clientY / window.innerHeight) * 2 - 1);
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

export function tickAboutInputs(damp = 0.07) {
  aboutScene.pointerX += (aboutScene.rawPointerX - aboutScene.pointerX) * damp;
  aboutScene.pointerY += (aboutScene.rawPointerY - aboutScene.pointerY) * damp;
}
