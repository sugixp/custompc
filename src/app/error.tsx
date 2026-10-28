"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16" role="alert">
      <p className="spec-label text-error">Erro</p>
      <h1 className="mt-2 text-2xl font-semibold">
        Não foi possível carregar esta página
      </h1>
      <p className="mt-2 text-muted">
        O catálogo está temporariamente indisponível. Tente de novo em
        instantes.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-6 rounded-panel bg-accent px-4 py-2 font-medium text-accent-ink hover:brightness-110"
      >
        Tentar de novo
      </button>
    </div>
  );
}
