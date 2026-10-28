// Where the E2E tests find the app. Shared by playwright.config.ts and specs.
export const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * A second server from the same build whose database cannot be reached, to
 * test the error boundary. Not started when testing a remote E2E_BASE_URL.
 */
export const BROKEN_DB_PORT = PORT + 1;
export const brokenDbURL = process.env.E2E_BASE_URL
  ? undefined
  : `http://localhost:${BROKEN_DB_PORT}`;
