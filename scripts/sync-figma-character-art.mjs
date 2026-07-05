#!/usr/bin/env node
/**
 * Sync Character/Andsiosa component PNGs from Figma → public/assets/character/
 * Manifest: figma/export-character-manifest.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'figma/export-character-manifest.json');
const OUT_DIR = path.join(ROOT, 'public/assets/character');

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'performingtypography-asset-sync/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  for (const [state, entry] of Object.entries(manifest)) {
    const dest = path.join(OUT_DIR, `andsiosa-${state}.png`);
    try {
      const buf = await fetchBuffer(entry.export);
      if (buf.byteLength < 200) throw new Error('too small');
      fs.writeFileSync(dest, buf);
      console.log(`saved andsiosa-${state}.png (${buf.byteLength} bytes)`);
      ok++;
    } catch (err) {
      console.warn(`skip ${state}: ${err.message}`);
    }
  }

  console.log(`Downloaded ${ok}/${Object.keys(manifest).length} character sprites`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
