import fs from 'node:fs';
import path from 'node:path';

const experienceDir = path.resolve('public/experience');
const labelsPath = path.join(experienceDir, 'screen-labels.json');

if (!fs.existsSync(experienceDir)) {
  fs.mkdirSync(experienceDir, { recursive: true });
}

function slugFromFilename(filename) {
  return filename
    .replace(/\.svg$/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadLabelConfig() {
  if (!fs.existsSync(labelsPath)) {
    return { order: [], labels: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
  } catch {
    return { order: [], labels: {} };
  }
}

const labelConfig = loadLabelConfig();
const labels = labelConfig.labels ?? {};
const preferredOrder = Array.isArray(labelConfig.order) ? labelConfig.order : [];

const filesOnDisk = fs
  .readdirSync(experienceDir)
  .filter((name) => name.toLowerCase().endsWith('.svg'))
  .sort();

const orderedFiles = [
  ...preferredOrder.filter((name) => filesOnDisk.includes(name)),
  ...filesOnDisk.filter((name) => !preferredOrder.includes(name)),
];

const screens = orderedFiles.map((filename) => {
  const stem = filename.replace(/\.svg$/i, '');
  return {
    slug: slugFromFilename(filename),
    label: labels[filename] ?? stem,
    filename,
  };
});

const manifest = {
  files: orderedFiles,
  screens,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(experienceDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Experience manifest: ${orderedFiles.length} SVG(s) → public/experience/manifest.json`);
