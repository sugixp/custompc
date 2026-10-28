import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Creates a Prisma client over the pg driver adapter. Pages use the shared
 * client in db.ts; command-line scripts (seed, price sync) call this, since
 * db.ts is marked server-only and cannot load outside Next.js.
 */
export function createPrismaClient(
  connectionString = process.env.DATABASE_URL,
): PrismaClient {
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
