"use client";

import type { Locale } from "@/i18n/config";
import { useQuote } from "@/components/quote/QuoteProvider";
import NewsletterSignup from "./NewsletterSignup";
import { OFFICE_EMAIL } from "@/lib/contact";
import { SOCIAL_LINKS, utm } from "@/lib/social";
import { SOCIAL_ICONS } from "./SocialIcons";

// Site-wide footer conversion block: Bandit Letter + offer + socials + email.
export default function FooterActions({ lang }: { lang: Locale }) {
  const { open } = useQuote();
  const de = lang === "de";
  return (
    <div id="newsletter" className="grid scroll-mt-28 gap-12 border-b border-creme/15 pb-14 md:grid-cols-2">
      {/* Bandit Letter */}
      <div>
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
          {de ? "Der Bandit Letter" : "The Bandit Letter"}
        </p>
        <h3 className="mt-3 max-w-sm font-display text-2xl font-medium leading-snug md:text-3xl">
          {de ? "Einmal im Monat. Kein Blabla." : "Once a month. No blabla."}
        </h3>
        <div className="mt-6">
          <NewsletterSignup lang={lang} tone="dark" />
        </div>
      </div>

      {/* offer + socials + email */}
      <div className="md:text-right">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
          {de ? "Bereit loszulegen?" : "Ready to start?"}
        </p>
        <h3 className="mt-3 font-display text-2xl font-medium leading-snug md:text-3xl">
          {de ? "Hol dir dein individuelles Angebot." : "Get your individual offer."}
        </h3>
        <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
          <button onClick={() => open()} data-cursor="hover"
            className="rounded-full bg-pink px-7 py-3.5 font-sans text-xs uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink focus-visible:ring-2 focus-visible:ring-pink/60">
            {de ? "Angebot anfordern" : "Request an offer"}
          </button>
          <button onClick={() => open()} data-cursor="link"
            className="rounded-full border border-creme/30 px-7 py-3.5 font-sans text-xs uppercase tracking-[0.14em] text-creme transition-colors hover:border-creme hover:bg-creme hover:text-ink focus-visible:ring-2 focus-visible:ring-pink/60">
            {de ? "Projekt anfragen" : "Start a project"}
          </button>
        </div>

        {/* social icons — platform-coloured glow on hover */}
        <ul className="mt-7 flex gap-3 md:justify-end" aria-label={de ? "Bandita auf Social Media" : "Bandita on social media"}>
          {SOCIAL_LINKS.map((s) => {
            const Icon = SOCIAL_ICONS[s.key];
            return (
              <li key={s.key}>
                <a
                  href={utm(s.url, "footer")}
                  target="_blank" rel="noopener"
                  aria-label={`Bandita ${lang === "de" ? "auf" : "on"} ${s.name}`}
                  data-cursor="link"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-creme/20 text-creme/70 transition-all duration-300 hover:scale-110 hover:border-transparent focus-visible:ring-2 focus-visible:ring-pink/60"
                  style={{ "--glow": s.color } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = s.color;
                    e.currentTarget.style.boxShadow = `0 0 24px -4px ${s.color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            );
          })}
        </ul>

        <a href={`mailto:${OFFICE_EMAIL}`} data-cursor="link"
          className="mt-5 inline-block font-sans text-sm lowercase tracking-[0.06em] text-creme/70 underline decoration-creme/30 underline-offset-4 transition-colors hover:text-pink">
          {OFFICE_EMAIL}
        </a>
      </div>
    </div>
  );
}
