import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryGrid } from "@/components/category-grid";
import { DEFAULT_OG_IMAGE } from "@/og/size";

const description =
  "Catálogo de peças para PC com especificações dos fabricantes e preços em lojas brasileiras.";

export const metadata: Metadata = {
  title: "Peças",
  description,
  alternates: { canonical: "/pecas" },
  openGraph: {
    title: "Peças para PC",
    description,
    url: "/pecas",
    images: DEFAULT_OG_IMAGE,
  },
};

export default function PartsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "Início", href: "/" }, { label: "Peças" }]}
      />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Peças</h1>
      <p className="mt-2 max-w-2xl text-muted">{description}</p>
      <div className="mt-8">
        <CategoryGrid />
      </div>
    </div>
  );
}
