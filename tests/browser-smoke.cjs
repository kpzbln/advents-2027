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

  async function newPage(fixedDate = [2026, 10, 26, 12, 0, 0]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(({ dateParts }) => {
      const NativeDate = Date;
      const fixedTime = new NativeDate(...dateParts).getTime();
      class FixedDate extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [fixedTime]));
        }

        static now() {
          return fixedTime;
        }
      }
      globalThis.Date = FixedDate;
    }, { dateParts: fixedDate });
    return page;
  }

  test("landing page exposes all three calendar cards", async () => {
    const page = await newPage();
    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await page.locator("#calendar-list").waitFor();
    assert.equal(await page.title(), "Адвенты — уютный декабрь");
    const kinder = page.locator('[data-calendar-id="kinder-mix"]');
    assert.equal(await kinder.evaluate((element) => element.tagName), "A");
    assert.equal(await kinder.getAttribute("href"), "advent-kinder.html");
    assert.match(await kinder.textContent(), /Открыто 0 из 31/);
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

  test("Kinder Mix opens as a 31-day calendar", async () => {
    const page = await newPage();
    await page.goto(`${baseUrl}/advent-kinder.html`, { waitUntil: "domcontentloaded" });
    await page.locator(".kinder-progress").waitFor();
    assert.equal(await page.title(), "Kinder Mix — Адвенты");
    assert.equal(await page.locator(".kinder-progress").textContent(), "Открыто 0 из 31");
    assert.equal(await page.locator(".kinder-day").count(), 31);
    assert.equal(await page.locator(".kinder-day:disabled").count(), 31);
    assert.equal(await page.locator("#kinder-next-unlock").textContent(), "1 декабря в 06:00");
    await page.close();
  });

  test("Kinder Mix opens a sweet gift and a QR game", async () => {
    const page = await newPage([2026, 11, 5, 6, 0, 0]);
    await page.goto(`${baseUrl}/advent-kinder.html`, { waitUntil: "domcontentloaded" });
    await page.locator('.kinder-day[data-day="1"]').click();
    await page.locator(".kinder-modal-confirm").click();
    assert.equal(await page.locator("#kinder-modal-result-title").textContent(), "Kinder Mini Eggs");
    assert.equal(await page.locator(".kinder-progress").textContent(), "Открыто 1 из 31");
    await page.locator(".kinder-modal-close-result").click();
    await page.locator('.kinder-day[data-day="5"]').click();
    await page.locator(".kinder-modal-confirm").click();
    assert.equal(await page.locator("#kinder-modal-qr").isHidden(), false);
    assert.match(await page.locator("#kinder-modal-link").getAttribute("href"), /214nao/);
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
