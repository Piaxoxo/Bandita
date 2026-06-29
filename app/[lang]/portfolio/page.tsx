import type { Metadata } from "next";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PortfolioExperience from "@/components/portfolio/PortfolioExperience";

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
  const { title, description } = dict.portfolio.meta;
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/portfolio`,
      languages: { en: "/en/portfolio", de: "/de/portfolio", "x-default": "/en/portfolio" },
    },
    openGraph: {
      type: "website",
      siteName: "BANDITA",
      title,
      description,
      url: `${SITE_URL}/${lang}/portfolio`,
      locale: lang === "de" ? "de_AT" : "en_US",
      images: [{ url: "/og/bandita-og.svg", width: 1200, height: 630, alt: dict.meta.ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og/bandita-og.svg"] },
  };
}

export default function PortfolioPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);
  return <PortfolioExperience lang={lang} dict={dict} />;
}
