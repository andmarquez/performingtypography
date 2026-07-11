#!/usr/bin/env node
/**
 * Sync collectible GIFs from Figma → public/assets/collectibles/
 * Also builds horizontal PNG spritesheets for Phaser world-space rendering.
 * Manifest: figma/export-collectible-manifest.json
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'figma/export-collectible-manifest.json');

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'venezuelan-game-asset-sync/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function countGifFrames(gifPath) {
  const out = execSync(
    `ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "${gifPath}"`,
    { encoding: 'utf8' },
  ).trim();
  const frames = Number.parseInt(out, 10);
  if (!Number.isFinite(frames) || frames < 1) {
    throw new Error(`Could not count frames for ${gifPath}`);
  }
  return frames;
}

function buildSpritesheet(gifPath, sheetPath, displaySize) {
  const frames = countGifFrames(gifPath);
  const vf = [
    'fps=12',
    `scale=${displaySize}:${displaySize}:force_original_aspect_ratio=decrease`,
    `pad=${displaySize}:${displaySize}:(ow-iw)/2:(oh-ih)/2`,
    `tile=${frames}x1`,
  ].join(',');
  execSync(`ffmpeg -y -i "${gifPath}" -vf "${vf}" -frames:v 1 "${sheetPath}"`, {
    stdio: 'pipe',
  });
  return frames;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let ok = 0;

  for (const [key, entry] of Object.entries(manifest.collectibles)) {
    const dest = path.join(ROOT, entry.dest);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const buf = await fetchBuffer(entry.gif);
    fs.writeFileSync(dest, buf);
    console.log(`saved ${key} → ${entry.dest} (${buf.byteLength} bytes)`);

    const displaySize = entry.displaySize ?? 48;
    const sheetRel = `public/assets/collectibles/sheets/${key}-sheet.png`;
    const sheetPath = path.join(ROOT, sheetRel);
    fs.mkdirSync(path.dirname(sheetPath), { recursive: true });
    const frameCount = buildSpritesheet(dest, sheetPath, displaySize);
    entry.sheet = sheetRel;
    entry.frameCount = frameCount;
    entry.frameWidth = displaySize;
    entry.frameHeight = displaySize;
    entry.frameRate = 12;
    console.log(`spritesheet ${key} → ${sheetRel} (${frameCount} frames @ ${displaySize}px)`);
    ok += 1;
  }

  manifest.syncedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Done — ${ok} collectible GIF(s) + spritesheet(s). Bump collectibleAssetVersion in gameConfig.ts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
