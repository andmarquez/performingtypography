#!/usr/bin/env node
/**
 * Sync collectible GIFs from Figma → public/assets/collectibles/
 * Builds grid PNG spritesheets (max 4096px) for Phaser world-space rendering.
 * Manifest: figma/export-collectible-manifest.json
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'figma/export-collectible-manifest.json');
const GRID_COLS = 10;

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
  const frameCount = countGifFrames(gifPath);
  const cols = GRID_COLS;
  const rows = Math.ceil(frameCount / cols);
  const vf = [
    'fps=12',
    `scale=${displaySize}:${displaySize}:force_original_aspect_ratio=decrease`,
    `pad=${displaySize}:${displaySize}:(ow-iw)/2:(oh-ih)/2`,
    `tile=${cols}x${rows}`,
  ].join(',');
  execSync(`ffmpeg -y -i "${gifPath}" -vf "${vf}" -frames:v 1 "${sheetPath}"`, {
    stdio: 'pipe',
  });
  return { frameCount, cols, rows };
}

function buildStaticFrame(gifPath, staticPath, displaySize) {
  const vf = [
    'fps=12',
    `scale=${displaySize}:${displaySize}:force_original_aspect_ratio=decrease`,
    `pad=${displaySize}:${displaySize}:(ow-iw)/2:(oh-ih)/2`,
  ].join(',');
  execSync(`ffmpeg -y -i "${gifPath}" -vf "${vf}" -frames:v 1 -update 1 "${staticPath}"`, {
    stdio: 'pipe',
  });
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
    const staticRel = `public/assets/collectibles/sheets/${key}-static.png`;
    const sheetPath = path.join(ROOT, sheetRel);
    const staticPath = path.join(ROOT, staticRel);
    fs.mkdirSync(path.dirname(sheetPath), { recursive: true });

    const { frameCount, cols, rows } = buildSpritesheet(dest, sheetPath, displaySize);
    buildStaticFrame(dest, staticPath, displaySize);

    entry.sheet = sheetRel;
    entry.static = staticRel;
    entry.frameCount = frameCount;
    entry.frameWidth = displaySize;
    entry.frameHeight = displaySize;
    entry.sheetCols = cols;
    entry.sheetRows = rows;
    entry.frameRate = 12;
    console.log(
      `spritesheet ${key} → ${sheetRel} (${frameCount} frames, ${cols}x${rows} grid @ ${displaySize}px)`,
    );
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
