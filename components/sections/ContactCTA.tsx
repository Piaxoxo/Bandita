"use client";

import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import MagneticButton from "@/components/MagneticButton";
import Chapter from "@/components/editorial/Chapter";
import { useQuote } from "@/components/quote/QuoteProvider";
import { OFFICE_EMAIL } from "@/lib/contact";
import { INSTAGRAM, utm } from "@/lib/social";
import { InstagramIcon } from "@/components/SocialIcons";

export default function ContactCTA({ dict, lang = "de" }: { dict: Dictionary; lang?: Locale }) {
  const { open } = useQuote();
  const de = lang === "de";

  return (
    <section id="contact" className="relative overflow-hidden bg-pink py-32 text-creme md:py-48">
      <div aria-hidden className="motion-only pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35), transparent 70%)" }} />

      <div data-fly className="relative mx-auto max-w-[1400px] px-5 text-center md:px-10">
        <Reveal>
          <Chapter n="06" title={dict.cta.eyebrow} tone="creme" className="mb-14 text-left md:mb-20" />
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
              {de ? "Individuelles Angebot anfordern" : "Request your individual offer"}
            </MagneticButton>

            {/* email + Instagram DM — equal-footing contact channels.
                The three quick-option pills that sat here all opened the same
                builder: three buttons for one action is noise, not choice. */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
              <a href={`mailto:${OFFICE_EMAIL}`} data-cursor="link"
                className="font-sans text-sm lowercase tracking-[0.1em] text-creme/80 underline decoration-creme/30 underline-offset-4 transition-colors hover:text-creme">
                {OFFICE_EMAIL}
              </a>
              <a href={utm(INSTAGRAM.url, "contact")} target="_blank" rel="noopener"
                aria-label={de ? "Bandita per Instagram-DM kontaktieren" : "Contact Bandita via Instagram DM"}
                data-cursor="link"
                className="inline-flex items-center gap-2 font-sans text-sm tracking-[0.04em] text-creme/80 transition-colors hover:text-creme">
                <InstagramIcon className="h-4 w-4" />
                {de ? "Schneller geht's per DM →" : "Faster via DM →"}
              </a>
            </div>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-creme/60">{dict.cta.note}</span>
            {/* The newsletter form lives in the footer (FooterActions) and was
                duplicated here, one screen above itself. */}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
