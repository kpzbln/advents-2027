const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const imageRoot = path.join(root, "img", "advent-payot");
const archiveRoot = path.join(root, ".tools", "original-images", "advent-payot");

function inside(parent, target) {
  const relative = path.relative(parent, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Image path escapes its directory: ${target}`);
  }
}

async function filesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const result = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(target));
    else if (entry.isFile()) result.push(target);
  }
  return result;
}

async function main() {
  const originals = new Map();
  for (const file of await filesIn(archiveRoot)) {
    if (file.endsWith(".png")) originals.set(path.relative(archiveRoot, file), file);
  }
  const localPngs = (await filesIn(imageRoot)).filter((file) => file.endsWith(".png"));
  for (const file of localPngs) originals.set(path.relative(imageRoot, file), file);
  const active = [...originals.entries()].filter(([relative]) =>
    /^(calendar-progress|current-date|next-unlock)\.png$/.test(relative) ||
    /^gifts[/\\].+_illustration\.png$/.test(relative));
  if (active.length !== 51) throw new Error(`Expected 51 PAYOT images, found ${active.length}`);

  let before = 0;
  let after = 0;
  for (const [relative, input] of active) {
    const output = path.join(imageRoot, relative.replace(/\.png$/, ".webp"));
    inside(imageRoot, output);
    await fs.mkdir(path.dirname(output), { recursive: true });
    const isGift = relative.startsWith(`gifts${path.sep}`);
    const maxSize = relative === "calendar-progress.png" ? 1080 : isGift ? 720 : 540;
    const result = await sharp(input)
      .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, effort: 6 })
      .toBuffer();
    await fs.writeFile(output, result);
    before += (await fs.stat(input)).size;
    after += result.length;
  }

  // Keep lossless sources outside the served image directory and Git payload.
  for (const file of localPngs) {
    const target = path.join(archiveRoot, path.relative(imageRoot, file));
    inside(imageRoot, file);
    inside(archiveRoot, target);
    await fs.mkdir(path.dirname(target), { recursive: true });
    try {
      await fs.access(target);
      // Preserve both versions if the source was replaced since the last run.
      const [existing, current] = await Promise.all([fs.readFile(target), fs.readFile(file)]);
      if (!existing.equals(current)) {
        await fs.rename(target, `${target}.${Date.now()}.bak`);
      } else {
        await fs.unlink(file);
        continue;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await fs.rename(file, target);
  }
  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
  console.log(`PAYOT: ${active.length} WebP images; ${mb(before)} -> ${mb(after)} MiB (${(100 - after / before * 100).toFixed(1)}% smaller)`);
  console.log(`PNG sources preserved in ${archiveRoot}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
