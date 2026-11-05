type Props = {
  className?: string;
  subtitle?: boolean;
};

// BANDITA wordmark — Bodoni Moda, letter-spaced. Color inherits via currentColor.
export default function Wordmark({ className = "", subtitle = true }: Props) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className="font-display text-2xl font-medium tracking-[0.18em]">
        BANDITA
      </span>
      {/* "Agency" is implied by the lockup; spelling it out made the line
          wider than the wordmark it sits under. */}
      {subtitle && (
        <span className="font-sans text-[7px] uppercase tracking-[0.34em] opacity-80">
          Creative &amp; Marketing
        </span>
      )}
    </span>
  );
}
