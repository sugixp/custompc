// Captures README screenshots into docs/screenshots. Needs the app running
// with a seeded database: `npm run build && npm run start -- -p 3100`, then
// `npm run screenshots` (SCREENSHOT_BASE_URL overrides the address).
import { mkdir } from "node:fs/promises";
import { chromium, devices } from "@playwright/test";

const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3100";
const outDir = "docs/screenshots";

const pages = [
  { name: "home", path: "/" },
  { name: "listing", path: "/pecas/processadores" },
  { name: "detail", path: "/pecas/placas-de-video/asus-prime-rtx-5070-12g" },
  {
    name: "builder",
    path:
      "/montar?cpu=amd-ryzen-5-7600&placa=asus-tuf-gaming-b650m-plus-wifi" +
      "&ram=kingston-fury-beast-ddr5-6000-cl30-2x16gb&gpu=asus-tuf-rtx-5080-16g-gaming" +
      "&disco=kingston-nv3-1tb&fonte=asus-tuf-gaming-750w-gold" +
      "&gabinete=fractal-meshify-2-compact&cooler=deepcool-ak400",
  },
];

const viewports = [
  {
    name: "desktop",
    options: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  },
  { name: "mobile", options: { ...devices["Pixel 7"] } },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const { name: viewport, options } of viewports) {
      // Reduced motion keeps the home page demo on its poster.
      const context = await browser.newContext({
        ...options,
        locale: "pt-BR",
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      for (const { name, path } of pages) {
        await page.goto(new URL(path, baseURL).href, {
          waitUntil: "networkidle",
        });
        // Wait for streamed content to replace the skeletons.
        await page.waitForFunction(
          () => !document.querySelector('[role="status"]'),
        );
        const file = `${outDir}/${name}-${viewport}.png`;
        // Full-page shots on phones, except the builder, whose fixed summary
        // bar would land mid-image; its viewport shot shows the bar in place.
        const fullPage = viewport === "mobile" && name !== "builder";
        await page.screenshot({ path: file, fullPage });
        console.log(`saved ${file}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
