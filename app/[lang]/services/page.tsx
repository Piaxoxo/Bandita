import type { Metadata } from "next";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import ServicesExperience from "@/components/services/ServicesExperience";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.studio";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);
  const { title, description } = dict.services.meta;
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/services`,
      languages: { en: "/en/services", de: "/de/services", "x-default": "/en/services" },
    },
    openGraph: {
      type: "website",
      siteName: "BANDITA",
      title,
      description,
      url: `${SITE_URL}/${lang}/services`,
      locale: lang === "de" ? "de_AT" : "en_US",
      images: [{ url: "/og/bandita-og.svg", width: 1200, height: 630, alt: dict.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og/bandita-og.svg"] },
  };
}

export default function ServicesPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);
  return <ServicesExperience lang={lang} dict={dict} />;
}
