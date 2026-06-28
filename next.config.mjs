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
      }),
};

export default nextConfig;
