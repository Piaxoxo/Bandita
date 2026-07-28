"use client";

import type { Locale } from "@/i18n/config";
import { useQuote } from "@/components/quote/QuoteProvider";
import NewsletterSignup from "./NewsletterSignup";
import { OFFICE_EMAIL, mailto } from "@/lib/contact";

// Site-wide footer conversion block: newsletter + offer + project + email.
export default function FooterActions({ lang }: { lang: Locale }) {
  const { open } = useQuote();
  const de = lang === "de";
  return (
    <div className="grid gap-12 border-b border-creme/15 pb-14 md:grid-cols-2">
      {/* newsletter */}
      <div>
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
          {de ? "Newsletter" : "Newsletter"}
        </p>
        <h3 className="mt-3 max-w-sm font-display text-2xl font-medium leading-snug md:text-3xl">
          {de ? "Kein Spam. Nur Ideen, die verkaufen." : "No spam. Just ideas that sell."}
        </h3>
        <div className="mt-6">
          <NewsletterSignup lang={lang} tone="dark" />
        </div>
      </div>

      {/* offer + project + email */}
      <div className="md:text-right">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
          {de ? "Bereit loszulegen?" : "Ready to start?"}
        </p>
        <h3 className="mt-3 font-display text-2xl font-medium leading-snug md:text-3xl">
          {de ? "Hol dir dein individuelles Angebot." : "Get your individual offer."}
        </h3>
        <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
          <button onClick={() => open()} data-cursor="hover"
            className="rounded-full bg-pink px-7 py-3.5 font-sans text-xs uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink">
            {de ? "Angebot anfordern" : "Request an offer"}
          </button>
          <a href={mailto("Projekt", de ? "Projektanfrage" : "Project enquiry")} data-cursor="link"
            className="rounded-full border border-creme/30 px-7 py-3.5 font-sans text-xs uppercase tracking-[0.14em] text-creme transition-colors hover:border-creme hover:bg-creme hover:text-ink">
            {de ? "Projekt anfragen" : "Start a project"}
          </a>
        </div>
        <a href={`mailto:${OFFICE_EMAIL}`} data-cursor="link"
          className="mt-5 inline-block font-sans text-sm lowercase tracking-[0.06em] text-creme/70 underline decoration-creme/30 underline-offset-4 transition-colors hover:text-pink">
          {OFFICE_EMAIL}
        </a>
      </div>
    </div>
  );
}
