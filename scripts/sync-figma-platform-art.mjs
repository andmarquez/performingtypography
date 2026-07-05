#!/usr/bin/env node
/**
 * Sync platform image fills from Figma → public/assets/world/platforms/
 *
 * Uses transparent raw image fills when available (not opaque node exports).
 * Manifest: figma/export-platform-manifest.json
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'figma/export-platform-manifest.json');
const LEGACY_URLS_PATH = path.join(ROOT, 'figma/export-platform-urls.json');
const OUT_DIR = path.join(ROOT, 'public/assets/world/platforms');
const PICKER = path.join(__dirname, 'pick-platform-png.py');

function readManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  if (!fs.existsSync(LEGACY_URLS_PATH)) {
    console.error('Missing figma/export-platform-manifest.json');
    process.exit(1);
  }

  const legacy = JSON.parse(fs.readFileSync(LEGACY_URLS_PATH, 'utf8'));
  const manifest = {};
  for (const [name, url] of Object.entries(legacy)) {
    manifest[name] = { export: url, raw: [], zone: { width: 200, height: 40 } };
  }
  return manifest;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'performingtypography-asset-sync/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function pickAndSave(name, entry) {
  const zoneW = entry.zone?.width ?? 200;
  const zoneH = entry.zone?.height ?? 40;
  const urls = [...(entry.raw ?? [])].filter(Boolean);
  const dest = path.join(OUT_DIR, `${name}.png`);

  const picker = spawnSync(
    'python3',
    [PICKER],
    {
      input: JSON.stringify({ zoneW, zoneH, urls }),
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  if (picker.status === 0 && picker.stdout?.length) {
    fs.writeFileSync(dest, picker.stdout);
    console.log(`saved ${name}.png (${picker.stdout.length} bytes, transparent raw)`);
    return true;
  }

  if (!urls.length) {
    const exportUrl = entry.export;
    if (!exportUrl) {
      console.warn(`skip ${name}: no image URLs`);
      return false;
    }
    return fetchBuffer(exportUrl)
      .then((buf) => {
        if (buf.byteLength < 100) throw new Error('too small');
        fs.writeFileSync(dest, buf);
        console.warn(`saved ${name}.png (${buf.byteLength} bytes, export only)`);
        return true;
      })
      .catch((err) => {
        console.warn(`skip ${name}: ${err.message}`);
        return false;
      });
  }

  return fetchBuffer(urls[urls.length - 1])
    .then((buf) => {
      if (buf.byteLength < 400) throw new Error('too small');
      fs.writeFileSync(dest, buf);
      console.warn(`saved ${name}.png (${buf.byteLength} bytes, raw fallback)`);
      return true;
    })
    .catch((err) => {
      console.warn(`skip ${name}: ${err.message}`);
      return false;
    });
}

async function main() {
  const manifest = readManifest();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  for (const [name, entry] of Object.entries(manifest)) {
    if (await pickAndSave(name, entry)) ok++;
  }

  console.log(`Downloaded ${ok}/${Object.keys(manifest).length} platform sprites`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
