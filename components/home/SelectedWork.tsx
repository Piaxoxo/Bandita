"use client";

import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import ParticleHeadline from "@/components/anim/ParticleHeadline";
import Chapter from "@/components/editorial/Chapter";
import { STATIONS, stationBySlug, coverOf } from "@/components/portfolio/portfolio-data";

/*
  The work, first.

  The old homepage showed price packages as its second screen and never the
  portfolio at all — a studio face on a shop body. This is the correction:
  one line, then client work, before a single sentence about ourselves.

  Six, hand-picked, not the first six. The wall has seventeen; a homepage that
  shows all of them is a portfolio page with extra steps. The pick mixes
  disciplines on purpose — web, fashion, hospitality, brand, photography —
  so the range reads from the grid without a word of explanation.
*/
const PICKS = ["befree", "plein", "innsider", "hotel", "antislop", "kern"];

export default function SelectedWork({ lang }: { lang: Locale }) {
  const de = lang === "de";

  return (
    // On paper, not on black: in a magazine the work sits on the page.
    <section id="work" className="relative px-5 pb-24 pt-16 text-ink md:px-10 md:pb-36 md:pt-24">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <Chapter n="03" title={de ? "Arbeiten" : "Work"} />
        </Reveal>
        <div className="mb-14 mt-10 flex flex-col gap-6 md:mb-20 md:mt-14 md:flex-row md:items-end md:justify-between">
          <ParticleHeadline
            as="h2"
            text={de ? "Reden kann jeder." : "Anyone can talk."}
            className="font-display text-5xl font-medium leading-[0.98] tracking-[-0.01em] text-ink sm:text-6xl md:text-7xl lg:text-8xl"
          />
          <Reveal>
            <Link
              href={`/${lang}/portfolio`}
              data-cursor="link"
              className="group inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-ink/55 transition-colors hover:text-ink"
            >
              {de ? `Alle ${STATIONS.length} Projekte` : `All ${STATIONS.length} projects`}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {PICKS.map((slug, i) => {
            const st = stationBySlug(slug);
            const cover = st ? coverOf(st) : undefined;
            if (!st || !cover) return null;
            return (
              <Reveal key={st.id} delay={(i % 3) * 0.08}>
                <Link
                  href={`/${lang}/portfolio/${st.id}`}
                  data-cursor="link"
                  className="group relative block overflow-hidden ring-1 ring-ink/10 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(26,18,22,0.35)]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink/5">
                    <Image
                      src={cover}
                      alt={`${st.name[lang]} — ${st.tag[lang]}`}
                      fill
                      sizes="(min-width: 1024px) 520px, 50vw"
                      className="object-cover opacity-85 grayscale transition-all duration-700 group-hover:scale-[1.06] group-hover:opacity-100 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-[#08070a]/25 to-transparent" />
                    <div
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: st.color }}
                    />
                    <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
                      <h3 className="font-display text-xl font-medium leading-tight text-creme md:text-3xl">
                        {st.name[lang]}
                      </h3>
                      <p
                        className="mt-1 font-sans text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: st.color }}
                      >
                        {st.tag[lang]}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
