import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="spec-label text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-muted">O endereço não existe ou mudou.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-panel border border-line-strong px-4 py-2 hover:border-accent hover:text-accent"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
