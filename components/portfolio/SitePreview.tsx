"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/config";

/*
  A real, clickable website inside a browser mock-up.

  Three decisions carry this component:

  1. The site shows itself straight away — no splash, no play button. It loads
     as the frame comes into range, so by the time you reach it, it is simply
     there. But it stays INERT until you click it: an armed iframe swallows
     wheel events, and a visitor scrolling past would get stuck inside it. The
     click only hands over the pointer. Escape, or a click outside, gives it
     back.

  2. The page is rendered at a full logical viewport and scaled down, instead
     of being squeezed into a narrow box. A 900px-wide frame would otherwise
     trigger the site's own mobile breakpoints — the same site, but not the one
     that was designed. `Mobil` switches to a real phone viewport on purpose,
     because there that layout IS the honest one.

  3. The poster stays mounted underneath the iframe, so a site that is slow,
     moved or offline degrades to a photograph rather than a white browser
     error page.
*/

const VIEWPORT = {
  desktop: { w: 1440, h: 900 },
  mobile: { w: 430, h: 880 },
};

const COPY = {
  de: {
    hint: "Klicken zum Bedienen",
    live: "Du bist drin — Escape zum Verlassen",
    loading: "Website wird geladen …",
    slow: "Die Seite antwortet gerade nicht.",
    exit: "Verlassen",
    full: "Vollbild",
    close: "Schließen",
    desktop: "Desktop",
    mobile: "Mobil",
    open: "In neuem Tab öffnen",
  },
  en: {
    hint: "Click to interact",
    live: "You're inside — press Escape to leave",
    loading: "Loading the site …",
    slow: "The site isn't responding right now.",
    exit: "Leave",
    full: "Fullscreen",
    close: "Close",
    desktop: "Desktop",
    mobile: "Mobile",
    open: "Open in a new tab",
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
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(false);
  const [painted, setPainted] = useState(false);
  const [slow, setSlow] = useState(false);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [nativeFull, setNativeFull] = useState(false);
  const [overlayFull, setOverlayFull] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [touch, setTouch] = useState(false);
  const [fit, setFit] = useState({
    w: VIEWPORT.desktop.w,
    h: VIEWPORT.desktop.h,
    scale: 1,
    left: 0,
    top: 0,
  });
  const full = nativeFull || overlayFull;

  // Narrow screens open in the phone viewport — scaling a 1440px desktop
  // layout down to 390px would make it unreadable rather than impressive.
  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 700px)").matches);
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  /*
    Real browser fullscreen, not an overlay, wherever it exists.

    The overlay version had to re-mount the frame into a portal, which reloads
    the embedded site and throws away wherever the visitor had scrolled to.
    A fullscreen element is promoted to the browser's top layer instead: same
    DOM node, nothing reloads, and it escapes the transformed ancestor that
    made a plain `position: fixed` stack below the site nav. iOS Safari has no
    element fullscreen, so the overlay stays as the fallback.
  */
  const enterFull = useCallback(async () => {
    const el = wrap.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    }) | null;
    if (!el) return;
    const request = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    if (request) {
      try {
        await request();
        return;
      } catch {
        /* fall through to the overlay */
      }
    }
    setOverlayFull(true);
  }, []);

  const exitFull = useCallback(async () => {
    const d = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (d.fullscreenElement || (d as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
      try {
        await (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.());
      } catch {
        /* ignore — the state listener below keeps us honest either way */
      }
    }
    setOverlayFull(false);
  }, []);

  // The browser can leave fullscreen without us (Escape, F11, gestures), so the
  // element is the source of truth, never our own click handler.
  useEffect(() => {
    const sync = () => {
      const d = document as Document & { webkitFullscreenElement?: Element };
      setNativeFull(!!wrap.current && (d.fullscreenElement === wrap.current || d.webkitFullscreenElement === wrap.current));
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  /*
    Fullscreen means "I want to use this". Waiting for a second click there was
    the main reason the frame felt dead — and the scroll-trap that click guards
    against cannot happen in fullscreen, because there is no page behind to
    scroll. Arm on the way in, disarm on the way out.
  */
  useEffect(() => {
    setActive(full);
  }, [full]);

  /*
    In fullscreen, hand the keyboard over too: otherwise the frame is armed but
    unfocused, and arrow keys, Page Down and Space scroll the portfolio hidden
    behind it instead of the site filling the screen — which reads as the keys
    being broken.

    Only in fullscreen. In the page, focus stays with the parent so Escape can
    still release the frame; a cross-origin iframe swallows key events entirely
    once focused, and there the natural way out is a click anywhere outside.
  */
  useEffect(() => {
    if (!full) return;
    const id = window.setTimeout(() => frameRef.current?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(id);
  }, [full]);

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
    if (!shown || !external) return;
    let cancelled = false;
    fetch(src, { mode: "no-cors", cache: "no-store" })
      .then(() => !cancelled && setReachable(true))
      .catch(() => !cancelled && setReachable(false));
    return () => {
      cancelled = true;
    };
  }, [shown, external, src]);

  // Slow, but not (yet) known to be broken.
  useEffect(() => {
    if (!shown || painted || reachable === false) return;
    const id = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(id);
  }, [shown, painted, reachable]);

  /*
    Load as the frame comes into range. Only one project chapter is open at a
    time, so this is a single site — but starting it early still keeps it out
    of the way of the chapter's own entrance animation.
  */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /*
    Fit the logical viewport into whatever space the stage has, and centre it.

    In desktop mode the logical HEIGHT follows the stage's own proportions at a
    fixed 1440px width: a desktop browser window is whatever shape the screen
    is, so letterboxing one inside a fullscreen frame would be wrong as well as
    wasteful. Phone mode keeps its fixed 430x880 — a phone has a shape, and
    stretching it would be a lie about the layout.
  */
  const measure = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const v = mobile
      ? VIEWPORT.mobile
      : {
          w: VIEWPORT.desktop.w,
          h: Math.round(
            Math.min(
              1600,
              Math.max(720, (VIEWPORT.desktop.w * box.height) / box.width),
            ),
          ),
        };
    const scale = Math.min(box.width / v.w, box.height / v.h);
    setFit({
      w: v.w,
      h: v.h,
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

  /*
    One Escape, one exit. The old version disarmed first and closed fullscreen
    on a second press, which read as "the key didn't work". In fullscreen,
    Escape always means leave fullscreen; in the page, it means release the
    frame. Native fullscreen handles its own Escape, so we only step in for the
    overlay fallback.
  */
  useEffect(() => {
    if (!active && !full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (full) {
        // Browsers exit native fullscreen on Escape by themselves; this is the
        // belt for the overlay fallback and for anything that does not.
        e.preventDefault();
        exitFull();
      } else {
        setActive(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, full, exitFull]);

  // Clicking outside releases the frame — but in fullscreen the only "outside"
  // is the backdrop, and clicking that should close fullscreen, not leave a
  // dead frame filling the screen.
  useEffect(() => {
    if (!active || nativeFull) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current?.contains(e.target as Node)) return;
      if (overlayFull) setOverlayFull(false);
      else setActive(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [active, overlayFull, nativeFull]);

  // Only the overlay needs the page locked; native fullscreen already covers it.
  useEffect(() => {
    document.body.style.overflow = overlayFull ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayFull]);

  const frame = (
    <div
      ref={wrap}
      className={`relative flex flex-col overflow-hidden ${
        full ? "h-full w-full rounded-none" : "rounded-[1.1rem] ring-1 ring-creme/10"
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

        {/* In fullscreen this is the visible way out — a visitor whose focus
            has wandered into the embedded site needs to see it, not hunt. */}
        <button
          onClick={() => (full ? exitFull() : enterFull())}
          data-cursor="link"
          className={`ml-1 rounded-sm px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.14em] transition-colors ${
            full ? "text-black" : "text-creme/40 hover:text-creme"
          }`}
          style={full ? { background: color } : undefined}
        >
          {full ? `${t.close} ⎋` : t.full}
        </button>
      </div>

      {/* The stage. Its aspect ratio fixes the height up front, so nothing
          jumps while the site loads. */}
      <div
        ref={stage}
        className={`relative overflow-hidden bg-black ${full ? "min-h-0 flex-1" : ""}`}
        style={full ? undefined : { aspectRatio: `${VIEWPORT.desktop.w} / ${VIEWPORT.desktop.h}` }}
      >
        {/* Poster sits under everything, for good: it covers the moment before
            the site paints, and stays as the floor a slow or unreachable site
            falls back onto instead of a white browser error page. */}
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: painted ? 0.25 : 0.5 }}
          />
        )}

        {shown && reachable !== false && (
          <div
            className="absolute origin-top-left transition-opacity duration-700"
            style={{
              width: fit.w,
              height: fit.h,
              left: fit.left,
              top: fit.top,
              transform: `scale(${fit.scale})`,
              opacity: painted ? 1 : 0,
            }}
          >
            <iframe
              ref={frameRef}
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
              // The catcher above already intercepts clicks, but the guarantee
              // that a scroll can never be swallowed belongs on the iframe.
              style={{ pointerEvents: active ? "auto" : "none" }}
            />
          </div>
        )}

        {/*
          Transparent catcher over the site. It hands the pointer to the iframe
          on click, and nothing else — no veil, no splash, the site is visible
          underneath the whole time. Wheel events pass straight through a plain
          div, which is exactly why the iframe itself must stay inert until
          this is gone.
        */}
        {!active && (
          <button
            onClick={() => setActive(true)}
            data-cursor="link"
            aria-label={t.hint}
            className="group absolute inset-0 flex items-end justify-end p-4"
          >
            {/* Touch devices never hover, so there the chip is simply always
                on — otherwise the frame looks like a screenshot. */}
            <span
              className={`flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-2 font-sans text-[10px] uppercase tracking-[0.18em] text-creme/70 transition-opacity duration-300 group-focus-visible:opacity-100 ${
                touch ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              style={{ boxShadow: `inset 0 0 0 1px ${color}55` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              {t.hint}
            </span>
          </button>
        )}

        {/* loading / unreachable notice */}
        {shown && (!painted || reachable === false) && (
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
            onClick={() => (full ? exitFull() : setActive(false))}
            data-cursor="link"
            className="text-creme/45 underline-offset-4 transition-colors hover:text-creme hover:underline"
          >
            {t.exit}
          </button>
        )}
        <span className="ml-auto text-creme/25">{domain}</span>
      </div>
    </div>
  );

  // Native fullscreen keeps the frame exactly where it is — the browser lifts
  // the same node into its top layer, so nothing unmounts and the site keeps
  // its scroll position.
  if (!overlayFull) return frame;

  /*
    Overlay fallback (iOS Safari has no element fullscreen). Portalled to
    <body>: the portfolio chapter sits inside a transformed container, and a
    transform creates a containing block — a `position: fixed` child would be
    trapped inside it and stack *below* the site nav.
  */
  return createPortal(
    <div className="fixed inset-0 z-[90] bg-black/95 p-3 md:p-8">{frame}</div>,
    document.body,
  );
}
