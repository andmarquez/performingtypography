import Phaser from 'phaser';

export type GameOverLayoutJson = {
  screen?: string;
  format?: string;
  lottie?: string;
  designW?: number;
  designH?: number;
  bg?: string;
  statsY?: number;
  statsW?: number;
  statsH?: number;
  statsBg?: string;
  statsTextColor?: string;
  statsTextSize?: number;
  ctaY: number;
  ctaW: number;
  ctaH: number;
  ctaLabel?: string;
};

export type ResolvedGameOverLayout = {
  bg: number;
  ctaY: number;
  ctaW: number;
  ctaH: number;
  ctaLabel: string;
};

const REGISTRY_KEY = 'gameOverLayout';
export const GAME_OVER_LOTTIE_CACHE_KEY = 'game-over-lottie';
export const GAME_OVER_LAYOUT_CACHE_KEY = 'game-over-layout';

function searchParams(): URLSearchParams | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search);
}

/** Jump straight to Game Over after boot (`?gameOver=1`). */
export function shouldPreviewGameOver(): boolean {
  const params = searchParams();
  return params?.get('gameOver') === '1' || params?.get('gameOver') === 'true';
}

function parseColor(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return fallback;
  const hex = value.replace('#', '');
  const parsed = Number.parseInt(hex, 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveGameOverLayout(
  raw: GameOverLayoutJson | null | undefined,
): ResolvedGameOverLayout {
  return {
    bg: parseColor(raw?.bg, 0xfce4ec),
    ctaY: raw?.ctaY ?? 369,
    ctaW: raw?.ctaW ?? 177,
    ctaH: raw?.ctaH ?? 47,
    ctaLabel: raw?.ctaLabel ?? 'Try Again',
  };
}

export function cacheGameOverLayout(game: Phaser.Game, layout: ResolvedGameOverLayout): void {
  game.registry.set(REGISTRY_KEY, layout);
}

export function getCachedGameOverLayout(game: Phaser.Game): ResolvedGameOverLayout {
  const cached = game.registry.get(REGISTRY_KEY) as ResolvedGameOverLayout | undefined;
  if (cached) return cached;
  return resolveGameOverLayout(null);
}
