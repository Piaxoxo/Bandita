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
        // Silent business-card short links — not linked anywhere on the site,
        // not in the sitemap. They forward to the standalone landing apps.
        // (redirects() is unsupported by `output: export`, so SSR-only.)
        async redirects() {
          return [
            { source: "/pia", destination: "https://bandita-landing.vercel.app", permanent: false },
            { source: "/dino", destination: "https://bandita-dino.vercel.app", permanent: false },
          ];
        },
      }),
};

export default nextConfig;
