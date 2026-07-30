import type { Metadata } from "next";
import Link from "next/link";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { OFFICE_EMAIL } from "@/lib/contact";
import { INSTAGRAM, utm } from "@/lib/social";

// Impressum — legally required (ECG/MedienG), Bandita-styled. Static & fast.
// Sole proprietor disclosure: name, address, contact, line of business.

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "Impressum — Bandita",
  robots: { index: false, follow: true },
};

const OWNER = "Pia-Alice Stelzl";
const ADDRESS = ["Königseggasse 5/6", "1060 Wien", "Österreich"];

const T = {
  de: {
    kicker: "Rechtliches · Wien",
    title: "Impressum.",
    sub: "Boring doesn't sell. Aber Pflicht ist Pflicht — hier, in schön.",
    cards: [
      {
        h: "Medieninhaberin & Herausgeberin",
        lines: [OWNER, ...ADDRESS],
      },
      {
        h: "Kontakt",
        lines: [],
        contact: true,
      },
      {
        h: "Unternehmensgegenstand",
        lines: ["Kreativ- & Marketingdienstleistungen — von Markenstrategie über Content, Film und Web bis KI."],
      },
      {
        h: "Grundlegende Richtung",
        lines: ["Diese Website informiert über die Leistungen von Bandita — und beweist nebenbei, dass Marketing nicht langweilig sein muss."],
      },
      {
        h: "Urheberrecht",
        lines: [
          "Alle Inhalte dieser Website (Texte, Fotos, Filme, Design, Code) sind urheberrechtlich geschützt. Jede Verwertung ohne schriftliche Zustimmung ist unzulässig.",
          "Kurz: Alles hier ist handgemacht. Wer klaut, bekommt Post — erst nett, dann weniger nett.",
        ],
      },
      {
        h: "Haftung für Links",
        lines: ["Für Inhalte externer Links übernehmen wir keine Haftung — dort gilt, was die jeweiligen Betreiber verantworten. Wenn dir auf einem verlinkten Kanal etwas komisch vorkommt: sag uns Bescheid."],
      },
    ],
    closing: "Fragen zum Rechtlichen? Schreib uns — wir beißen nicht.",
    privacy: "Zur Datenschutzerklärung",
  },
  en: {
    kicker: "Legal · Vienna",
    title: "Legal Notice.",
    sub: "Boring doesn't sell. But the law is the law — so here it is, in style.",
    cards: [
      {
        h: "Media owner & publisher",
        lines: [OWNER, ...ADDRESS],
      },
      {
        h: "Contact",
        lines: [],
        contact: true,
      },
      {
        h: "Line of business",
        lines: ["Creative & marketing services — from brand strategy to content, film, web and AI."],
      },
      {
        h: "Editorial policy",
        lines: ["This website presents the services of Bandita — and proves, in passing, that marketing doesn't have to be boring."],
      },
      {
        h: "Copyright",
        lines: [
          "All content on this website (copy, photography, film, design, code) is protected by copyright. Any use without written consent is prohibited.",
          "In short: everything here is handmade. Steal it and you'll get mail — friendly first, then less so.",
        ],
      },
      {
        h: "Liability for links",
        lines: ["We accept no liability for external links — their operators are responsible for their content. If something on a linked channel seems off, let us know."],
      },
    ],
    closing: "Questions about the legal stuff? Write to us — we don't bite.",
    privacy: "Privacy policy",
  },
};

export default function ImpressumPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const t = T[lang];
  return (
    <div className="relative overflow-hidden bg-creme px-5 pb-28 pt-36 text-ink md:px-10 md:pb-36">
      {/* quiet pink glow, static — no scroll cost */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(45% 35% at 75% 8%, rgba(251,0,63,0.10), transparent 70%)" }} />
      {/* oversized watermark */}
      <span aria-hidden className="pointer-events-none absolute -right-10 top-24 select-none font-display text-[26vw] font-medium leading-none text-ink/[0.035]">
        §
      </span>

      <div className="relative mx-auto max-w-[1100px]">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{t.kicker}</p>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-[-0.02em] md:text-7xl">{t.title}</h1>
        <p className="mt-4 max-w-xl font-display text-xl italic text-ink/60 md:text-2xl">{t.sub}</p>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {t.cards.map((c) => (
            <section key={c.h}
              className="rounded-3xl border border-ink/10 bg-white/40 p-7 backdrop-blur-[2px] transition-colors hover:border-pink/40 md:p-8">
              <h2 className="flex items-center gap-2.5 font-display text-2xl font-medium tracking-[-0.01em]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink" />
                {c.h}
              </h2>
              {"contact" in c && c.contact ? (
                <div className="mt-4 space-y-2 font-sans text-[15px] leading-relaxed text-ink/75">
                  <p>
                    <a href={`mailto:${OFFICE_EMAIL}`} className="underline decoration-pink/40 underline-offset-4 transition-colors hover:text-pink">
                      {OFFICE_EMAIL}
                    </a>
                  </p>
                  <p>
                    <a href={utm(INSTAGRAM.url, "impressum")} target="_blank" rel="noopener"
                      className="underline decoration-pink/40 underline-offset-4 transition-colors hover:text-pink">
                      Instagram: {INSTAGRAM.handle}
                    </a>
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2 font-sans text-[15px] leading-relaxed text-ink/75">
                  {c.lines.map((l, i) => (<p key={i}>{l}</p>))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg italic text-ink/60">{t.closing}</p>
          <Link href={`/${lang}/datenschutz`} data-cursor="link"
            className="group inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-pink transition-colors hover:text-ink">
            {t.privacy} <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
