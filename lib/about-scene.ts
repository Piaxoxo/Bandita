// Mutable, ref-based state for the About page's bespoke particle world.
// Written by AboutStory (scroll/observer), read every frame by AboutScene.
// Deliberately NOT React state — never triggers re-renders.

type AboutSceneState = {
  cohesion: number; // pull toward the WOMAN formation (Der Name section)
  finale: number; // pull toward the WORDMARK formation (Finale section)
  explode: number; // outward burst (Manifesto peak)
  intensity: number; // ambient energy / glow boost
  scroll: number; // 0..1 page progress (camera flythrough)
  heroReleased: boolean; // the intro film has dispersed — hero headline may appear
  moved: boolean; // has the pointer moved yet (gates the cursor repel)
  rawPointerX: number;
  rawPointerY: number;
  pointerX: number; // smoothed
  pointerY: number;
};

export const aboutScene: AboutSceneState = {
  cohesion: 0,
  finale: 0,
  explode: 0,
  intensity: 0,
  scroll: 0,
  heroReleased: false,
  moved: false,
  rawPointerX: 0,
  rawPointerY: 0,
  pointerX: 0,
  pointerY: 0,
};

let attached = 0;
let onPointer: ((e: PointerEvent) => void) | null = null;
let onScroll: (() => void) | null = null;

// Attach pointer + scroll listeners once (ref-counted across mounts).
export function attachAboutInputs(): () => void {
  if (typeof window === "undefined") return () => {};
  attached += 1;
  if (!onPointer) {
    onPointer = (e: PointerEvent) => {
      aboutScene.rawPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      aboutScene.rawPointerY = -((e.clientY / window.innerHeight) * 2 - 1);
      aboutScene.moved = true;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
  }
  if (!onScroll) {
    onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      aboutScene.scroll = Math.min(1, Math.max(0, window.scrollY / max));
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

export function tickAboutInputs(damp = 0.08) {
  aboutScene.pointerX += (aboutScene.rawPointerX - aboutScene.pointerX) * damp;
  aboutScene.pointerY += (aboutScene.rawPointerY - aboutScene.pointerY) * damp;
}
