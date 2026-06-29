#!/usr/bin/env node
/**
 * Bandita image optimiser — turns huge photo attachments into web-ready assets.
 *
 * Usage:
 *   node scripts/optimize-images.mjs <file|dir> [more...] [options]
 *
 * Options:
 *   --out <dir>      output directory          (default: public/work)
 *   --max <px>       max width                 (default: 2400)
 *   --quality <q>    JPEG quality 1-100        (default: 80)
 *   --prefix <name>  rename to <name>-1.jpg…   (default: keep sanitised name)
 *
 * Examples:
 *   # optimise one big upload into the homepage work folder
 *   node scripts/optimize-images.mjs ~/Downloads/IMG_2042.jpeg --prefix film
 *
 *   # optimise everything a session uploaded
 *   node scripts/optimize-images.mjs /root/.claude/uploads/<session> --out public/work
 *
 * If no input is given it scans ./media/raw (drop originals there).
 */
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const IMG_RE = /\.(jpe?g|png|webp|tiff?)$/i;

function parseArgs(argv) {
  const opts = { out: "public/work", max: 2400, quality: 80, prefix: null, inputs: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") opts.out = argv[++i];
    else if (a === "--max") opts.max = Number(argv[++i]);
    else if (a === "--quality") opts.quality = Number(argv[++i]);
    else if (a === "--prefix") opts.prefix = argv[++i];
    else opts.inputs.push(a);
  }
  return opts;
}

async function collect(inputs) {
  if (inputs.length === 0) inputs = ["media/raw"];
  const files = [];
  for (const input of inputs) {
    let stat;
    try {
      stat = await fs.stat(input);
    } catch {
      console.warn(`! skip (not found): ${input}`);
      continue;
    }
    if (stat.isDirectory()) {
      for (const name of await fs.readdir(input)) {
        if (IMG_RE.test(name)) files.push(path.join(input, name));
      }
    } else if (IMG_RE.test(input)) {
      files.push(input);
    }
  }
  return files;
}

const sanitize = (name) =>
  name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "image";

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const files = await collect(opts.inputs);
  if (files.length === 0) {
    console.log("No images found. Pass files/dirs, or drop originals into media/raw/.");
    return;
  }
  await fs.mkdir(opts.out, { recursive: true });
  console.log(`Optimising ${files.length} image(s) → ${opts.out} (max ${opts.max}px, q${opts.quality})\n`);

  let i = 0;
  for (const file of files.sort()) {
    i++;
    const base = opts.prefix ? `${opts.prefix}-${String(i).padStart(2, "0")}` : sanitize(path.basename(file));
    const dst = path.join(opts.out, `${base}.jpg`);
    const before = (await fs.stat(file)).size;
    const meta = await sharp(file).metadata();
    await sharp(file)
      .rotate() // honour EXIF orientation
      .resize({ width: opts.max, withoutEnlargement: true })
      .jpeg({ quality: opts.quality, mozjpeg: true })
      .toFile(dst);
    const after = (await fs.stat(dst)).size;
    const kb = (n) => `${Math.round(n / 1024)}KB`;
    console.log(
      `✓ ${path.basename(file)}  ${meta.width}×${meta.height} ${kb(before)} → ${path.basename(dst)} ${kb(after)}`,
    );
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
