const BASE = import.meta.env.BASE_URL;

let manifestCache = null;
let manifestPromise = null;

export function slugFromFilename(filename) {
  return filename
    .replace(/\.svg$/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function screenFromFilename(filename, label = '') {
  const stem = filename.replace(/\.svg$/i, '');
  return {
    slug: slugFromFilename(filename),
    label: label || stem,
    filename,
  };
}

function normalizeScreens(manifest) {
  if (Array.isArray(manifest?.screens) && manifest.screens.length) {
    return manifest.screens.map((screen) => ({
      slug: screen.slug,
      label: screen.label,
      filename: screen.filename,
    }));
  }

  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  return files.map((filename) => screenFromFilename(filename));
}

export async function fetchExperienceManifest(force = false) {
  if (!force && manifestCache) {
    return manifestCache;
  }

  if (!force && manifestPromise) {
    return manifestPromise;
  }

  manifestPromise = (async () => {
    try {
      const response = await fetch(`${BASE}experience/manifest.json`, { cache: 'no-cache' });

      if (!response.ok) {
        return { screens: [], files: [] };
      }

      const manifest = await response.json();
      const screens = normalizeScreens(manifest);
      manifestCache = { ...manifest, screens };
      return manifestCache;
    } catch (error) {
      console.warn('Could not load experience manifest', error);
      return { screens: [], files: [] };
    } finally {
      manifestPromise = null;
    }
  })();

  return manifestPromise;
}

export function getCachedExperienceScreens() {
  return manifestCache?.screens ?? [];
}

export function invalidateExperienceManifestCache() {
  manifestCache = null;
  manifestPromise = null;
}
