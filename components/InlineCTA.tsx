"use client";

import type { Locale } from "@/i18n/config";
import { useQuote } from "@/components/quote/QuoteProvider";
import Reveal from "@/components/anim/Reveal";

// Compact conversion row to drop between sections: one selling line + button.
// Opens the global offer builder (optionally pre-selecting a service).
export default function InlineCTA({
  lang,
  de,
  en,
  buttonDe,
  buttonEn,
  prefill,
  dark = false,
}: {
  lang: Locale;
  de: string;
  en: string;
  buttonDe?: string;
  buttonEn?: string;
  prefill?: string;
  dark?: boolean;
}) {
  const { open } = useQuote();
  const isDe = lang === "de";
  return (
    <div className="relative px-5 py-14 md:py-16">
      <Reveal className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className={`font-display text-2xl font-medium italic leading-snug md:text-3xl ${dark ? "text-creme/90" : "text-ink/85"}`}>
          {isDe ? de : en}
        </p>
        <button
          onClick={() => open(prefill)}
          data-cursor="hover"
          className={`shrink-0 whitespace-nowrap rounded-full px-8 py-4 font-sans text-xs uppercase tracking-[0.14em] transition-colors ${
            dark ? "bg-creme text-ink hover:bg-pink hover:text-creme" : "bg-pink text-creme hover:bg-ink"
          }`}
        >
          {isDe ? buttonDe ?? "Angebot anfordern" : buttonEn ?? "Request an offer"}
        </button>
      </Reveal>
    </div>
  );
}
