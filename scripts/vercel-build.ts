// The build Vercel runs (`vercel-build` in package.json). Production deploys
// migrate the production branch. Preview deploys migrate their own Neon
// branch, which the Neon integration injects per deployment, and refuse to
// migrate when the URL still points at production (PRODUCTION_DATABASE_HOST,
// a Preview-only variable, names that host; without it previews never
// migrate). Seeding is separate: npm run db:seed:prod.
import { execSync } from "node:child_process";

const run = (command: string) => execSync(command, { stdio: "inherit" });

// "ep-shy-haze-123" for both the direct and the "-pooler" host.
const endpointId = (host: string) =>
  host.split(".")[0]?.replace(/-pooler$/, "");

function previewMayMigrate(): string | null {
  const productionHost = process.env.PRODUCTION_DATABASE_HOST;
  if (!productionHost) return "PRODUCTION_DATABASE_HOST is not set";
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) return "no database URL";
  const host = new URL(url).hostname;
  if (endpointId(host) === endpointId(productionHost)) {
    return "the database URL points at the production branch";
  }
  return null;
}

const env = process.env.VERCEL_ENV;
if (env === "production") {
  run("npx prisma migrate deploy");
} else if (env === "preview") {
  const reason = previewMayMigrate();
  if (reason === null) {
    run("npx prisma migrate deploy");
  } else {
    console.log(`Skipping migrations on this preview: ${reason}.`);
  }
} else {
  console.log(`Skipping migrations: VERCEL_ENV is "${env ?? "unset"}".`);
}
run("npx next build");
