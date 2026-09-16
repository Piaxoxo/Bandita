"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoad, skipHeavyMedia } from "@/lib/defer";

/*
  Video that only starts downloading once it approaches the viewport AND the
  page has finished loading.

  The poster renders immediately, so the visual is identical from the first
  paint — but the mp4 bytes are never spent on a film the visitor may never
  scroll to. Elements hidden at the current breakpoint (e.g. `hidden lg:block`)
  have no layout box, so the observer never fires and they cost nothing at all.
*/
export default function LazyVideo({
  src,
  poster,
  className = "",
  style,
  rootMargin = "300px 0px",
  ...rest
}: {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  rootMargin?: string;
} & Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster">) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || skipHeavyMedia()) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => afterLoad(() => setReady(true)), []);

  const live = near && ready;

  // once the source is attached, make sure it actually plays
  useEffect(() => {
    const el = ref.current;
    if (live && el) {
      el.muted = true;
      el.play().catch(() => {});
    }
  }, [live]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={ref}
      className={className}
      style={style}
      src={live ? src : undefined}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      {...rest}
    />
  );
}
