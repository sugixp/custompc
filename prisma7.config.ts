// Prisma ORM 7 config. Prisma 7.10+ reads prisma7.config.ts so it does not
// clash with the Prisma 8 format, which owns prisma.config.ts.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 never seeds implicitly; run `npm run db:seed`.
    seed: "tsx prisma/seed.ts",
  },
  // Read directly instead of with env(), which throws when the variable is
  // unset: `prisma generate` runs on npm install and needs no database.
  // Commands that do need one still fail with a clear message.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
