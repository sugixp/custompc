import Link from "next/link";

export default function PartNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="spec-label text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Peça não encontrada</h1>
      <p className="mt-2 text-muted">
        Ela pode ter saído do catálogo ou o link está incompleto.
      </p>
      <Link
        href="/pecas"
        className="mt-6 inline-block rounded-panel border border-line-strong px-4 py-2 hover:border-accent hover:text-accent"
      >
        Ver o catálogo
      </Link>
    </div>
  );
}
