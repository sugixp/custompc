import { REPOSITORY_URL } from "@/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-prose">
          Projeto de portfólio em desenvolvimento. Os preços são{" "}
          <strong className="font-medium text-text">ilustrativos</strong>, salvo
          os marcados como preço de referência, conferidos à mão na loja; as
          especificações vêm dos sites dos fabricantes, com a fonte indicada em
          cada peça.
        </p>
        <a
          href={REPOSITORY_URL}
          className="shrink-0 underline decoration-line-strong underline-offset-4 hover:text-text"
        >
          Código no GitHub
        </a>
      </div>
    </footer>
  );
}
