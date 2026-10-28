import type { Category } from "@/domain/parts";

// Line glyphs used as placeholders instead of store product photos, which
// are not copied or hotlinked. Drawn on a 32x32 grid, stroke only.
const GLYPHS: Record<Category, React.ReactNode> = {
  CPU: (
    <>
      <rect x="9" y="9" width="14" height="14" rx="1.5" />
      <rect x="13" y="13" width="6" height="6" />
      <path d="M12 9V5M16 9V5M20 9V5M12 27v-4M16 27v-4M20 27v-4M9 12H5M9 16H5M9 20H5M27 12h-4M27 16h-4M27 20h-4" />
    </>
  ),
  MOTHERBOARD: (
    <>
      <rect x="5" y="4" width="22" height="24" rx="1.5" />
      <rect x="9" y="8" width="7" height="7" />
      <path d="M20 8v9M23 8v9M9 20h14M9 24h10" />
    </>
  ),
  MEMORY: (
    <>
      <path d="M3 11h26v9H3z" />
      <path d="M6 14h3v3H6zM11 14h3v3h-3zM16 14h3v3h-3zM21 14h3v3h-3z" />
      <path d="M5 20v3M9 20v3M13 20v3M19 20v3M23 20v3M27 20v3" />
    </>
  ),
  GPU: (
    <>
      <rect x="3" y="9" width="26" height="13" rx="1.5" />
      <circle cx="11" cy="15.5" r="4" />
      <circle cx="21" cy="15.5" r="4" />
      <path d="M6 22v4h8v-4" />
    </>
  ),
  STORAGE: (
    <>
      <rect x="4" y="11" width="24" height="10" rx="1.5" />
      <path d="M8 16h9M22 15v2M25 15v2" />
    </>
  ),
  PSU: (
    <>
      <rect x="4" y="7" width="24" height="18" rx="1.5" />
      <circle cx="13" cy="16" r="5" />
      <path d="M13 11v10M8 16h10M23 11v3M23 18v3" />
    </>
  ),
  CASE: (
    <>
      <rect x="9" y="3" width="14" height="26" rx="1.5" />
      <path d="M12 7h8M12 10h8" />
      <circle cx="16" cy="21" r="3.5" />
    </>
  ),
  COOLER: (
    <>
      <rect x="5" y="5" width="22" height="22" rx="1.5" />
      <circle cx="16" cy="16" r="2" />
      <path d="M16 14c0-4 2-6 5-6M18 16c4 0 6 2 6 5M16 18c0 4-2 6-5 6M14 16c-4 0-6-2-6-5" />
    </>
  ),
};

export function CategoryIcon({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {GLYPHS[category]}
    </svg>
  );
}
