import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-[4px] bg-accent text-[11px] font-semibold text-accent-ink"
          >
            cp
          </span>
          custompc
        </Link>
        <nav aria-label="Principal">
          <ul className="flex items-center gap-1 text-sm">
            <li>
              <Link
                href="/pecas"
                className="rounded-panel px-3 py-2 text-muted transition-colors hover:bg-raised hover:text-text"
              >
                Peças
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
