import { defineConfig, devices } from "@playwright/test";
import { BROKEN_DB_PORT, PORT } from "./e2e/servers";

// E2E tests run against the production build (`npm run build` first) with a
// migrated and seeded database. Port 3100 keeps them off a running dev server.
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
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
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: `npm run start -- -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
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
