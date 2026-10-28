import type { SpecRow } from "@/catalog/specs";

/** Datasheet-style list: label, dotted leader, value. */
export function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <dl className="divide-y divide-line/60">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline gap-3 py-2.5">
          <dt className="spec-label shrink-0">{row.label}</dt>
          <span aria-hidden="true" className="leader" />
          <dd className="tabular text-right text-sm">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
