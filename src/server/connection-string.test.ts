import { describe, expect, it } from "vitest";
import { pgConnectionString } from "./connection-string";

const neon =
  "postgresql://app:secret@ep-x-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

describe("pgConnectionString", () => {
  it("spells out verify-full where pg would verify anyway", () => {
    const url = new URL(pgConnectionString(neon));
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
    expect(url.searchParams.get("channel_binding")).toBe("require");
    expect(url.password).toBe("secret");
  });

  it.each([
    "postgresql://custompc:custompc@localhost:5432/custompc",
    "postgresql://u:p@host/db?sslmode=disable",
    "postgresql://u:p@host/db?sslmode=verify-full",
  ])("leaves %s unchanged", (connectionString) => {
    expect(pgConnectionString(connectionString)).toBe(connectionString);
  });
});
