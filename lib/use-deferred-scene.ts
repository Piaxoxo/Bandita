"use client";

import { useEffect, useState } from "react";
import { useSite } from "./site-context";
import { afterLoad } from "./defer";

/*
  When a page is allowed to start paying for its 3D.

  Every WebGL surface on the site is behind `next/dynamic`, so three.js is
  already its own chunk. That splits the *download* but not the *timing*: a
  dynamic component still fetches, parses and compiles as soon as it mounts,
  which used to be the moment hydration finished — i.e. while the intro was
  still animating and the visitor's first tap was still landing nowhere.
  Measured on a throttled phone, the main thread was blocked for over four
  seconds on the homepage, and three.js was the largest single contributor.

  Two gates, in order:

    1. the intro has finished — nothing may compete with it, since it is the
       only thing on screen and jank there is the first impression;
    2. the page has loaded and the main thread is idle (`afterLoad`).

  Every scene has a CSS gradient or static fallback underneath, so the delay
  costs nothing visually: the backdrop is already correct when the canvas
  fades in over it.
*/
export function useDeferredScene(enabled = true): boolean {
  const { introDone } = useSite();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !introDone) return;
    return afterLoad(() => setReady(true));
  }, [enabled, introDone]);

  return ready && enabled;
}
