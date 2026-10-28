// Loading placeholders sized like the real content, so nothing jumps when
// the data streams in.

const block = "animate-pulse rounded-panel bg-raised";

export function PartGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando peças…</span>
      <ul
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        aria-hidden="true"
      >
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="h-44 rounded-panel border border-line bg-surface p-4"
          >
            <div className="flex gap-3">
              <div className={`${block} size-12`} />
              <div className="flex-1 space-y-2">
                <div className={`${block} h-3 w-16`} />
                <div className={`${block} h-4 w-3/4`} />
              </div>
            </div>
            <div className={`${block} mt-6 h-6 w-28`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <div className={`${block} h-64`} aria-hidden="true" />
      <PartGridSkeleton />
    </div>
  );
}

export function PartDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-6 lg:grid-cols-[1fr_22rem]"
    >
      <span className="sr-only">Carregando peça…</span>
      <div className="space-y-3" aria-hidden="true">
        <div className={`${block} h-24`} />
        <div className={`${block} h-16`} />
        <div className={`${block} h-16`} />
      </div>
      <div className={`${block} h-80`} aria-hidden="true" />
    </div>
  );
}
