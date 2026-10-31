import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import {
  BROKEN_DB_PORT,
  E2E_PAGE_SIZE,
  PORT,
  testDatabaseURL,
} from "./e2e/servers";

// `npm run test:e2e` is self-contained: it builds, starts a production server
// on port 3100 over its own database (reset by e2e/global-setup.ts), and runs
// the specs. E2E_SKIP_BUILD=1 reuses the last build. A server is never
// reused, so the tests cannot end up reading the development database.
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const build = process.env.E2E_SKIP_BUILD ? "" : "npm run build && ";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Locally, the default worker count crashed Chromium (0xC0000409) next to
  // Docker and the two Next servers; CI keeps Playwright's default.
  workers: process.env.CI ? undefined : 2,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Started one after the other, so the second reuses the first one's build.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: `${build}npm run start -- -p ${PORT}`,
          url: baseURL,
          env: {
            ...(process.env as Record<string, string>),
            DATABASE_URL: testDatabaseURL(),
            CATALOG_PAGE_SIZE: String(E2E_PAGE_SIZE),
          },
          reuseExistingServer: false,
          timeout: 300_000,
        },
        {
          // Nothing listens on port 9, so every database query fails.
          command: `npm run start -- -p ${BROKEN_DB_PORT}`,
          url: `http://localhost:${BROKEN_DB_PORT}`,
          env: {
            ...(process.env as Record<string, string>),
            DATABASE_URL: "postgresql://custompc:custompc@127.0.0.1:9/custompc",
          },
          // Its database errors are expected; keep them out of the log.
          stderr: "ignore",
          reuseExistingServer: false,
          timeout: 60_000,
        },
      ],
});
