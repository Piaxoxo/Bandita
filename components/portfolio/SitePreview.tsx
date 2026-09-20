"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/config";

/*
  A real, clickable website inside a browser mock-up.

  Three decisions carry this component:

  1. The frame starts inert (`pointer-events: none`). An active iframe swallows
     wheel events, so a visitor scrolling past would get stuck inside the
     embedded site. One click arms it; Escape or a click outside releases it.

  2. The page is rendered at a full logical viewport and scaled down, instead
     of being squeezed into a narrow box. A 900px-wide frame would otherwise
     trigger the site's own mobile breakpoints — the same site, but not the one
     that was designed. `Mobil` switches to a real phone viewport on purpose,
     because there that layout IS the honest one.

  3. Nothing loads until that click. Embedded sites weigh half a megabyte and
     up; a portfolio visitor scrolling past several projects should not pay for
     all of them. The poster carries the frame until someone actually wants in
     — and it stays behind the iframe, so a site that is slow, moved or down
     degrades to a photograph instead of a white browser error page.
*/

const VIEWPORT = {
  desktop: { w: 1440, h: 900 },
  mobile: { w: 430, h: 880 },
};

const COPY = {
  de: {
    hint: "Klicken zum Reinklicken",
    live: "Du bist drin — Escape zum Verlassen",
    loading: "Website wird geladen …",
    slow: "Die Seite antwortet gerade nicht.",
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
    loading: "Loading the site …",
    slow: "The site isn't responding right now.",
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
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [painted, setPainted] = useState(false);
  const [slow, setSlow] = useState(false);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [full, setFull] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [fit, setFit] = useState({ scale: 1, left: 0, top: 0 });

  // Narrow screens open in the phone viewport — scaling a 1440px desktop
  // layout down to 390px would make it unreadable rather than impressive.
  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 700px)").matches);
  }, []);

  /*
    A cross-origin iframe cannot be inspected, and its `load` event fires even
    for the browser's own error page — so "did it work?" is unanswerable from
    the frame itself. A no-cors probe answers it before we mount anything: the
    opaque response resolves when the host is reachable and rejects when it is
    not. On failure we keep the poster and say so, instead of handing the
    visitor a grey error page inside a Bandita browser mock-up.
  */
  const external = /^https?:\/\//i.test(src);
  useEffect(() => {
    if (!active || !external) return;
    let cancelled = false;
    fetch(src, { mode: "no-cors", cache: "no-store" })
      .then(() => !cancelled && setReachable(true))
      .catch(() => !cancelled && setReachable(false));
    return () => {
      cancelled = true;
    };
  }, [active, external, src]);

  // Slow, but not (yet) known to be broken.
  useEffect(() => {
    if (!active || painted || reachable === false) return;
    const id = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(id);
  }, [active, painted, reachable]);

  // Fit the logical viewport into whatever space the stage has, and centre it.
  const measure = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const v = mobile ? VIEWPORT.mobile : VIEWPORT.desktop;
    const scale = Math.min(box.width / v.w, box.height / v.h);
    setFit({
      scale,
      left: Math.round((box.width - v.w * scale) / 2),
      top: Math.round((box.height - v.h * scale) / 2),
    });
  }, [mobile]);

  useLayoutEffect(() => {
    measure();
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, full]);

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

  const v = mobile ? VIEWPORT.mobile : VIEWPORT.desktop;

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

      {/* The stage. Its aspect ratio fixes the height up front, so nothing
          jumps while the site loads. */}
      <div
        ref={stage}
        className={`relative overflow-hidden bg-black ${full ? "min-h-0 flex-1" : ""}`}
        style={full ? undefined : { aspectRatio: `${VIEWPORT.desktop.w} / ${VIEWPORT.desktop.h}` }}
      >
        {/* Poster sits under everything, for good: until the visitor clicks,
            and afterwards as the floor a slow or unreachable site falls back
            onto instead of a white browser error page. */}
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: active ? 0.3 : 0.45 }}
          />
        )}

        {active && reachable !== false && (
          <div
            className="absolute origin-top-left transition-opacity duration-700"
            style={{
              width: v.w,
              height: v.h,
              left: fit.left,
              top: fit.top,
              transform: `scale(${fit.scale})`,
              opacity: painted ? 1 : 0,
            }}
          >
            <iframe
              src={src}
              title={domain}
              loading="lazy"
              /*
                Scripts yes — these are real sites and most need them. Forms NO:
                a portfolio visitor must never be able to send a live enquiry,
                booking or reservation to the client. Top-level navigation stays
                off too, so an embedded page cannot hijack the portfolio.
              */
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setPainted(true)}
              className="h-full w-full border-0"
            />
          </div>
        )}

        {/* click-to-activate veil — this click both loads and arms the frame */}
        {!active && (
          <button
            onClick={() => setActive(true)}
            data-cursor="link"
            aria-label={t.hint}
            className="group absolute inset-0 flex items-end justify-center pb-8"
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity group-hover:opacity-80" />
            <span
              className="relative flex items-center gap-2.5 rounded-full px-5 py-3 font-sans text-[11px] uppercase tracking-[0.2em] text-black transition-transform duration-500 ease-bandita group-hover:scale-105"
              style={{ background: color }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/70" />
              {t.hint}
            </span>
          </button>
        )}

        {/* loading / unreachable notice */}
        {active && (!painted || reachable === false) && (
          <span className="absolute inset-x-0 bottom-8 flex flex-wrap items-center justify-center gap-3 px-4">
            <span className="rounded-full bg-black/75 px-4 py-2 font-sans text-[10px] uppercase tracking-[0.2em] text-creme/70">
              {reachable === false || slow ? t.slow : t.loading}
            </span>
            {reachable === false && (
              <a
                href={live ?? src}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="rounded-full px-4 py-2 font-sans text-[10px] uppercase tracking-[0.2em] text-black"
                style={{ background: color }}
              >
                {t.open}
              </a>
            )}
          </span>
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
          href={live ?? src}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="ml-auto text-creme/45 underline-offset-4 transition-colors hover:text-creme hover:underline"
        >
          {live ? t.realsite : t.open}
        </a>
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
