import type { MetadataRoute } from "next";
import { i18n } from "@/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-29");
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
  ];

  return i18n.locales.flatMap((lang) =>
    routes.map((route) => ({
      url: `${SITE_URL}/${lang}${route.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: lang === i18n.defaultLocale ? route.priority : route.priority - 0.1,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${route.path}`,
          de: `${SITE_URL}/de${route.path}`,
        },
      },
    })),
  );
}
