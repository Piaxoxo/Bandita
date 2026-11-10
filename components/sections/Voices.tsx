"use client";

import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Chapter from "@/components/editorial/Chapter";
import { REVIEWS, REVIEW_SUMMARY } from "@/lib/reviews";
import { SOCIAL_LINKS, utm } from "@/lib/social";

/*
  What customers say.

  The reviews from the agency's Facebook page, verbatim, set as pull quotes
  in the display face, with the reviewer's name and the source under each.
  They sit in two offset columns, like quotes pulled across a spread, and
  the chapter ends in a link to the page itself so anyone can check.

  No reviews, no chapter: the list in lib/reviews.ts is the only source, and
  an empty list renders nothing rather than a placeholder.
*/

export default function Voices({ lang }: { lang: Locale }) {
  if (!REVIEWS.length) return null;
  const de = lang === "de";
  const fb = SOCIAL_LINKS.find((s) => s.key === "facebook");

  return (
    <section id="voices" data-tone="dark" className="relative px-5 py-28 text-creme md:px-10 md:py-40">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <Chapter n="08" title={de ? "Was Kunden sagen" : "What clients say"} tone="creme" />
        </Reveal>

        <div className="mt-12 flex flex-col gap-6 md:mt-16 md:flex-row md:items-end md:justify-between">
          <Reveal as="h2" className="font-display text-5xl font-medium leading-[0.98] tracking-[-0.01em] sm:text-6xl md:text-7xl">
            {de ? "Nicht unsere Worte." : "Not our words."}
          </Reveal>
          {REVIEW_SUMMARY.count ? (
            <Reveal className="font-sans text-[11px] uppercase tracking-[0.3em] text-creme/55">
              {REVIEW_SUMMARY.count} {de ? "Empfehlungen auf Facebook" : "recommendations on Facebook"}
            </Reveal>
          ) : null}
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-16 md:mt-24 md:grid-cols-12">
          {REVIEWS.map((r, i) => (
            <Reveal
              key={`${r.name}-${i}`}
              delay={(i % 2) * 0.1}
              className={i % 2 === 0 ? "md:col-span-6" : "md:col-span-5 md:col-start-8 md:mt-24"}
            >
              <blockquote lang={r.lang}>
                <span aria-hidden className="block font-display text-6xl leading-none text-pink md:text-8xl">“</span>
                <p className="-mt-6 font-display text-2xl leading-snug md:-mt-8 md:text-3xl lg:text-4xl">{r.text}</p>
                <footer className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-sans text-[10px] uppercase tracking-[0.3em] text-creme/55">
                  <cite className="not-italic text-creme">{r.name}</cite>
                  <span>via Facebook{r.date ? ` · ${r.date}` : ""}</span>
                  {r.lang !== lang && <span className="text-creme/35">{r.lang === "de" ? "Deutsch" : "English"}</span>}
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>

        {fb && (
          <Reveal className="mt-20 md:mt-28">
            <a
              href={utm(fb.url, "voices")}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-creme/55 transition-colors hover:text-creme"
            >
              {de ? "Alle Bewertungen auf Facebook" : "All reviews on Facebook"}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
