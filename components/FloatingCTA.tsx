"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { useQuote } from "@/components/quote/QuoteProvider";

// Ever-present "request an offer" pill. Appears once the visitor starts
// scrolling and stays reachable on every page (above the sound control).
export default function FloatingCTA({ lang }: { lang: Locale }) {
  const { open } = useQuote();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => open()}
      data-cursor="hover"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-20 right-6 z-[60] flex items-center gap-2 rounded-full bg-pink px-5 py-3.5 font-sans text-xs uppercase tracking-[0.14em] text-creme shadow-[0_16px_40px_-12px_rgba(251,0,63,0.55)] transition-all duration-500 ease-bandita hover:bg-ink md:bottom-24 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-creme opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-creme" />
      </span>
      {lang === "de" ? "Angebot anfordern" : "Request an offer"}
    </button>
  );
}
