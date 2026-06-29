# scripts/optimize-images.mjs

Turn huge photo attachments (often 10–20 MB straight from a camera) into
web-ready assets, so the repo and the site stay fast.

## Workflow for new photos
1. Drop the original(s) anywhere — e.g. into `media/raw/` (git-ignored), or
   keep them in the Claude upload folder.
2. Run:

   ```bash
   # everything in media/raw → public/work
   npm run optimize-images

   # specific files, renamed film-01.jpg, film-02.jpg…
   npm run optimize-images -- ~/uploads/IMG_1.jpeg ~/uploads/IMG_2.jpeg --prefix film

   # a whole upload folder into the About assets, narrower max width
   npm run optimize-images -- /root/.claude/uploads/<session> --out public/about --max 2000
   ```

3. Commit the optimised files from `public/…`.

## What it does
- Auto-orients (EXIF), resizes to a max width (default **2400px**),
  re-encodes to **mozjpeg q80**, strips metadata.
- Typical result: ~15 MB → ~300 KB.

## Options
`--out <dir>` (default `public/work`) · `--max <px>` (2400) ·
`--quality <1-100>` (80) · `--prefix <name>` (sequential rename).
