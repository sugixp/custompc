import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClient } from "./prisma";

// Dev hot reload re-runs this module; reuse one client instead of opening a
// new connection pool on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * The shared Prisma client, created on first use. Importing this module never
 * needs DATABASE_URL, so builds that prerender only static shells work
 * without a database.
 */
export function getDb(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}
