type Props = {
  className?: string;
  subtitle?: boolean;
  /**
   * "pink": the standard lockup — Pink wordmark, Burgunder subtitle.
   * "ink":   variant 02, for print-like neutral surfaces.
   * "creme": variant 03, for dark or pink surfaces.
   */
  tone?: "pink" | "ink" | "creme";
};

/*
  The BANDITA lockup, to the proportions of bandita_wordmark.svg.

  Those proportions are specific and the old component ignored them:
    BANDITA        Bodoni Moda 500, tracking 16/250  = 0.064em
    subtitle       34/250 = 13.6% of the wordmark, tracking 40/34 ≈ 1.18em,
                   colour #9E3050 — a Burgunder, not Pink
    gap            baseline to baseline 90/250 = 0.36em

  Everything here is in em so one wrapper font-size scales the whole mark,
  from a 20px running head to a full-width masthead. The subtitle's left
  padding equals its tracking: letter-spacing adds its space after the last
  letter too, which would otherwise shift a centred line left by half a gap.
*/
export default function Wordmark({ className = "", subtitle = true, tone = "pink" }: Props) {
  const word = tone === "pink" ? "text-pink" : tone === "ink" ? "text-ink" : "text-creme";
  const sub = tone === "pink" ? "text-[#9E3050]" : tone === "ink" ? "text-ink/80" : "text-creme/85";
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`font-display text-[1em] font-medium leading-none tracking-[0.064em] ${word}`}>
        BANDITA
      </span>
      {subtitle && (
        <span
          className={`mt-[0.22em] pl-[1.18em] font-sans text-[0.136em] font-normal uppercase tracking-[1.18em] ${sub}`}
        >
          Marketing Agency
        </span>
      )}
    </span>
  );
}
