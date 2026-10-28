// The site mark: a processor seen from above, a square die with three pins
// on each side, in the accent color. Drawn on a 32x32 grid; app/icon.svg
// repeats these shapes on a dark tile for the favicon.
export const CHIP_PINS =
  "M12 3v5M16 3v5M20 3v5M12 24v5M16 24v5M20 24v5" +
  "M3 12h5M3 16h5M3 20h5M24 12h5M24 16h5M24 20h5";

export function ChipMark({
  className,
  size,
  accent = "var(--color-accent)",
  ink = "var(--color-accent-ink)",
}: {
  className?: string;
  /** Pixels; for ImageResponse, which ignores classes. */
  size?: number;
  /** Colors; ImageResponse has no CSS variables. */
  accent?: string;
  ink?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={CHIP_PINS} stroke={accent} strokeWidth="2" />
      <rect x="8" y="8" width="16" height="16" rx="2" fill={accent} />
      <rect x="12" y="12" width="8" height="8" rx="1" fill={ink} />
    </svg>
  );
}
