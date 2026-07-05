#!/usr/bin/env node
/**
 * Sync Character/Andsiosa art from Figma → public/assets/character/
 * Uses transparent raw image fills (not opaque component exports).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'figma/export-character-manifest.json');
const OUT_DIR = path.join(ROOT, 'public/assets/character');
const PICKER = path.join(__dirname, 'pick-character-png.py');

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'performingtypography-asset-sync/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function pickAndSave(state, entry) {
  const urls = [...(entry.raw ?? [])].filter(Boolean);
  const dest = path.join(OUT_DIR, `andsiosa-${state}.png`);

  if (!urls.length) {
    return fetchBuffer(entry.export)
      .then((buf) => {
        fs.writeFileSync(dest, buf);
        console.warn(`saved andsiosa-${state}.png (${buf.byteLength} bytes, export only)`);
        return true;
      })
      .catch((err) => {
        console.warn(`skip ${state}: ${err.message}`);
        return false;
      });
  }

  const picker = spawnSync('python3', [PICKER], {
    input: JSON.stringify({ urls }),
    maxBuffer: 20 * 1024 * 1024,
  });

  if (picker.status === 0 && picker.stdout?.length) {
    fs.writeFileSync(dest, picker.stdout);
    console.log(`saved andsiosa-${state}.png (${picker.stdout.length} bytes, transparent raw)`);
    return Promise.resolve(true);
  }

  return fetchBuffer(urls[urls.length - 1])
    .then((buf) => {
      fs.writeFileSync(dest, buf);
      console.warn(`saved andsiosa-${state}.png (${buf.byteLength} bytes, raw fallback)`);
      return true;
    })
    .catch((err) => {
      console.warn(`skip ${state}: ${err.message}`);
      return false;
    });
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  for (const [state, entry] of Object.entries(manifest)) {
    if (await pickAndSave(state, entry)) ok++;
  }

  console.log(`Downloaded ${ok}/${Object.keys(manifest).length} character sprites`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
