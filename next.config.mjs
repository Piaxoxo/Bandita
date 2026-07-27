/** @type {import('next').NextConfig} */

// Static export (for GitHub Pages) is opt-in via EXPORT=true so that local
// `next dev` / `next start` keep their full SSR + middleware behaviour.
const isExport = process.env.EXPORT === "true";

// GitHub project Pages are served from /<repo>, so the app needs a basePath.
// Override with BASE_PATH if deploying somewhere else (e.g. a custom domain → "").
const basePath =
  process.env.BASE_PATH ?? (isExport ? "/Bandita" : "");

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  ...(isExport
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        images: { formats: ["image/avif", "image/webp"] },
        // Silent business-card short links. These serve a self-contained page
        // that full-bleed-embeds the standalone landing app, so the address bar
        // stays bandita.agency/pia (no vercel URL shown) and the landing's own
        // assets load from its origin inside the frame — nothing breaks.
        // beforeFiles so the [lang] dynamic route can't swallow /pia as a
        // locale. Not linked anywhere in the UI, not in the sitemap.
        // (rewrites() is unsupported by `output: export`, so SSR-only.)
        async rewrites() {
          return {
            beforeFiles: [
              { source: "/pia", destination: "/pia.html" },
              { source: "/dino", destination: "/dino.html" },
            ],
            afterFiles: [],
            fallback: [],
          };
        },
      }),
};

export default nextConfig;
