import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The domain is plain TypeScript: no framework, database or UI imports, so
  // the compatibility rules stay pure and testable without Next or Postgres.
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*", "react", "react/*", "react-dom"],
              message: "src/domain must not depend on the UI framework.",
            },
            {
              group: ["@prisma/*", "@/generated/*"],
              message: "src/domain must not depend on the database.",
            },
            {
              group: ["@/app/*", "@/components/*", "@/server/*", "@/pricing/*"],
              message: "src/domain is the innermost layer; nothing outside it.",
            },
          ],
        },
      ],
    },
  },
  // src/pricing defines the provider contract and the sync; storage is
  // reached through the OfferRepository port, implemented in src/server.
  {
    files: ["src/pricing/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@prisma/*", "@/generated/*", "@/server/*", "@/app/*"],
              message:
                "src/pricing talks to storage through OfferRepository only.",
            },
          ],
        },
      ],
    },
  },
  // Formatting is Prettier's job; turn off the rules that would fight it.
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
