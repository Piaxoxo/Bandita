import type { Metadata } from "next";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import LandingVienna from "@/components/seo/LandingVienna";
import { FAQ } from "@/lib/faq-vienna";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.agency";
const PATH = "/marketing-agentur-wien";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

const META = {
  de: {
    title: "Marketing Agentur Wien — Bandita | Branding, Social Media & Film",
    description:
      "Marketingagentur in Wien: Markenstrategie, Social-Media-Content, Filmproduktion mit Kinokamera, Fotografie, Web & 3D, SEO und KI — alles aus einer Hand. Transparente Startpreise, Angebot in 48 Stunden.",
  },
  en: {
    title: "Marketing Agency Vienna — Bandita | Branding, Social & Film",
    description:
      "Marketing agency in Vienna: brand strategy, social media content, cinema-camera film production, photography, web & 3D, SEO and AI — all under one roof. Transparent starting prices, offer within 48 hours.",
  },
};

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);
  const { title, description } = META[lang];
  return {
    title,
    description,
    keywords: [
      "Marketing Agentur Wien",
      "Marketingagentur Wien",
      "Werbeagentur Wien",
      "Kreativagentur Wien",
      "Social Media Agentur Wien",
      "Filmproduktion Wien",
      "SEO Agentur Wien",
    ],
    alternates: {
      canonical: `/${lang}${PATH}`,
      languages: { en: `/en${PATH}`, de: `/de${PATH}`, "x-default": `/de${PATH}` },
    },
    openGraph: {
      type: "website",
      siteName: "BANDITA",
      title,
      description,
      url: `${SITE_URL}/${lang}${PATH}`,
      locale: lang === "de" ? "de_AT" : "en_US",
      images: [{ url: "/og/bandita-og.svg", width: 1200, height: 630, alt: dict.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og/bandita-og.svg"] },
  };
}

export default function MarketingAgenturWienPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const { title, description } = META[lang];

  // FAQPage + Service + breadcrumb structured data — the FAQ answers are what
  // AI assistants quote when asked "which marketing agency in Vienna…".
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/${lang}${PATH}#faq`,
        mainEntity: FAQ[lang].map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/${lang}${PATH}#service`,
        name: title,
        description,
        serviceType: lang === "de" ? "Marketingagentur" : "Marketing agency",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: [{ "@type": "City", name: "Wien" }, { "@type": "Country", name: "Österreich" }],
        url: `${SITE_URL}/${lang}${PATH}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${lang}` },
          { "@type": "ListItem", position: 2, name: META[lang].title.split(" — ")[0], item: `${SITE_URL}/${lang}${PATH}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingVienna lang={lang} />
    </>
  );
}
