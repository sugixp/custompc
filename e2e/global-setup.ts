import { execSync } from "node:child_process";
import pg from "pg";
import { testDatabaseURL } from "./servers";

/**
 * Recreates the E2E database before every run: migrations, the seed, then
 * the aged offers that e2e/offers.spec.ts expects. Playwright starts the web
 * servers first, which is fine: they open no connection until a test asks
 * for a page.
 */
export default async function globalSetup() {
  // A remote target brings its own data.
  if (process.env.E2E_BASE_URL) return;

  const url = new URL(testDatabaseURL());
  const name = decodeURIComponent(url.pathname.slice(1));
  // This database is dropped, so refuse anything that is not clearly a test one.
  if (!/^[a-z0-9_]+_test$/.test(name)) {
    throw new Error(
      `Refusing to reset "${name}": the E2E database must end in _test`,
    );
  }

  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new pg.Client({ connectionString: admin.href });
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${name}"`);
  } finally {
    await client.end();
  }

  const run = (command: string, env: Record<string, string> = {}) =>
    execSync(command, {
      stdio: ["ignore", "ignore", "inherit"],
      env: { ...process.env, DATABASE_URL: url.href, ...env },
    });
  run("npx prisma migrate deploy");
  run("npx prisma db seed");
  run("npx tsx scripts/sync-prices.ts", {
    PRICE_PROVIDERS: "./e2e/fixtures/aged-offers.ts",
  });
}
