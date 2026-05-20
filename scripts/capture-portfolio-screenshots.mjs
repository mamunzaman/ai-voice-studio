/**
 * Captures portfolio screenshots from a running local server.
 * Usage: node scripts/capture-portfolio-screenshots.mjs
 * Env: SCREENSHOT_BASE_URL (default http://127.0.0.1:3001)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const BASE_URL = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:3001";

const VIEWPORT = { width: 1440, height: 1000 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const SAMPLE_TEXT =
  "Willkommen bei AI Voice Studio. Diese Demo zeigt realistische deutsche KI-Sprache mit bayerischer und hochdeutscher Stimme.";

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

async function waitForTurnstileReady(page) {
  await page.waitForSelector("[data-turnstile-container]", { timeout: 45000 });
  await page.waitForFunction(
    () => {
      const container = document.querySelector("[data-turnstile-container]");
      return container && container.childElementCount > 0;
    },
    { timeout: 45000 }
  );
  await page.waitForTimeout(1500);
}

async function unlockDemo(page, password) {
  await page.fill("#demo-password", password);
  await page.waitForFunction(
    () => {
      const button = document.querySelector('button[type="submit"]');
      return button && !button.hasAttribute("disabled");
    },
    { timeout: 120000 }
  );
  await page.click('button[type="submit"]');
  await page.getByRole("heading", { name: "Input Your Text" }).waitFor({
    timeout: 20000,
  });
}

async function main() {
  const env = loadEnvFile(path.join(ROOT, ".env.local"));
  const password = env.DEMO_PASSWORD || env.NEXT_PUBLIC_DEMO_PASSWORD;

  if (!password) {
    console.error("Missing DEMO_PASSWORD in .env.local");
    process.exit(1);
  }

  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: process.env.SCREENSHOT_HEADED !== "1",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  const page = await context.newPage();

  try {
    console.log(`Opening ${BASE_URL} ...`);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    await waitForTurnstileReady(page);
    await page.screenshot({
      path: path.join(OUT_DIR, "password-gate.png"),
      type: "png",
    });
    console.log("Saved password-gate.png");

    await unlockDemo(page, password);

    await page.locator("textarea").fill(SAMPLE_TEXT);
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(OUT_DIR, "voice-studio.png"),
      type: "png",
    });
    console.log("Saved voice-studio.png");

    await page.getByRole("button", { name: "Generate Voice" }).click();
    await page.getByRole("link", { name: "Download MP3" }).waitFor({
      timeout: 120000,
    });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(OUT_DIR, "audio-player.png"),
      type: "png",
    });
    console.log("Saved audio-player.png");

    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.waitForTimeout(400);
    const mobileOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    if (mobileOverflow) {
      console.warn("Warning: horizontal overflow detected on mobile viewport.");
    } else {
      console.log("Mobile layout check: OK (no horizontal overflow).");
    }
  } finally {
    await browser.close();
  }

  console.log(`Screenshots written to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
