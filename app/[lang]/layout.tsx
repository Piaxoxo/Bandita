import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "../globals.css";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import SiteShell from "@/components/SiteShell";
import { SOCIAL_LINKS } from "@/lib/social";
import { Analytics } from "@vercel/analytics/next";

// Only the weights actually used (400/500 + one 600) — fewer font files on
// the critical path means faster first paint.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.agency";

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

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: "BANDITA",
    authors: [{ name: "Bandita Creative Studio" }],
    keywords: [
      "creative studio Vienna",
      "branding agency Vienna",
      "Markenagentur Wien",
      "web design Vienna",
      "creative direction",
      "Bandita",
    ],
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        de: "/de",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: "BANDITA",
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${SITE_URL}/${lang}`,
      locale: lang === "de" ? "de_AT" : "en_US",
      images: [
        {
          url: "/og/bandita-og.svg",
          width: 1200,
          height: 630,
          alt: dict.meta.ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og/bandita-og.svg"],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  // Local-business structured data. ProfessionalService + MarketingAgency is
  // what Google and AI assistants actually parse for "Marketingagentur Wien"
  // style queries — the address, geo, sameAs profiles and service catalogue
  // are the signals that make the brand resolvable.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "MarketingAgency"],
    "@id": `${SITE_URL}/#organization`,
    name: "BANDITA",
    legalName: "Bandita — Pia-Alice Stelzl",
    alternateName: ["Bandita Agency", "Bandita Marketing Agency", "Bandita Creative Studio"],
    url: `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}/og/bandita-og.svg`,
    image: `${SITE_URL}/og/bandita-og.svg`,
    slogan: "Verrückt. Hip. Aus Wien.",
    description: dict.meta.description,
    email: "office@bandita.agency",
    foundingDate: "2026",
    founder: { "@type": "Person", name: "Pia-Alice Stelzl", jobTitle: "CEO · Head of Marketing" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Königseggasse 5/6",
      postalCode: "1060",
      addressLocality: "Wien",
      addressRegion: "Wien",
      addressCountry: "AT",
    },
    geo: { "@type": "GeoCoordinates", latitude: 48.1954, longitude: 16.3517 },
    areaServed: [
      { "@type": "City", name: "Wien" },
      { "@type": "Country", name: "Österreich" },
      { "@type": "Place", name: "Worldwide" },
    ],
    priceRange: "€€",
    currenciesAccepted: "EUR",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: SOCIAL_LINKS.map((s) => s.url),
    knowsAbout: [
      "Markenstrategie",
      "Branding",
      "Social Media Marketing",
      "Filmproduktion",
      "Fotografie",
      "Webdesign",
      "3D-Websites",
      "SEO",
      "Künstliche Intelligenz",
      "Neuromarketing",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: lang === "de" ? "Leistungen" : "Services",
      itemListElement: [
        "Markenstrategie & Branding",
        "Social Media Content",
        "Filmproduktion",
        "Fotografie",
        "Web & 3D",
        "SEO & Growth",
        "KI-Lösungen & KI-Content",
      ].map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s, provider: { "@id": `${SITE_URL}/#organization` } },
      })),
    },
  };

  return (
    <html
      lang={lang}
      className={`${bodoni.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="grain antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteShell lang={lang} dict={dict}>
          {children}
        </SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
