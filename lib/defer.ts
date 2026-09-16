// Small scheduling helpers used to keep heavy work (films, WebGL) out of the
// critical path. Everything here is client-only and safe to call during render.

// Visitors on a metered or very slow connection get the poster only — the film
// is decoration, their bandwidth is not.
export function skipHeavyMedia(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!c) return false;
  return Boolean(c.saveData) || c.effectiveType === "slow-2g" || c.effectiveType === "2g";
}

/*
  Run `cb` once the page has finished loading and the main thread is free.
  Returns a disposer, so it can be used straight from a useEffect.

  This is what keeps the 3D world and the background films from competing with
  the first paint: the browser gets to finish layout, fonts and the hero before
  it parses three.js or opens a second video connection.
*/
export function afterLoad(cb: () => void, timeout = 1200): () => void {
  if (typeof window === "undefined") return () => {};
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    const ric = (window as Window & { requestIdleCallback?: typeof requestIdleCallback })
      .requestIdleCallback;
    if (ric) ric(() => !cancelled && cb(), { timeout });
    else window.setTimeout(() => !cancelled && cb(), 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
  };
}
