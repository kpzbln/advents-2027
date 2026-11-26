const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

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
  .filter((file) => /\.(?:webp|png|jpg|jpeg|svg)$/i.test(file))
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

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Project validation passed (${cachedAssets.length} cached images).`);
}
