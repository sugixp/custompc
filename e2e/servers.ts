// Where the E2E tests find the app and its data. Shared by
// playwright.config.ts, the global setup and the specs.
export const PORT = Number(process.env.E2E_PORT ?? 3100);

/** Listing page size on the E2E server, so the 15 seed CPUs span three pages. */
export const E2E_PAGE_SIZE = 5;

/**
 * The database the E2E server reads, reset by e2e/global-setup.ts: the
 * DATABASE_URL server with a database of its own, so the tests never touch
 * the development data. E2E_DATABASE_URL overrides it.
 */
export function testDatabaseURL(): string {
  if (process.env.E2E_DATABASE_URL) return process.env.E2E_DATABASE_URL;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set; the E2E database is derived from it",
    );
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = "/custompc_test";
  return url.href;
}

/**
 * A second server from the same build whose database cannot be reached, to
 * test the error boundary. Not started when testing a remote E2E_BASE_URL.
 */
export const BROKEN_DB_PORT = PORT + 1;
export const brokenDbURL = process.env.E2E_BASE_URL
  ? undefined
  : `http://localhost:${BROKEN_DB_PORT}`;
