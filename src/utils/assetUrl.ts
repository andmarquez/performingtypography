/** Resolve public asset paths for Vite base URL (e.g. GitHub Pages subpath). */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}
