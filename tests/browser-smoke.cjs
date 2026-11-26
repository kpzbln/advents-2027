const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");
const test = require("node:test");
const { chromium } = require("playwright-core");

const root = path.resolve(__dirname, "..");
const port = 4174;
const baseUrl = `http://127.0.0.1:${port}`;
const browserCandidates = [
  process.env.BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));

function waitForServer() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 10000;
    const check = () => {
      const request = http.get(`${baseUrl}/`, (response) => {
        response.resume();
        if (response.statusCode === 200) resolve();
        else retry();
      });
      request.on("error", retry);
    };
    const retry = () => {
      if (Date.now() >= deadline) reject(new Error("Local dev server did not start"));
      else setTimeout(check, 100);
    };
    check();
  });
}

if (!browserPath) {
  test("browser smoke tests require Edge or Chrome", { skip: "Set BROWSER_PATH to a Chromium browser executable" }, () => {});
} else {
  let server;
  let browser;

  test.before(async () => {
    server = spawn(process.execPath, ["scripts/dev-server.cjs"], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
    });
    await waitForServer();
    browser = await chromium.launch({ executablePath: browserPath, headless: true });
  });

  test.after(async () => {
    await browser?.close();
    server?.kill();
  });

  async function newPage() {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => {
      const NativeDate = Date;
      const fixedTime = new NativeDate(2026, 10, 26, 12, 0, 0).getTime();
      class FixedDate extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [fixedTime]));
        }

        static now() {
          return fixedTime;
        }
      }
      globalThis.Date = FixedDate;
    });
    return page;
  }

  test("landing page disables Kinder Mix and exposes calendar cards", async () => {
    const page = await newPage();
    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await page.locator("#calendar-list").waitFor();
    assert.equal(await page.title(), "Адвенты — уютный декабрь");
    assert.ok(
      ["flex", "inline-flex"].includes(
        await page.locator('[data-calendar-id="payot"] .calendar-status-icon').evaluate((element) => getComputedStyle(element).display),
      ),
    );
    const kinder = page.locator('[data-calendar-id="kinder-mix"]');
    assert.equal(await kinder.evaluate((element) => element.tagName), "DIV");
    assert.equal(await kinder.getAttribute("aria-disabled"), "true");
    assert.equal(await kinder.getAttribute("href"), null);
    assert.match(await kinder.textContent(), /Скоро/);
    await page.close();
  });

  test("Hello Kitty uses the shared progress wording and daily lock state", async () => {
    const page = await newPage();
    await page.goto(`${baseUrl}/advent-hello-kitty.html`, { waitUntil: "domcontentloaded" });
    await page.locator(".calendar-progress-text").waitFor();
    assert.equal(await page.title(), "Hello Kitty — Адвенты");
    assert.equal(await page.locator(".calendar-progress-text").textContent(), "Открыто 0 из 24");
    assert.equal(await page.locator(".calendar-door-locked").count(), 24);
    assert.equal(await page.locator(".next-unlock-text").textContent(), "1 декабря в 06:00");
    await page.close();
  });

  test("Kinder Mix hash navigation does not enter an unfinished calendar", async () => {
    const page = await newPage();
    await page.goto(`${baseUrl}/index.html#calendar/kinder-mix`, { waitUntil: "domcontentloaded" });
    await page.locator("#calendar-list").waitFor();
    assert.equal(new URL(page.url()).hash, "");
    assert.equal(await page.locator("#selection-page").isHidden(), false);
    await page.close();
  });

  test("PAYOT exposes its release metadata and daily progress", async () => {
    const page = await newPage();
    await page.goto(`${baseUrl}/advent-payot.html`, { waitUntil: "domcontentloaded" });
    await page.locator(".calendar-progress-text").waitFor();
    assert.equal(await page.title(), "PAYOT — Адвенты");
    assert.equal(await page.locator(".calendar-progress-text").textContent(), "Открыто 0 из 24");
    assert.equal(await page.locator("meta[property='og:title']").getAttribute("content"), "PAYOT — Адвенты");
    await page.close();
  });
}
