# BANDITA — Digital Flagship

The digital flagship of **BANDITA**, an international creative studio based in Vienna, Austria.
Built to be the studio's strongest portfolio piece: an immersive, award-worthy experience —
not another agency website.

> _Verrückt. Hip. Aus Wien._

---

## Status — Phase 1

The project is built in phases. **Phase 1 (this build): the Opening Experience + Homepage.**

| Phase | Scope | State |
| ----- | ----- | ----- |
| **1** | Opening animation · Hero · Homepage | ✅ Done |
| 2 | About | ⏳ Pending approval |
| 3 | Services | ⏳ |
| 4 | Portfolio | ⏳ |
| 5 | Journal | ⏳ |
| 6 | Contact | ⏳ |

Navigation links to unbuilt pages are flagged **"Soon / Bald"** and intentionally inert
until their phase ships.

---

## What's in Phase 1

- **Cinematic loader** — the Bandita wordmark forms out of an animated atmosphere
  (counter + staggered reveal). No spinner. Skippable. Reduced-motion fallback.
- **WebGL hero** (Three.js / React-Three-Fiber) — a frosted glass orb with real
  transmission, drifting brand-coloured particles, floating distortion blobs, animated
  lighting, a soft gradient backdrop, and pointer-driven camera parallax.
- **Custom cursor** — magnetic ring + dot, glow, reacts to links/buttons/images.
  Desktop (fine-pointer) only; auto-disabled on touch.
- **Scroll story** — five curiosity-building sections, each with its own signature motion
  (masked headline reveals, scrub-driven word fills, marquee, parallax glass cards),
  driven by GSAP ScrollTrigger + Lenis smooth scroll.
- **Bilingual (DE / EN)** — full i18n with an animated language switcher and locale routing.
- **Accessibility panel** — reduce motion, high contrast, brightness, text scaling.
- **SEO baseline** — one H1 per page, semantic landmarks, Open Graph, Twitter Cards,
  JSON-LD, canonical + hreflang, `sitemap.xml`, `robots.txt`.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · React-Three-Fiber / Three.js / drei ·
GSAP + ScrollTrigger · Lenis.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /en
npm run build    # production build
npm run start    # serve the production build
```

`/` redirects to the visitor's preferred locale (`/en` or `/de`).

## Brand system

| Token | Hex | | Token | Hex |
| ----- | ----- | --- | ----- | ----- |
| Creme | `#FCF6EC` | | Coral | `#FF8A5B` |
| Pink  | `#FB003F` | | Gelb  | `#FFC23D` |
| Ink   | `#1A1216` | | Teal  | `#5FC9BC` |
|       |           | | Rosé  | `#FF5C9E` |

Display / headlines: **Bodoni Moda** · Body / UI: **Inter**.

## Project structure

```
app/[lang]/        # locale-scoped root layout, metadata, homepage
app/sitemap.ts     # + robots.ts, icon.svg
components/         # SiteShell, Nav, Loader, CustomCursor, sections/, webgl/, anim/
i18n/              # config + DE/EN dictionaries (all copy lives here)
lib/               # site context, smooth-scroll + anchor helpers
```

All visitor-facing copy is centralised in `i18n/dictionaries/` — nothing is hard-coded
in components.

## Media

Phase 1 ships with brand-coloured generative visuals and clearly-swappable placeholders.
Real photography / film drops into the same slots when assets arrive.
