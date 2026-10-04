import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  STATIONS,
  stationBySlug,
  stationIndex,
  projectMedia,
  deliverables,
} from "./portfolio-data";
import SitePreview from "./SitePreview";
import LazyVideo from "@/components/LazyVideo";
import ContactCTA from "@/components/sections/ContactCTA";
import Reveal from "@/components/anim/Reveal";

/*
  A case study page, rendered on the SERVER.

  That is the point of it. The portfolio "experience" is a client-side world:
  beautiful, but its text exists only after JavaScript runs, and there is one
  URL for seventeen projects. This page is the opposite — every word is in the
  HTML, every project has its own address, and the interactive pieces (films,
  embedded sites) are the only client components on it.

  Sections whose content does not exist yet are not rendered. A half-written
  case study reads as a short one, never as an empty template.
*/

const COPY = {
  de: {
    back: "Alle Projekte",
    brief: "Die Aufgabe",
    approach: "Unser Weg",
    delivers: "Was entstanden ist",
    outcome: "Was es gebracht hat",
    client: "Kunde",
    year: "Jahr",
    next: "Nächstes Projekt",
    services: "Passende Leistungen ansehen",
    of: "von",
  },
  en: {
    back: "All projects",
    brief: "The brief",
    approach: "What we did",
    delivers: "What came out of it",
    outcome: "What it achieved",
    client: "Client",
    year: "Year",
    next: "Next project",
    services: "See the matching services",
    of: "of",
  },
};

export default function CaseStudy({
  slug,
  lang,
  dict,
}: {
  slug: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const st = stationBySlug(slug);
  if (!st) return null;

  const t = COPY[lang] ?? COPY.de;
  const i = stationIndex(slug);
  const next = STATIONS[(i + 1) % STATIONS.length];
  const media = projectMedia(st);
  const gives = deliverables(st, lang);
  const s = st.study;

  return (
    <article className="relative min-h-screen bg-[#08070a] text-creme">
      {/* mood wash in the project's own accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background: `radial-gradient(90% 60% at 50% 0%, ${st.color}26 0%, ${st.color}0f 34%, transparent 72%)`,
        }}
      />

      <header className="relative mx-auto max-w-[1300px] px-5 pt-32 md:px-10 md:pt-44">
        <nav className="mb-10 flex items-center gap-4 font-sans text-[11px] uppercase tracking-[0.2em]">
          <Link
            href={`/${lang}/portfolio`}
            data-cursor="link"
            className="rounded-full border border-creme/15 px-4 py-2 text-creme/70 transition-colors hover:border-creme/40 hover:text-creme"
          >
            ← {t.back}
          </Link>
          <span className="tabular-nums text-creme/35">
            {String(i + 1).padStart(2, "0")} {t.of} {String(STATIONS.length).padStart(2, "0")}
          </span>
        </nav>

        <p className="font-sans text-xs uppercase tracking-[0.28em]" style={{ color: st.color }}>
          {st.tag[lang]}
        </p>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-7xl md:text-8xl">
          {st.name[lang]}
        </h1>

        {st.note && (
          <p className="mt-7 max-w-2xl font-display text-xl italic leading-snug text-creme/80 md:text-2xl">
            {st.note[lang]}
          </p>
        )}

        {/* Facts, where there are any. */}
        {(s?.client || s?.year || gives.length > 0) && (
          <dl className="mt-12 grid gap-x-10 gap-y-6 border-t border-creme/10 pt-8 font-sans text-sm sm:grid-cols-3">
            {s?.client && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-creme/40">{t.client}</dt>
                <dd className="mt-2 text-creme/85">{s.client}</dd>
              </div>
            )}
            {s?.year && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-creme/40">{t.year}</dt>
                <dd className="mt-2 tabular-nums text-creme/85">{s.year}</dd>
              </div>
            )}
            {gives.length > 0 && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-creme/40">
                  {t.delivers}
                </dt>
                <dd className="mt-2 text-creme/85">{gives.join(" · ")}</dd>
              </div>
            )}
          </dl>
        )}
      </header>

      {/* The written case — only the parts that exist. */}
      {(s?.brief || s?.approach) && (
        <section className="relative mx-auto mt-24 grid max-w-[1300px] gap-12 px-5 md:mt-32 md:grid-cols-2 md:px-10">
          {s?.brief && (
            <Reveal>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.28em] text-creme/45">
                {t.brief}
              </h2>
              <p className="mt-5 font-sans text-lg leading-relaxed text-creme/80">{s.brief[lang]}</p>
            </Reveal>
          )}
          {s?.approach && (
            <Reveal>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.28em] text-creme/45">
                {t.approach}
              </h2>
              <p className="mt-5 font-sans text-lg leading-relaxed text-creme/80">
                {s.approach[lang]}
              </p>
            </Reveal>
          )}
        </section>
      )}

      {/* The work itself. */}
      {st.site && (
        <div className="relative mx-auto mt-24 max-w-[1300px] px-5 md:mt-32 md:px-10">
          <SitePreview
            src={st.site.src}
            chrome={st.site.chrome}
            caption={st.site.label?.[lang] ?? st.site.domain ?? st.name[lang]}
            live={st.site.live}
            poster={st.site.poster}
            color={st.color}
            lang={lang}
          />
        </div>
      )}

      <div className="relative mx-auto mt-20 flex max-w-[1300px] flex-col gap-10 px-5 pb-10 md:mt-28 md:gap-20 md:px-10">
        {media.map((m, k) => (
          <figure key={m.src} className="overflow-hidden rounded-[1.1rem] ring-1 ring-creme/10">
            {m.isVideo ? (
              <LazyVideo
                src={m.src}
                poster={m.poster}
                className="w-full bg-black object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.src}
                alt={`${st.name[lang]} — ${st.tag[lang]} (${k + 1})`}
                loading={k === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full bg-[#0d0b0e] object-contain"
              />
            )}
          </figure>
        ))}
      </div>

      {s?.outcome && (
        <section className="relative mx-auto mt-24 max-w-[1000px] px-5 md:mt-32 md:px-10">
          <Reveal>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.28em] text-creme/45">
              {t.outcome}
            </h2>
            <p className="mt-6 font-display text-2xl leading-snug text-creme md:text-4xl">
              {s.outcome[lang]}
            </p>
          </Reveal>
        </section>
      )}

      {s?.quote && (
        <section className="relative mx-auto mt-24 max-w-[1000px] px-5 md:mt-32 md:px-10">
          <Reveal>
            <blockquote className="border-l-2 pl-7" style={{ borderColor: st.color }}>
              <p className="font-display text-2xl italic leading-snug text-creme md:text-3xl">
                „{s.quote.text[lang]}“
              </p>
              <footer className="mt-5 font-sans text-xs uppercase tracking-[0.2em] text-creme/50">
                {s.quote.author}
                {s.quote.role ? ` · ${s.quote.role[lang]}` : ""}
              </footer>
            </blockquote>
          </Reveal>
        </section>
      )}

      {/* Onward. */}
      <nav className="relative mx-auto mt-28 max-w-[1300px] px-5 md:mt-40 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-creme/10 pt-10">
          <Link href={`/${lang}/portfolio/${next.id}`} data-cursor="link" className="group">
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-creme/40">
              {t.next}
            </span>
            <span className="mt-3 block font-display text-3xl font-medium leading-tight transition-colors md:text-5xl group-hover:text-pink">
              {next.name[lang]} →
            </span>
          </Link>
          <Link
            href={`/${lang}/services`}
            data-cursor="link"
            className="font-sans text-[11px] uppercase tracking-[0.2em] text-creme/50 underline-offset-8 transition-colors hover:text-creme hover:underline"
          >
            {t.services}
          </Link>
        </div>
      </nav>

      <ContactCTA lang={lang} dict={dict} />
    </article>
  );
}
