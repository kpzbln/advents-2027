const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const infoRoot = path.join(root, "img", "advent-kinder", "info");
const outputRoot = path.join(root, "img", "advent-kinder");

const productCrops = {
  "kinder-love": { left: 790, top: 330, width: 410, height: 420 },
  "mini-eggs-green": { left: 0, top: 760, width: 520, height: 440 },
  "mini-eggs-blue": { left: 760, top: 0, width: 440, height: 380 },
  "kinder-bueno": { left: 430, top: 740, width: 770, height: 460 },
  "kinder-country": { left: 0, top: 0, width: 480, height: 430 },
  "schoko-bons": { left: 0, top: 330, width: 430, height: 450 },
};

const qrDays = [5, 8, 12, 15, 19, 23, 27];

async function findInfoFile(part) {
  const file = (await fs.readdir(infoRoot)).find((name) => name.includes(part));
  if (!file) throw new Error(`Missing Kinder info asset: ${part}`);
  return path.join(infoRoot, file);
}

async function main() {
  const source = await findInfoFile("Содержимое");
  const frontSource = await findInfoFile("Лицевая сторона (Закрыта)");
  const backSource = await findInfoFile("Задняя сторона (Закрыта)");
  const sourceImage = sharp(source);

  await fs.mkdir(path.join(outputRoot, "products"), { recursive: true });
  await fs.mkdir(path.join(outputRoot, "qr"), { recursive: true });

  await sourceImage.webp({ quality: 88 }).toFile(path.join(outputRoot, "contents.webp"));
  await sharp(frontSource).webp({ quality: 90 }).toFile(path.join(outputRoot, "front-closed.webp"));
  await sharp(backSource).webp({ quality: 90 }).toFile(path.join(outputRoot, "back-closed.webp"));

  for (const [name, crop] of Object.entries(productCrops)) {
    await sourceImage.clone().extract(crop).webp({ quality: 88 }).toFile(
      path.join(outputRoot, "products", `${name}.webp`),
    );
  }

  for (const day of qrDays) {
    const sourceQr = path.join(infoRoot, `qr_${day}.png`);
    await sharp(sourceQr).resize(256, 256, { fit: "contain", background: "#ffffff" })
      .webp({ quality: 94 }).toFile(path.join(outputRoot, "qr", `${String(day).padStart(2, "0")}.webp`));
  }

  console.log(`Kinder assets generated: ${Object.keys(productCrops).length} products, ${qrDays.length} QR codes.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
