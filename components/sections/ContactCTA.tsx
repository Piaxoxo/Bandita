"use client";

import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import MagneticButton from "@/components/MagneticButton";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useQuote } from "@/components/quote/QuoteProvider";
import { OFFICE_EMAIL, mailto, type LeadCategory } from "@/lib/contact";

const OPTIONS: Record<Locale, { label: string; category: LeadCategory; subject: string }[]> = {
  de: [
    { label: "Angebot holen", category: "Angebot", subject: "Angebotsanfrage" },
    { label: "Rückruf bitte", category: "Rückruf", subject: "Rückruf-Wunsch" },
    { label: "Einfach Hallo", category: "Kontakt", subject: "Hallo Bandita" },
  ],
  en: [
    { label: "Get a quote", category: "Angebot", subject: "Quote request" },
    { label: "Request a callback", category: "Rückruf", subject: "Callback request" },
    { label: "Just say hi", category: "Kontakt", subject: "Hi Bandita" },
  ],
};

export default function ContactCTA({ dict, lang = "de" }: { dict: Dictionary; lang?: Locale }) {
  const { open } = useQuote();
  const options = OPTIONS[lang] ?? OPTIONS.de;
  const de = lang === "de";

  return (
    <section id="contact" className="relative overflow-hidden bg-pink py-32 text-creme md:py-48">
      <div aria-hidden className="motion-only pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)" }} />

      <div data-fly className="relative mx-auto max-w-[1400px] px-5 text-center md:px-10">
        <Reveal>
          <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.4em] text-creme/70">{dict.cta.eyebrow}</p>
        </Reveal>

        <Parallax speed={-60}>
          <Reveal as="h2" className="mx-auto max-w-5xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-7xl">
            {dict.cta.heading}
          </Reveal>
        </Parallax>

        <Reveal>
          <p className="mx-auto mt-10 max-w-md font-sans text-lg leading-relaxed text-creme/80">{dict.cta.body}</p>
        </Reveal>

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-6">
            {/* primary: build the individual offer */}
            <MagneticButton onClick={() => open()} strength={0.5}
              className="rounded-full bg-creme px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme">
              {de ? "Individuelles Angebot mit Preis" : "Build your offer — with a price"}
            </MagneticButton>

            {/* categorised quick contacts */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {options.map((o) => (
                <a key={o.subject} href={mailto(o.category, o.subject)} data-cursor="link"
                  className="rounded-full border border-creme/40 px-6 py-3 font-sans text-xs uppercase tracking-[0.14em] text-creme/90 transition-colors hover:border-creme hover:bg-creme hover:text-ink">
                  {o.label}
                </a>
              ))}
            </div>

            <a href={`mailto:${OFFICE_EMAIL}`} data-cursor="link"
              className="font-sans text-sm lowercase tracking-[0.1em] text-creme/80 underline decoration-creme/30 underline-offset-4 transition-colors hover:text-creme">
              {OFFICE_EMAIL}
            </a>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-creme/60">{dict.cta.note}</span>

            {/* newsletter */}
            <div className="mt-6 flex flex-col items-center gap-3 border-t border-creme/20 pt-8">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-creme/70">
                {de ? "Oder bleib dran — Newsletter" : "Or stay in the loop — newsletter"}
              </p>
              <NewsletterSignup lang={lang} tone="dark" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
