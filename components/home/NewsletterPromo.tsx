"use client";

import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import NewsletterSignup from "@/components/NewsletterSignup";
import { PROMO_BONUS } from "@/lib/social";

// "Der Bandit Letter" promo block. No popup, no exit-intent — an offer, not a beg.
export default function NewsletterPromo({ lang }: { lang: Locale }) {
  const de = lang === "de";
  return (
    <section id="bandit-letter" className="relative scroll-mt-28 overflow-hidden bg-ink px-5 py-24 text-creme md:px-10 md:py-32" aria-labelledby="nl-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 60% at 80% 30%, rgba(251,0,63,0.2), transparent 70%)" }} />
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">Newsletter</p>
          </Reveal>
          <Reveal as="h2" id="nl-heading" className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">
            {de ? "Der Bandit Letter." : "The Bandit Letter."}
          </Reveal>
          <Reveal>
            <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-creme/75 md:text-lg">
              {de
                ? <>Einmal im Monat: was in Marketing gerade wirklich funktioniert. Als Dankeschön: <span className="text-pink">{PROMO_BONUS.de}</span></>
                : <>Once a month: what actually works in marketing right now. As a thank-you: <span className="text-pink">{PROMO_BONUS.en}</span></>}
            </p>
          </Reveal>
        </div>
        <Reveal className="lg:justify-self-end">
          <NewsletterSignup lang={lang} tone="dark" />
        </Reveal>
      </div>
    </section>
  );
}
