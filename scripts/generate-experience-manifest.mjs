import fs from 'node:fs';
import path from 'node:path';

const experienceDir = path.resolve('public/experience');

if (!fs.existsSync(experienceDir)) {
  fs.mkdirSync(experienceDir, { recursive: true });
}

const files = fs
  .readdirSync(experienceDir)
  .filter((name) => name.toLowerCase().endsWith('.svg'))
  .sort();

const manifest = {
  files,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(experienceDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Experience manifest: ${files.length} SVG(s) → public/experience/manifest.json`);
