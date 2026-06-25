import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "../globals.css";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import SiteShell from "@/components/SiteShell";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://bandita.studio";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    additionalType: "https://schema.org/Organization",
    name: "BANDITA",
    alternateName: "Bandita Creative Studio",
    url: `${SITE_URL}/${lang}`,
    slogan: "Verrückt. Hip. Aus Wien.",
    description: dict.meta.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vienna",
      addressCountry: "AT",
    },
    areaServed: "Worldwide",
    knowsAbout: [
      "Brand Strategy",
      "Creative Direction",
      "Web Design",
      "Film Production",
      "Performance Marketing",
    ],
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
      </body>
    </html>
  );
}
