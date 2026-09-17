"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/config";
import { afterLoad } from "@/lib/defer";

/*
  A real, clickable copy of a website inside a browser mock-up.

  Two things make this behave instead of fighting the page:

  1. The frame starts inert (`pointer-events: none`). An active iframe swallows
     wheel events, so a visitor scrolling past would get stuck inside the
     embedded site. One click arms it; Escape or a click outside releases it.
  2. The iframe's `src` is attached only once the frame is near the viewport and
     the page has finished loading — same rule as the films elsewhere on the
     site. Until then it is a poster image, so nothing pops in.
*/

const COPY = {
  de: {
    hint: "Klicken zum Reinklicken",
    live: "Du bist drin — Escape zum Verlassen",
    exit: "Verlassen",
    full: "Vollbild",
    close: "Schließen",
    desktop: "Desktop",
    mobile: "Mobil",
    open: "In neuem Tab öffnen",
    realsite: "Echte Seite ansehen",
  },
  en: {
    hint: "Click to step inside",
    live: "You're inside — press Escape to leave",
    exit: "Leave",
    full: "Fullscreen",
    close: "Close",
    desktop: "Desktop",
    mobile: "Mobile",
    open: "Open in a new tab",
    realsite: "View the real site",
  },
};

export default function SitePreview({
  src,
  domain,
  live,
  poster,
  color,
  lang,
}: {
  src: string;
  domain: string;
  live?: string;
  poster?: string;
  color: string;
  lang: Locale;
}) {
  const t = COPY[lang] ?? COPY.de;
  const wrap = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [full, setFull] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => afterLoad(() => setReady(true)), []);

  // Escape leaves the frame, then closes fullscreen.
  useEffect(() => {
    if (!active && !full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (active) setActive(false);
      else setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, full]);

  // Clicking anywhere outside the frame releases it again.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setActive(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = full ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [full]);

  const loaded = near && ready;

  const frame = (
    <div
      ref={wrap}
      className={`relative flex flex-col overflow-hidden rounded-[1.1rem] ring-1 ring-creme/10 ${
        full ? "h-full w-full" : ""
      }`}
      style={{ background: "#0a0a0a" }}
    >
      {/* browser chrome */}
      <div className="flex shrink-0 items-center gap-2 border-b border-creme/10 bg-[#141414] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-creme/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-creme/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-creme/20" />
        <span className="ml-3 flex-1 truncate rounded-sm border border-creme/10 bg-black/60 px-3 py-1.5 font-sans text-[11px] text-creme/45">
          https://<span style={{ color }}>{domain}</span>
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {([false, true] as const).map((m) => (
            <button
              key={String(m)}
              onClick={() => setMobile(m)}
              data-cursor="link"
              className={`rounded-sm px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.14em] transition-colors ${
                mobile === m ? "bg-creme/15 text-creme" : "text-creme/40 hover:text-creme/70"
              }`}
            >
              {m ? t.mobile : t.desktop}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFull((f) => !f)}
          data-cursor="link"
          className="ml-1 rounded-sm px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.14em] text-creme/40 transition-colors hover:text-creme"
        >
          {full ? t.close : t.full}
        </button>
      </div>

      {/* the page itself */}
      <div
        className={`relative bg-black ${
          full ? "min-h-0 flex-1" : "h-[62vh] min-h-[420px] md:h-[76vh]"
        }`}
      >
        <div
          className={`mx-auto h-full transition-[max-width] duration-500 ease-bandita ${
            mobile ? "max-w-[400px] border-x border-creme/10" : "max-w-none"
          }`}
        >
          {loaded ? (
            <iframe
              src={src}
              title={domain}
              loading="lazy"
              // The copy is ours, but it is still a separate document: keep it
              // sandboxed to scripts only — no forms, no top-level navigation.
              sandbox="allow-scripts allow-same-origin"
              className="h-full w-full border-0"
              style={{ pointerEvents: active ? "auto" : "none" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              aria-hidden
              className="h-full w-full object-cover object-top opacity-70"
            />
          )}
        </div>

        {/* click-to-activate veil */}
        {!active && (
          <button
            onClick={() => setActive(true)}
            data-cursor="link"
            aria-label={t.hint}
            className="group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-transparent to-transparent pb-8 transition-colors hover:from-black/50"
          >
            <span
              className="flex items-center gap-2.5 rounded-full px-5 py-3 font-sans text-[11px] uppercase tracking-[0.2em] text-black transition-transform duration-500 ease-bandita group-hover:scale-105"
              style={{ background: color }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/70" />
              {t.hint}
            </span>
          </button>
        )}
      </div>

      {/* state line */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-creme/10 px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em]">
        <span className={active ? "" : "text-creme/35"} style={active ? { color } : undefined}>
          {active ? t.live : t.hint}
        </span>
        {active && (
          <button
            onClick={() => setActive(false)}
            data-cursor="link"
            className="text-creme/45 underline-offset-4 transition-colors hover:text-creme hover:underline"
          >
            {t.exit}
          </button>
        )}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="ml-auto text-creme/45 underline-offset-4 transition-colors hover:text-creme hover:underline"
        >
          {t.open}
        </a>
        {live && (
          <a
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            className="underline-offset-4 transition-opacity hover:underline hover:opacity-80"
            style={{ color }}
          >
            {t.realsite}
          </a>
        )}
      </div>
    </div>
  );

  if (!full) return frame;

  /*
    Portalled to <body> on purpose. The portfolio chapter sits inside a
    transformed container, and a transform creates a containing block — a
    `position: fixed` child would be trapped inside it and stack *below* the
    site nav instead of covering the viewport.
  */
  return createPortal(
    <div className="fixed inset-0 z-[90] bg-black/95 p-3 md:p-8">{frame}</div>,
    document.body,
  );
}
