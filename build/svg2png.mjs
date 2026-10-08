/**
 * FinanceSelf.jp — SVG → PNG rasterizer
 *
 * Usage:
 *   npm install        (inside build/ — installs sharp)
 *   node svg2png.mjs
 *
 * Reads:   assets/img/logo-icon.svg      → assets/img/icon-{size}.png
 *          build/src/apple-touch.svg     → assets/img/apple-touch-icon.png
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ICON_SVG = path.join(ROOT, 'assets', 'img', 'logo-icon.svg');
const APPLE_SVG = path.join(ROOT, 'build', 'src', 'apple-touch.svg');
const OUT_DIR = path.join(ROOT, 'assets', 'img');

const ICO_SIZES = [16, 32, 48, 64, 128, 256, 512];
const APPLE_SIZE = 180;

async function render(svgPath, size, outFile) {
  // 64px viewBox → density scaled so the raster is exactly `size` px
  const density = Math.round((72 * size) / 64);
  await sharp(svgPath, { density })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  console.log(`OK ${path.relative(ROOT, outFile)} (${size}x${size})`);
}

async function main() {
  for (const size of ICO_SIZES) {
    await render(ICON_SVG, size, path.join(OUT_DIR, `icon-${size}.png`));
  }
  await render(APPLE_SVG, APPLE_SIZE, path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('Done.');
}

main().catch((err) => { console.error(err); process.exit(1); });
