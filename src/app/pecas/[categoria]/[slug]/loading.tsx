import { PartDetailSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div
        className="h-5 w-64 animate-pulse rounded-panel bg-raised"
        aria-hidden="true"
      />
      <div className="mt-6">
        <PartDetailSkeleton />
      </div>
    </div>
  );
}
