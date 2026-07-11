import { GAME_CONFIG } from '../config/gameConfig';
import { assetUrl } from '../utils/assetUrl';

export type NativeAudioKey =
  | 'sfx-jump'
  | 'sfx-collect'
  | 'sfx-timer'
  | 'sfx-spark'
  | 'sfx-stomp'
  | 'sfx-hurt'
  | 'sfx-select'
  | 'sfx-game-over'
  | 'sfx-kiss'
  | 'music-game';

const FILES: Record<NativeAudioKey, string> = {
  'sfx-jump': 'assets/audio/sfx_jump.mp3',
  'sfx-collect': 'assets/audio/sfx_coin.mp3',
  'sfx-timer': 'assets/audio/sfx_gem.mp3',
  'sfx-spark': 'assets/audio/sfx_magic.mp3',
  'sfx-stomp': 'assets/audio/sfx_bump.mp3',
  'sfx-hurt': 'assets/audio/sfx_hurt.mp3',
  'sfx-select': 'assets/audio/sfx_select.mp3',
  'sfx-game-over': 'assets/audio/sfx_disappear.mp3',
  'sfx-kiss': 'assets/audio/sfx_throw.mp3',
  'music-game': 'assets/audio/music-game.mp3',
};

const SFX_POOL_SIZE = 4;
const sfxPools = new Map<Exclude<NativeAudioKey, 'music-game'>, HTMLAudioElement[]>();
let musicEl: HTMLAudioElement | null = null;
let unlocked = false;

function urlFor(key: NativeAudioKey): string {
  return assetUrl(FILES[key], GAME_CONFIG.audioAssetVersion);
}

function createAudio(key: NativeAudioKey): HTMLAudioElement {
  const el = new Audio(urlFor(key));
  el.preload = 'auto';
  if (key === 'music-game') {
    el.loop = true;
  }
  return el;
}

export function initNativeAudio(): void {
  if (sfxPools.size > 0) return;

  (Object.keys(FILES) as NativeAudioKey[]).forEach((key) => {
    if (key === 'music-game') {
      musicEl = createAudio(key);
      return;
    }

    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < SFX_POOL_SIZE; i += 1) {
      pool.push(createAudio(key));
    }
    sfxPools.set(key, pool);
  });
}

async function pingElement(el: HTMLAudioElement): Promise<boolean> {
  const prev = el.volume;
  el.volume = 0.001;
  try {
    await el.play();
    el.pause();
    el.currentTime = 0;
    el.volume = prev;
    return true;
  } catch {
    el.volume = prev;
    return false;
  }
}

/** Call inside a user tap handler — unlocks iOS / Safari audio output. */
export function unlockNativeAudio(): void {
  initNativeAudio();
  if (unlocked) return;

  const elements: HTMLAudioElement[] = [];
  sfxPools.forEach((pool) => elements.push(...pool));
  if (musicEl) elements.push(musicEl);

  void (async () => {
    let anyPlayed = false;
    for (const el of elements) {
      if (await pingElement(el)) anyPlayed = true;
    }
    if (anyPlayed) unlocked = true;
  })();
}

export function playNativeSfx(key: Exclude<NativeAudioKey, 'music-game'>, volume = 0.75): void {
  initNativeAudio();
  const pool = sfxPools.get(key);
  if (!pool?.length) return;

  const el = pool.find((node) => node.paused || node.ended) ?? pool[0];
  el.volume = volume;
  el.currentTime = 0;
  void el.play().catch(() => {});
}

export function playNativeMusic(volume = 0.45): void {
  initNativeAudio();
  if (!musicEl) return;
  if (!musicEl.paused && !musicEl.ended) return;
  musicEl.volume = volume;
  musicEl.currentTime = 0;
  void musicEl.play().catch(() => {});
}

export function stopNativeMusic(): void {
  if (!musicEl) return;
  musicEl.pause();
  musicEl.currentTime = 0;
}

export function isNativeMusicPlaying(): boolean {
  return !!musicEl && !musicEl.paused && !musicEl.ended;
}
