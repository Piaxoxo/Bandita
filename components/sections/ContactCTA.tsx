"use client";

import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import MagneticButton from "@/components/MagneticButton";

const EMAIL = "agencybandita@gmail.com"; // where mail is actually delivered
const DISPLAY_EMAIL = "office@bandita.agency"; // shown on the site (forwards to EMAIL)
const OPTIONS: Record<Locale, { label: string; subject: string }[]> = {
  de: [
    { label: "Projekt anfragen", subject: "Projektanfrage" },
    { label: "Angebot holen", subject: "Angebotsanfrage" },
    { label: "Rückruf bitte", subject: "Rückruf-Wunsch" },
    { label: "Einfach Hallo", subject: "Hallo Bandita" },
  ],
  en: [
    { label: "Start a project", subject: "Project enquiry" },
    { label: "Get a quote", subject: "Quote request" },
    { label: "Request a callback", subject: "Callback request" },
    { label: "Just say hi", subject: "Hi Bandita" },
  ],
};

export default function ContactCTA({ dict, lang = "de" }: { dict: Dictionary; lang?: Locale }) {
  const options = OPTIONS[lang] ?? OPTIONS.de;
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-pink py-32 text-creme md:py-48"
    >
      {/* subtle moving sheen */}
      <div
        aria-hidden
        className="motion-only pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)",
        }}
      />

      <div data-fly className="relative mx-auto max-w-[1400px] px-5 text-center md:px-10">
        <Reveal>
          <p className="mb-8 font-sans text-[11px] uppercase tracking-[0.4em] text-creme/70">
            {dict.cta.eyebrow}
          </p>
        </Reveal>

        <Parallax speed={-60}>
          <Reveal
            as="h2"
            className="mx-auto max-w-5xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-7xl"
          >
            {dict.cta.heading}
          </Reveal>
        </Parallax>

        <Reveal>
          <p className="mx-auto mt-10 max-w-md font-sans text-lg leading-relaxed text-creme/80">
            {dict.cta.body}
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-6">
            <MagneticButton
              as="a"
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(options[0].subject)}`}
              strength={0.5}
              className="rounded-full bg-creme px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme"
            >
              {dict.cta.button}
            </MagneticButton>

            {/* more ways to reach us — all land in the same inbox */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {options.slice(1).map((o) => (
                <a
                  key={o.subject}
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(o.subject)}`}
                  data-cursor="link"
                  className="rounded-full border border-creme/40 px-6 py-3 font-sans text-xs uppercase tracking-[0.14em] text-creme/90 transition-colors hover:border-creme hover:bg-creme hover:text-ink"
                >
                  {o.label}
                </a>
              ))}
            </div>

            <a
              href={`mailto:${EMAIL}`}
              data-cursor="link"
              className="font-sans text-sm lowercase tracking-[0.1em] text-creme/80 underline decoration-creme/30 underline-offset-4 transition-colors hover:text-creme"
            >
              {DISPLAY_EMAIL}
            </a>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-creme/60">
              {dict.cta.note}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
