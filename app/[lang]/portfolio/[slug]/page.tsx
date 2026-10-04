import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { STATIONS, stationBySlug, coverOf } from "@/components/portfolio/portfolio-data";
import CaseStudy from "@/components/portfolio/CaseStudy";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.agency";

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) => STATIONS.map((s) => ({ lang, slug: s.id })));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const st = stationBySlug(params.slug);
  if (!st) return {};

  const name = st.name[lang];
  const tag = st.tag[lang];
  const title = `${name} — ${tag} | Bandita`;
  /*
    Built from what the project actually is, not from a template, and kept
    inside the ~155 characters Google will show.
  */
  const description = [st.note?.[lang], `${name}: ${tag}.`]
    .filter(Boolean)
    .join(" ")
    .slice(0, 155);

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/portfolio/${st.id}`,
      languages: {
        en: `/en/portfolio/${st.id}`,
        de: `/de/portfolio/${st.id}`,
        "x-default": `/en/portfolio/${st.id}`,
      },
    },
    openGraph: {
      type: "article",
      siteName: "BANDITA",
      title,
      description,
      url: `${SITE_URL}/${lang}/portfolio/${st.id}`,
      locale: lang === "de" ? "de_AT" : "en_US",
      images: [{ url: coverOf(st), width: 1200, height: 630, alt: name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [coverOf(st)] },
  };
}

export default function CasePage({ params }: { params: { lang: string; slug: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const st = stationBySlug(params.slug);
  if (!st) notFound();

  const dict = getDictionary(lang);
  const name = st.name[lang];

  /*
    CreativeWork rather than Article: this is a piece of work we made for a
    client, not a post we wrote. `about` carries the discipline so the entity
    is more than a title.
  */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/${lang}/portfolio/${st.id}#work`,
    name,
    headline: name,
    about: st.tag[lang],
    url: `${SITE_URL}/${lang}/portfolio/${st.id}`,
    image: `${SITE_URL}${coverOf(st)}`,
    inLanguage: lang === "de" ? "de-AT" : "en",
    creator: { "@id": `${SITE_URL}/#organization` },
    ...(st.study?.year ? { dateCreated: st.study.year } : {}),
  };

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Bandita", item: `${SITE_URL}/${lang}` },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.portfolio.enter,
        item: `${SITE_URL}/${lang}/portfolio`,
      },
      { "@type": "ListItem", position: 3, name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <CaseStudy slug={st.id} lang={lang} dict={dict} />
    </>
  );
}
