import { createImportedSvg, sanitizeSvgMarkup } from './svgImport.js';

const BASE = import.meta.env.BASE_URL;

export function createExperienceSvg(name, markup, index = 0) {
  return {
    ...createImportedSvg(name, markup, index),
    source: 'experience',
    x: 50,
    y: 50,
    scale: 1,
    opacity: 0.95,
    beatPulse: true,
    visible: true,
  };
}

export async function loadExperienceAssets() {
  try {
    const manifestUrl = `${BASE}experience/manifest.json`;
    const manifestResponse = await fetch(manifestUrl, { cache: 'no-cache' });

    if (!manifestResponse.ok) {
      return [];
    }

    const manifest = await manifestResponse.json();
    const files = Array.isArray(manifest?.files) ? manifest.files : [];

    if (!files.length) {
      return [];
    }

    const loaded = await Promise.all(
      files.map(async (filename, index) => {
        const assetUrl = `${BASE}experience/${encodeURIComponent(filename)}`;
        const response = await fetch(assetUrl, { cache: 'no-cache' });

        if (!response.ok) {
          console.warn(`Experience SVG not found: ${filename}`);
          return null;
        }

        const raw = await response.text();
        const markup = sanitizeSvgMarkup(raw);
        const name = filename.replace(/\.svg$/i, '');
        return createExperienceSvg(name, markup, index);
      }),
    );

    return loaded.filter(Boolean);
  } catch (error) {
    console.warn('Could not load experience SVGs', error);
    return [];
  }
}
