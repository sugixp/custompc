// Records the README's builder GIF into docs/screenshots/builder.gif: a
// Playwright video of a build put together part by part, converted by
// ffmpeg (must be on PATH). Needs the app running with a seeded database,
// like `npm run screenshots`; SCREENSHOT_BASE_URL overrides the address,
// e.g. the production URL.
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Page } from "@playwright/test";

const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3100";
const output = "docs/screenshots/builder.gif";
const size = { width: 1280, height: 800 };

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

/** Opens a slot's picker, types a search and picks a part, at reading pace. */
async function pick(page: Page, label: string, search: string, name: string) {
  await page.getByRole("button", { name: `Escolher (${label})` }).click();
  const dialog = page.getByRole("dialog", { name: `Escolher: ${label}` });
  await dialog.getByLabel("Buscar").pressSequentially(search, { delay: 60 });
  await pause(page, 500);
  await dialog.getByRole("button", { name: `Escolher ${name}` }).click();
  await dialog.waitFor({ state: "hidden" });
  await pause(page, 700);
}

async function record(page: Page) {
  await page.goto(new URL("/montar", baseURL).href, {
    waitUntil: "networkidle",
  });
  await pause(page, 1000);
  await pick(page, "Processador", "7600", "AMD Ryzen 5 7600");

  // An AM4 board next to an AM5 CPU: the picker says why it does not fit.
  await page.getByRole("button", { name: "Escolher (Placa-mãe)" }).click();
  const boards = page.getByRole("dialog", { name: "Escolher: Placa-mãe" });
  await pause(page, 600);
  await boards.getByLabel("Mostrar só compatíveis com a build atual").uncheck();
  await boards
    .getByRole("listitem")
    .filter({ hasText: "PRIME B550M-A" })
    .scrollIntoViewIfNeeded();
  await pause(page, 2200);
  await boards.getByRole("button", { name: "Fechar" }).click();

  await pick(page, "Placa-mãe", "b650m", "ASUS TUF GAMING B650M-PLUS WIFI");
  await pick(
    page,
    "Memória RAM",
    "6000 2x16",
    "Kingston FURY Beast DDR5-6000 CL30 2x16GB (KF560C30BBEK2-32)",
  );
  await pick(
    page,
    "Placa de vídeo",
    "5070",
    "ASUS Prime GeForce RTX 5070 12GB",
  );
  await pick(
    page,
    "Armazenamento",
    "nv3 1tb",
    "Kingston NV3 1TB (SNV3S/1000G)",
  );
  await pick(page, "Fonte", "750w gold", "ASUS TUF Gaming 750W Gold");
  await pick(page, "Gabinete", "meshify", "Fractal Design Meshify 2 Compact");
  await page
    .getByRole("region", { name: "Compatibilidade" })
    .scrollIntoViewIfNeeded();
  await pause(page, 2500);
}

async function main() {
  const workDir = await mkdtemp(join(tmpdir(), "custompc-gif-"));
  try {
    // The video is complete only once the browser is closed.
    const browser = await chromium.launch();
    let webm: string;
    try {
      const context = await browser.newContext({
        viewport: size,
        locale: "pt-BR",
        recordVideo: { dir: workDir, size },
      });
      const page = await context.newPage();
      await record(page);
      await context.close();
      webm = await page.video()!.path();
    } finally {
      await browser.close();
    }
    // Two passes through one palette keep colors clean at a small size.
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-i",
        webm,
        "-vf",
        "fps=8,scale=960:-1:flags=lanczos,split[a][b];" +
          "[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
        output,
      ],
      { stdio: "inherit" },
    );
    console.log(`saved ${output}`);
  } finally {
    await rm(workDir, { recursive: true, force: true, maxRetries: 5 });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
