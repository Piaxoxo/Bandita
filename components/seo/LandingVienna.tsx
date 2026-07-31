"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Reveal3D from "@/components/anim/Reveal3D";
import MagneticButton from "@/components/MagneticButton";
import { useQuote } from "@/components/quote/QuoteProvider";
import { PRICING } from "@/components/services/services-data";
import { FAQ } from "@/lib/faq-vienna";

// SEO landing page for "Marketing Agentur Wien" — real content, Bandita voice,
// heavy internal linking. Keyword-relevant but written for humans first.

const STARTER_IDS = ["web-starter", "social-start", "seo-start"] as const;

const COPY = {
  de: {
    kicker: "Marketing Agentur Wien",
    h1a: "Marketing Agentur",
    h1b: "in Wien.",
    lead: "Bandita ist eine Kreativ- und Marketingagentur aus Wien. Wir bauen Marken, an denen man nicht vorbeiscrollt — mit Strategie, die verkauft, und Kreation, die man sich merkt.",
    intro: [
      {
        h: "Alles unter einem Dach",
        p: "Markenstrategie, Social-Media-Content, Filmproduktion mit echter Kinokamera, Fotografie, Websites mit 3D, SEO und KI-gestützte Kampagnen. Du bekommst keine Einzelteile von fünf Dienstleistern, sondern eine Handschrift aus einem Team.",
      },
      {
        h: "Psychologie statt Bauchgefühl",
        p: "Gutes Marketing ist keine Magie, es ist Psychologie. Wir verbinden Markenstrategie mit Neuromarketing und Wirtschaftspsychologie — jede Entscheidung hat einen Grund, den wir dir erklären können.",
      },
      {
        h: "Aus Wien. Gebaut für überall.",
        p: "Wir arbeiten mit Hotels, Gastronomie, Fashion-Marken, Start-ups und Unternehmen, die mehr wollen als Durchschnitt. Unser Akzent ist österreichisch, unser Anspruch international.",
      },
    ],
    servicesH: "Leistungen unserer Werbeagentur in Wien",
    services: [
      ["Markenstrategie & Branding", "Positionierung, Identität, Logo, Naming und Guidelines — gebaut auf Neuromarketing."],
      ["Social Media Marketing", "Content, Reels, Redaktionsplan und Ads für Instagram, TikTok, LinkedIn & Co."],
      ["Filmproduktion", "Imagefilme, Werbespots und Reels — gedreht auf echter Kinokamera, inklusive Drohne."],
      ["Fotografie", "Produkt, Editorial, Fashion und Kampagne — von Fotografen mit Publikationen im Rücken."],
      ["Webdesign & 3D", "Premium-Websites, 3D-Erlebnisse, Online-Shops und Landingpages, die konvertieren."],
      ["SEO & Google Ads", "Local SEO, Google Business, Technical SEO und Kampagnen, die messbar Kunden bringen."],
      ["Künstliche Intelligenz", "KI-Content ohne Shooting, AI-Agents, Automatisierung und Chatbots für dein Business."],
    ],
    pricesH: "Transparente Startpreise",
    pricesSub: "Kein „Preis auf Anfrage“, wenn es auch konkret geht. Alles Größere kalkulieren wir individuell.",
    faqH: "Häufige Fragen zur Marketingagentur in Wien",
    ctaH: "Sprechen wir über deine Marke.",
    ctaP: "Erzähl uns kurz, was du vorhast — du bekommst innerhalb von 48 Stunden eine ehrliche Einschätzung und ein individuelles Angebot.",
    ctaBtn: "Angebot anfordern",
    ctaAlt: "Alle Leistungen & Preise",
    portfolio: "Arbeiten ansehen",
  },
  en: {
    kicker: "Marketing Agency Vienna",
    h1a: "Marketing agency",
    h1b: "in Vienna.",
    lead: "Bandita is a creative and marketing agency based in Vienna. We build brands people don't scroll past — with strategy that sells and creative people remember.",
    intro: [
      {
        h: "Everything under one roof",
        p: "Brand strategy, social media content, film production on a real cinema camera, photography, websites with 3D, SEO and AI-driven campaigns. Not parts from five suppliers — one handwriting from one team.",
      },
      {
        h: "Psychology, not gut feeling",
        p: "Good marketing isn't magic, it's psychology. We combine brand strategy with neuromarketing and business psychology — every decision has a reason we can explain.",
      },
      {
        h: "From Vienna. Built for everywhere.",
        p: "We work with hotels, hospitality, fashion brands, start-ups and companies that want more than average. Our accent is Austrian, our standard is international.",
      },
    ],
    servicesH: "What our Vienna agency does",
    services: [
      ["Brand strategy & branding", "Positioning, identity, logo, naming and guidelines — built on neuromarketing."],
      ["Social media marketing", "Content, reels, planning and ads for Instagram, TikTok, LinkedIn & co."],
      ["Film production", "Image films, commercials and reels — shot on a real cinema camera, drone included."],
      ["Photography", "Product, editorial, fashion and campaign — by photographers with real publications."],
      ["Web design & 3D", "Premium websites, 3D experiences, online shops and landing pages that convert."],
      ["SEO & Google Ads", "Local SEO, Google Business, technical SEO and campaigns that measurably bring customers."],
      ["Artificial intelligence", "AI content without a shoot, AI agents, automation and chatbots for your business."],
    ],
    pricesH: "Transparent starting prices",
    pricesSub: "No “price on request” when we can just tell you. Anything bigger is calculated individually.",
    faqH: "Frequently asked questions",
    ctaH: "Let's talk about your brand.",
    ctaP: "Tell us what you're planning — you'll get an honest assessment and an individual offer within 48 hours.",
    ctaBtn: "Request an offer",
    ctaAlt: "All services & pricing",
    portfolio: "See the work",
  },
};

export default function LandingVienna({ lang }: { lang: Locale }) {
  const { open } = useQuote();
  const t = COPY[lang];
  const faq = FAQ[lang];
  const tiers = STARTER_IDS.map((id) => PRICING.tiers.find((x) => x.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );

  return (
    <div className="relative bg-creme text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 40% at 75% 10%, rgba(251,0,63,0.12), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1300px]">
          <Reveal>
            <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">{t.kicker}</p>
          </Reveal>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[0.95] tracking-[-0.02em] md:text-8xl">
            {t.h1a} <span className="italic text-pink">{t.h1b}</span>
          </h1>
          <Reveal>
            <p className="mt-8 max-w-2xl font-sans text-lg leading-relaxed text-ink/70 md:text-xl">{t.lead}</p>
          </Reveal>
          <Reveal className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton onClick={() => open()} strength={0.5}
              className="rounded-full bg-pink px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-ink">
              {t.ctaBtn}
            </MagneticButton>
            <Link href={`/${lang}/services`} data-cursor="link"
              className="rounded-full border border-ink/20 px-9 py-4 font-sans text-sm uppercase tracking-[0.14em] transition-colors hover:border-pink hover:text-pink">
              {t.ctaAlt}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* WHY */}
      <section className="relative px-5 py-16 md:px-10 md:py-24">
        <Reveal3D className="mx-auto grid max-w-[1300px] gap-6 md:grid-cols-3">
          {t.intro.map((b) => (
            <div key={b.h} className="rounded-3xl border border-ink/10 bg-white/40 p-7">
              <h2 className="font-display text-2xl font-medium tracking-[-0.01em]">{b.h}</h2>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/70">{b.p}</p>
            </div>
          ))}
        </Reveal3D>
      </section>

      {/* SERVICES */}
      <section className="relative bg-ink/[0.02] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Reveal as="h2" className="max-w-3xl font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] md:text-5xl">
            {t.servicesH}
          </Reveal>
          <Reveal3D className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2" stagger={0.05}>
            {t.services.map(([h, p]) => (
              <div key={h} className="border-t border-ink/15 pt-5">
                <h3 className="font-display text-xl font-medium tracking-[-0.01em]">{h}</h3>
                <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink/65">{p}</p>
              </div>
            ))}
          </Reveal3D>
          <Reveal className="mt-12">
            <Link href={`/${lang}/portfolio`} data-cursor="link"
              className="group inline-flex items-center gap-2 font-sans text-sm uppercase tracking-[0.12em] text-pink transition-colors hover:text-ink">
              {t.portfolio} <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* PRICES */}
      <section className="relative px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Reveal as="h2" className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] md:text-5xl">
            {t.pricesH}
          </Reveal>
          <Reveal><p className="mt-4 max-w-xl font-sans text-base text-ink/60">{t.pricesSub}</p></Reveal>
          <Reveal3D className="mt-10 grid gap-5 sm:grid-cols-3">
            {tiers.map((x) => (
              <div key={x.id} className="rounded-3xl border border-ink/10 bg-creme p-7">
                <h3 className="font-display text-xl font-medium">{x.name}</h3>
                <p className="mt-1 font-sans text-sm text-ink/55">{x.tagline[lang]}</p>
                <p className="mt-4 font-display text-3xl font-medium">{x.price}</p>
                <button onClick={() => open()} data-cursor="link"
                  className="mt-5 w-full rounded-full bg-ink px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] text-creme transition-colors hover:bg-pink">
                  {t.ctaBtn}
                </button>
              </div>
            ))}
          </Reveal3D>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-ink/[0.02] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[900px]">
          <Reveal as="h2" className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] md:text-5xl">
            {t.faqH}
          </Reveal>
          <div className="mt-10 divide-y divide-ink/10">
            {faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-xl font-medium tracking-[-0.01em] transition-colors hover:text-pink md:text-2xl">
                  <h3>{f.q}</h3>
                  <span aria-hidden className="mt-1 shrink-0 text-pink transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-pink px-5 py-24 text-center text-creme md:py-32">
        <div className="relative mx-auto max-w-2xl">
          <Reveal as="h2" className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] md:text-6xl">
            {t.ctaH}
          </Reveal>
          <Reveal><p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-creme/85 md:text-lg">{t.ctaP}</p></Reveal>
          <Reveal className="mt-9">
            <MagneticButton onClick={() => open()} strength={0.5}
              className="rounded-full bg-creme px-10 py-4 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-creme">
              {t.ctaBtn}
            </MagneticButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
