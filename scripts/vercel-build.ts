// The build Vercel runs (`vercel-build` in package.json). Only production
// deploys apply migrations; previews build against the schema already there
// and never write to the database. Seeding is separate: npm run db:seed:prod.
import { execSync } from "node:child_process";

const run = (command: string) => execSync(command, { stdio: "inherit" });

if (process.env.VERCEL_ENV === "production") {
  run("npx prisma migrate deploy");
} else {
  console.log(
    `Skipping migrations: VERCEL_ENV is "${process.env.VERCEL_ENV ?? "unset"}", not production.`,
  );
}
run("npx next build");
