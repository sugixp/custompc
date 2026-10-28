// node-postgres already treats these modes as verify-full (and warns that it
// does). Neon's URLs say sslmode=require.
const VERIFIED_BY_PG = new Set(["prefer", "require", "verify-ca"]);

/**
 * The connection string for the pg driver, with sslmode=verify-full spelled
 * out when pg would verify the certificate anyway: same behavior, no
 * security warning on every start. Other strings are returned unchanged.
 *
 * Not for migrations: Prisma's schema engine does not know verify-full and
 * silently connects without TLS when given it, so DATABASE_URL_UNPOOLED
 * keeps sslmode=require.
 */
export function pgConnectionString(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }
  const mode = url.searchParams.get("sslmode");
  if (!mode || !VERIFIED_BY_PG.has(mode)) return connectionString;
  url.searchParams.set("sslmode", "verify-full");
  return url.href;
}
