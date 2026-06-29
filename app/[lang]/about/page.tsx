import type { Metadata } from "next";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import AboutStory from "@/components/sections/AboutStory";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.studio";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);
  const { title, description } = dict.about.meta;

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/about`,
      languages: {
        en: "/en/about",
        de: "/de/about",
        "x-default": "/en/about",
      },
    },
    openGraph: {
      type: "profile",
      siteName: "BANDITA",
      title,
      description,
      url: `${SITE_URL}/${lang}/about`,
      locale: lang === "de" ? "de_AT" : "en_US",
      images: [{ url: "/og/bandita-og.svg", width: 1200, height: 630, alt: dict.meta.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/bandita-og.svg"],
    },
  };
}

export default function AboutPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: dict.about.meta.title,
    description: dict.about.meta.description,
    url: `${SITE_URL}/${lang}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "BANDITA",
      foundingDate: "2026",
      foundingLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Vienna",
          addressCountry: "AT",
        },
      },
      areaServed: "Worldwide",
      employee: dict.about.team.members.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutStory dict={dict} lang={lang} />
    </>
  );
}
