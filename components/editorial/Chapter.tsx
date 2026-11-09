/*
  A chapter head, the way the brand guide numbers its own sections:
  "01 ── HAUPTLOGO" — number, hairline, title in wide-tracked caps.

  Every section of the site opens with one, so the whole page reads as one
  issue of one magazine. The accent is the chapter's colour: the brand guide
  lists seven colours and the old site used three, so the other four finally
  get a job — each chapter owns one.
*/

export const CHAPTER_COLORS = {
  "01": "#FB003F", // Pink
  "02": "#FF8A5B", // Coral
  "03": "#FFC23D", // Gelb
  "04": "#5FC9BC", // Teal
  "05": "#FF5C9E", // Rosé
  "06": "#FB003F", // Pink — the palette comes round again
  "07": "#FF8A5B", // Coral
} as const;

export type ChapterNo = keyof typeof CHAPTER_COLORS;

export default function Chapter({
  n,
  title,
  tone = "ink",
  className = "",
  color: colorOverride,
}: {
  n: ChapterNo;
  title: string;
  /** "ink" on paper, "creme" on a dark or pink spread */
  tone?: "ink" | "creme";
  className?: string;
  /** when the chapter's own colour is the background (the series on Gelb) */
  color?: string;
}) {
  const color = colorOverride ?? CHAPTER_COLORS[n];
  const line = tone === "ink" ? "bg-ink/15" : "bg-creme/30";
  const text = tone === "ink" ? "text-ink/70" : "text-creme/80";
  return (
    <div className={`flex items-center gap-4 font-sans text-[10px] uppercase tracking-[0.42em] md:gap-6 md:text-[11px] ${className}`}>
      <span className="font-display text-base tracking-normal md:text-lg" style={{ color }}>
        {n}
      </span>
      <span className={`h-px flex-1 ${line}`} />
      <span className={text}>{title}</span>
    </div>
  );
}
