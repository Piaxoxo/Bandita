"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Reveal3D from "@/components/anim/Reveal3D";
import { useQuote } from "@/components/quote/QuoteProvider";
import { scrollToId } from "@/lib/scroll";
import { PRICING } from "@/components/services/services-data";
import { PROMO_BADGE } from "@/lib/social";

// The four entry-level packages, surfaced on the homepage WITH prices —
// sourced from the services pricing data so numbers never drift apart.
const STARTER_IDS = ["web-starter", "social-start", "seo-start", "ai-fashion-starter"] as const;

export default function StarterPackages({ lang }: { lang: Locale }) {
  const { open } = useQuote();
  const de = lang === "de";
  const tiers = STARTER_IDS.map((id) => PRICING.tiers.find((t) => t.id === id)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );

  return (
    <section className="relative px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <div className="text-center">
          <Reveal>
            <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
              {de ? "Starter-Pakete" : "Starter packages"}
            </p>
          </Reveal>
          <Reveal as="h2" className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">
            {de ? "Kein „Preis auf Anfrage“. Wir sind nicht so." : "No “price on request”. Not our style."}
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-4 max-w-xl font-sans text-base text-ink/60 md:text-lg">
              {de ? "Vier ehrliche Einstiege. Der Rest wird sowieso individuell." : "Four honest entry points. Everything else is custom anyway."}
            </p>
          </Reveal>
        </div>

        <Reveal3D className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
          {tiers.map((t) => (
            <div key={t.id}
              className="group flex flex-col rounded-3xl border border-ink/10 bg-creme p-7 transition-all duration-300 hover:-translate-y-1 hover:border-pink hover:shadow-[0_24px_50px_-28px_rgba(20,12,18,0.3)]">
              <h3 className="font-display text-2xl font-medium tracking-[-0.01em]">{t.name}</h3>
              <p className="mt-1 font-sans text-sm text-ink/55">{t.tagline[lang]}</p>
              <p className="mt-4 font-display text-3xl font-medium text-ink">{t.price}</p>
              <ul className="mt-4 flex-1 space-y-1.5 font-sans text-[13px] text-ink/70">
                {t.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-pink" />{f}
                  </li>
                ))}
              </ul>
              {/* Bandit-Letter promo line → scrolls to the footer form */}
              <button onClick={() => scrollToId("newsletter")} data-cursor="link"
                className="mt-4 text-left font-sans text-[11px] leading-snug text-pink underline decoration-pink/30 underline-offset-2 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pink/60">
                {PROMO_BADGE[lang]}
              </button>
              <div className="mt-4 flex gap-2">
                <Link href={`/${lang}/services#preise`} data-cursor="link"
                  className="flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-center font-sans text-[11px] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-pink hover:text-pink">
                  {de ? "Details" : "Details"}
                </Link>
                <button onClick={() => open()} data-cursor="hover"
                  className="flex-1 rounded-full bg-ink px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] text-creme transition-colors hover:bg-pink">
                  {de ? "Anfragen" : "Request"}
                </button>
              </div>
            </div>
          ))}
        </Reveal3D>
      </div>
    </section>
  );
}
