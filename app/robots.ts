import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bandita.agency";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Self-hosted copies of client sites shown as clickable portfolio
      // previews. They carry a noindex tag as well — they must never compete
      // with the real site in search results.
      disallow: "/portfolio/sites/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
