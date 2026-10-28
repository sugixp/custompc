// Loads the example catalog into the production database. Run by hand or by
// the "Seed production" workflow, never by a deploy:
//
//   PRODUCTION_DATABASE_URL="postgresql://…" npm run db:seed:prod
//
// It reads PRODUCTION_DATABASE_URL, not DATABASE_URL, so a development .env
// can never point it at production by accident, or the other way round.
// The seed is idempotent; migrations must already be applied (deploys do it).
import { execSync } from "node:child_process";

const url = process.env.PRODUCTION_DATABASE_URL;
if (!url) {
  console.error("PRODUCTION_DATABASE_URL is not set.");
  process.exit(1);
}
execSync("npx prisma db seed", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url },
});
