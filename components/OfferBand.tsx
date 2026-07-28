"use client";

import type { Locale } from "@/i18n/config";
import { useQuote } from "@/components/quote/QuoteProvider";
import MagneticButton from "./MagneticButton";

// Drop-in "build your individual offer (with a price)" band. Reused across
// pages to keep the selling CTA everywhere. Opens the global quote modal.
export default function OfferBand({
  lang,
  tone = "pink",
}: {
  lang: Locale;
  tone?: "pink" | "ink" | "creme";
}) {
  const { open } = useQuote();
  const de = lang === "de";

  const styles = {
    pink: { bg: "bg-pink text-creme", sub: "text-creme/85", kick: "text-creme/80", btn: "bg-creme text-ink hover:bg-ink hover:text-creme" },
    ink: { bg: "bg-ink text-creme", sub: "text-creme/70", kick: "text-pink", btn: "bg-pink text-creme hover:bg-creme hover:text-ink" },
    creme: { bg: "bg-creme text-ink", sub: "text-ink/65", kick: "text-pink", btn: "bg-ink text-creme hover:bg-pink" },
  }[tone];

  return (
    <section className={`relative overflow-hidden px-5 py-20 text-center md:py-24 ${styles.bg}`}>
      <div className="relative mx-auto max-w-3xl">
        <p className={`mb-4 font-sans text-[11px] uppercase tracking-[0.4em] ${styles.kick}`}>
          {de ? "Individueller Preis · Unverbindlich" : "Individual price · Non-binding"}
        </p>
        <h2 className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.01em] md:text-5xl">
          {de ? "Stell dir dein Angebot zusammen — mit Preis." : "Build your own offer — with a price."}
        </h2>
        <p className={`mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed md:text-lg ${styles.sub}`}>
          {de
            ? "Firma, Ziel, Wunschleistungen — sag's uns, wir kalkulieren individuell und melden uns in 48 Stunden."
            : "Company, goal, the services you want — tell us and we'll build an individual offer and reply within 48 hours."}
        </p>
        <div className="mt-9">
          <MagneticButton onClick={() => open()} strength={0.5}
            className={`rounded-full px-10 py-4 font-sans text-sm uppercase tracking-[0.14em] transition-colors ${styles.btn}`}>
            {de ? "Angebot zusammenstellen" : "Build my offer"}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
