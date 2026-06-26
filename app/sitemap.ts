import type { MetadataRoute } from "next";
import { i18n } from "@/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  // Phase 1: only the homepage exists, in each locale.
  return i18n.locales.map((lang) => ({
    url: `${SITE_URL}/${lang}`,
    lastModified: new Date("2026-06-25"),
    changeFrequency: "monthly",
    priority: lang === i18n.defaultLocale ? 1 : 0.9,
    alternates: {
      languages: {
        en: `${SITE_URL}/en`,
        de: `${SITE_URL}/de`,
      },
    },
  }));
}
