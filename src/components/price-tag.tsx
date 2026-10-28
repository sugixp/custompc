import type { PriceSummary } from "@/catalog/offers";
import { formatBRL } from "@/domain/money/money";

export function PriceTag({
  price,
  size = "md",
}: {
  price: PriceSummary;
  size?: "md" | "lg";
}) {
  if (price.kind !== "price") {
    return (
      <p className="text-sm text-muted">
        {price.kind === "out-of-stock"
          ? "Esgotado nas lojas"
          : "Sem preço recente"}
      </p>
    );
  }
  return (
    <p className="flex flex-col">
      <span className="spec-label">A partir de</span>
      <span
        className={`tabular font-medium text-accent ${size === "lg" ? "text-3xl" : "text-lg"}`}
      >
        {formatBRL(price.fromCents)}
      </span>
    </p>
  );
}
