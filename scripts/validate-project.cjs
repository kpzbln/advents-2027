const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && [".git", ".tools", "node_modules"].includes(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function checkExists(relativePath, source) {
  const normalized = relativePath.replace(/^\.\//, "");
  if (!fs.existsSync(path.join(root, normalized))) {
    failures.push(`${source}: missing ${relativePath}`);
  }
}

function requireText(value, source, field) {
  if (typeof value !== "string" || !value.trim()) failures.push(`${source}: ${field} must be a non-empty string`);
}

function requireDayKeys(value, total, source) {
  const keys = Object.keys(value || {});
  const expected = Array.from({ length: total }, (_, index) => String(index + 1));
  if (keys.length !== total || expected.some((day) => !keys.includes(day))) {
    failures.push(`${source}: expected exactly days 1-${total}`);
  }
  return expected;
}

function loadCalendarData() {
  try {
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(path.join(root, "calendar-data.js"), "utf8"), context, { filename: "calendar-data.js" });
    return context.AdventCalendarData;
  } catch (error) {
    failures.push(`calendar-data.js: unable to load content (${error.message})`);
    return null;
  }
}

function validateCalendarContent() {
  const data = loadCalendarData();
  if (!data) return;

  const payot = data.payot;
  const payotDays = requireDayKeys(payot?.giftFiles, 24, "calendar-data.js / payot.giftFiles");
  requireDayKeys(payot?.giftDetails, 24, "calendar-data.js / payot.giftDetails");
  for (const day of payotDays) {
    const files = payot?.giftFiles?.[day];
    if (!Array.isArray(files) || files.length !== 2) {
      failures.push(`calendar-data.js / payot day ${day}: expected box and product images`);
    } else {
      files.forEach((file) => { requireText(file, `calendar-data.js / payot day ${day}`, "image"); checkExists(`img/advent-payot/gifts/${file}`, `calendar-data.js / payot day ${day}`); });
    }
    const details = payot?.giftDetails?.[day];
    for (const field of ["caption", "category", "description"]) requireText(details?.[field], `calendar-data.js / payot day ${day}`, field);
  }

  const helloKitty = data.helloKitty;
  for (const day of requireDayKeys(helloKitty, 24, "calendar-data.js / helloKitty")) {
    const gift = helloKitty?.[day];
    for (const field of ["caption", "category", "description", "image"]) requireText(gift?.[field], `calendar-data.js / helloKitty day ${day}`, field);
    if (gift?.image) checkExists(gift.image, `calendar-data.js / helloKitty day ${day}`);
  }

  const kinder = data.kinder;
  for (const product of Object.entries(kinder?.products || {})) {
    const [id, details] = product;
    for (const field of ["title", "category", "quantity", "image"]) requireText(details?.[field], `calendar-data.js / kinder product ${id}`, field);
    if (details?.image) checkExists(details.image, `calendar-data.js / kinder product ${id}`);
  }
  const kinderDays = requireDayKeys(kinder?.days, 31, "calendar-data.js / kinder.days");
  for (const day of kinderDays) {
    const entry = kinder?.days?.[day];
    if (entry?.type === "gift") {
      if (!entry.product || !kinder?.products?.[entry.product]) failures.push(`calendar-data.js / kinder day ${day}: unknown product ${entry.product || "(empty)"}`);
    } else if (entry?.type === "game") {
      for (const field of ["title", "description", "qr", "url"]) requireText(entry?.[field], `calendar-data.js / kinder day ${day}`, field);
      if (entry?.qr) checkExists(`img/advent-kinder/qr/${entry.qr}`, `calendar-data.js / kinder day ${day}`);
      if (entry?.url && !/^https:\/\//.test(entry.url)) failures.push(`calendar-data.js / kinder day ${day}: game URL must use HTTPS`);
    } else {
      failures.push(`calendar-data.js / kinder day ${day}: type must be gift or game`);
    }
  }
  for (const field of ["title", "url"]) requireText(kinder?.generalGame?.[field], "calendar-data.js / kinder.generalGame", field);
  if (kinder?.generalGame?.url && !/^https:\/\//.test(kinder.generalGame.url)) failures.push("calendar-data.js / kinder.generalGame: URL must use HTTPS");
}

for (const file of walk(root)) {
  if (!/\.(?:js|cjs)$/.test(file) || file.includes(`${path.sep}node_modules${path.sep}`)) continue;
  const result = childProcess.spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) failures.push(`${path.relative(root, file)}: ${result.stderr.trim()}`);
}

for (const htmlFile of walk(root).filter((file) => file.endsWith(".html"))) {
  const html = fs.readFileSync(htmlFile, "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|mailto:|javascript:)/i.test(reference)) continue;
    checkExists(reference, path.relative(root, htmlFile));
  }
}

const offlineFile = path.join(root, "offline-assets.js");
const offline = fs.readFileSync(offlineFile, "utf8");
const cachedAssets = [...offline.matchAll(/"(\.\/img\/[^"\n]+)"/g)].map((match) => match[1]);
for (const asset of cachedAssets) checkExists(asset, "offline-assets.js");
const imageFiles = walk(path.join(root, "img"))
  .filter((file) => /\.(?:webp|avif|png|svg)$/i.test(file))
  .map((file) => `./${path.relative(root, file).replaceAll(path.sep, "/")}`)
  .sort();
const cachedSorted = [...cachedAssets].sort();
if (JSON.stringify(imageFiles) !== JSON.stringify(cachedSorted)) {
  failures.push("offline-assets.js: image list is stale; run npm run optimize:images");
}

try {
  JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
} catch (error) {
  failures.push(`manifest.webmanifest: invalid JSON (${error.message})`);
}

validateCalendarContent();

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Project validation passed (${cachedAssets.length} cached images).`);
}
