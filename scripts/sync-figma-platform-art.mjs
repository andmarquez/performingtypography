#!/usr/bin/env node
/**
 * Sync platform image fills from Figma → public/assets/world/platforms/
 *
 * After adding images to platform rectangles in Figma (M02 Platforms frame):
 * 1. Export each platform node via Figma MCP download_assets
 * 2. Update figma/export-platform-urls.json { "platform_start": "https://...", ... }
 * 3. Run: npm run assets:platforms
 * 4. Run: npm run assets:layout:mobile (refreshes platformArt in layout-mobile.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const URLS_PATH = path.join(ROOT, 'figma/export-platform-urls.json');
const OUT_DIR = path.join(ROOT, 'public/assets/world/platforms');

async function main() {
  if (!fs.existsSync(URLS_PATH)) {
    console.error('Missing figma/export-platform-urls.json');
    process.exit(1);
  }

  const urls = JSON.parse(fs.readFileSync(URLS_PATH, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  for (const [name, url] of Object.entries(urls)) {
    const dest = path.join(OUT_DIR, `${name}.png`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`skip ${name}: HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 400) {
      console.warn(`skip ${name}: export too small (${buf.length} bytes)`);
      continue;
    }
    fs.writeFileSync(dest, buf);
    console.log(`saved ${name}.png (${buf.length} bytes)`);
    ok++;
  }

  console.log(`Downloaded ${ok}/${Object.keys(urls).length} platform sprites`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
