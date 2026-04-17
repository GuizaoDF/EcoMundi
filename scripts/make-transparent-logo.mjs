import path from "node:path";
import { Jimp, intToRGBA, rgbaToInt } from "jimp";

const repoRoot = process.cwd();

const inputPath =
  process.argv[2] ??
  path.join(
    repoRoot,
    "assets",
    "c__Users_guigu_AppData_Roaming_Cursor_User_workspaceStorage_11d54da3e2c4d6f1504338f0af2544cd_images_ChatGPT_Image_17_de_abr._de_2026__12_41_55-9ca7f54a-588d-475c-b30a-23293d4bb1db.png"
  );

const outputPath =
  process.argv[3] ?? path.join(repoRoot, "public", "images", "logo-eco-mundi-site.png");

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function colorDistance(a, b) {
  // Euclidean distance in RGB space (0..441.67)
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBackground(image) {
  // Sample 4 corners and average (works well for flat backgrounds)
  const points = [
    [2, 2],
    [image.bitmap.width - 3, 2],
    [2, image.bitmap.height - 3],
    [image.bitmap.width - 3, image.bitmap.height - 3],
  ];

  const samples = points.map(([x, y]) => {
    const { r, g, b } = intToRGBA(image.getPixelColor(x, y));
    return [r, g, b];
  });

  const avg = samples.reduce(
    (acc, s) => [acc[0] + s[0], acc[1] + s[1], acc[2] + s[2]],
    [0, 0, 0]
  );
  return avg.map((v) => Math.round(v / samples.length));
}

const image = await Jimp.read(inputPath);

const bg = sampleBackground(image);

// Tuning:
// - threshold: below this distance -> fully transparent
// - feather: fade alpha between threshold..threshold+feather
const threshold = 22; // good for near-flat backgrounds
const feather = 26; // soft edge

for (let y = 0; y < image.bitmap.height; y++) {
  for (let x = 0; x < image.bitmap.width; x++) {
    const { r, g, b, a } = intToRGBA(image.getPixelColor(x, y));
    const rgb = [r, g, b];
    const d = colorDistance(rgb, bg);

    if (d <= threshold) {
      image.setPixelColor(rgbaToInt(r, g, b, 0), x, y);
    } else if (d <= threshold + feather) {
      const t = (d - threshold) / feather; // 0..1
      const alpha = Math.round(255 * clamp01(t));
      const outA = Math.round((a / 255) * alpha);
      image.setPixelColor(rgbaToInt(r, g, b, outA), x, y);
    }
  }
}

// Trim transparent bounds to maximize perceived size
let minX = image.bitmap.width;
let minY = image.bitmap.height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < image.bitmap.height; y++) {
  for (let x = 0; x < image.bitmap.width; x++) {
    const { a } = intToRGBA(image.getPixelColor(x, y));
    if (a > 2) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX >= minX && maxY >= minY) {
  const pad = 14; // breathing room
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const x1 = Math.min(image.bitmap.width - 1, maxX + pad);
  const y1 = Math.min(image.bitmap.height - 1, maxY + pad);
  image.crop({
    x: x0,
    y: y0,
    w: x1 - x0 + 1,
    h: y1 - y0 + 1,
  });
}

await image.write(outputPath);

console.log(`OK: ${path.relative(repoRoot, outputPath)} (bg=${bg.join(",")})`);

