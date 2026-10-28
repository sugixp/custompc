import type { SyncReport } from "./sync";

/** A short, human-readable summary of a sync run for the command line. */
export function formatSyncReport(
  providerIds: readonly string[],
  report: SyncReport,
): string {
  const lines = [
    `Providers: ${providerIds.join(", ")}`,
    `Offers written: ${report.written}`,
  ];

  const byReason = new Map<string, number>();
  for (const { source, reason } of report.rejected) {
    const key = `${source}: ${reason}`;
    byReason.set(key, (byReason.get(key) ?? 0) + 1);
  }
  for (const [key, count] of [...byReason].sort())
    lines.push(`Rejected (${key}): ${count}`);

  for (const { providerId, error } of report.failedProviders) {
    lines.push(`FAILED ${providerId}: ${error}`);
  }
  return lines.join("\n");
}
