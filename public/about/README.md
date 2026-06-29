# About page assets — drop-in slots

The About / "Why Bandita" page renders elegant placeholders until these
files exist, then swaps them in automatically (no code change needed).
Optimise big uploads first: `npm run optimize-images -- <file> --out public/about [--prefix ...]`.

## Namesake illustration (the "② The Name" section)
- `illustration.png`  — the line-art woman. PNG with transparency preferred
  (shown on a creme card, `object-contain`). SVG also fine — rename slot if so.

## On-location atmosphere (the "⑦ Vienna" section)
- `pia-vineyard.jpg`  — already present. Used full-bleed, no client name shown.

## Team portraits — `public/about/team/` (4:5 portrait, ~1200px wide)
Shown black-and-white, turning to colour on hover. Expected filenames:
- `pia-alice.jpg`   — Pia-Alice · CEO · Head of Marketing
- `dino.jpg`        — Dino P.S. · Head of Video Production
- `niddl.jpg`       — Niddl · Head of Music Production
- `noemi-santo.jpg` — Noemi Santo · Head of Photography

Until a portrait exists, the card shows the lead's monogram on a tinted card.

Note: no client or third-party company name may appear in any image, caption
or alt text anywhere on the site.
