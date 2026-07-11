import Phaser from 'phaser';
import {
  initNativeAudio,
  isNativeMusicPlaying,
  playNativeMusic,
  playNativeSfx,
  stopNativeMusic,
  unlockNativeAudio,
  type NativeAudioKey,
} from './nativeAudio';
import { resumeSharedAudioContext } from './sharedAudioContext';

const MUTE_KEY = 'venezuelan-game.soundMuted';

export type SfxKey = Exclude<NativeAudioKey, 'music-game'>;
export type MusicKey = 'music-game';

/**
 * Audio via native HTMLAudioElement (reliable on iOS Safari) with Phaser fallback.
 */
export class SoundManager {
  private muted = false;
  private activeMusic = false;

  constructor(_game: Phaser.Game) {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
    initNativeAudio();
  }

  unlock(scene?: Phaser.Scene): void {
    unlockNativeAudio();
    resumeSharedAudioContext();

    if (scene) {
      scene.sound.pauseOnBlur = false;
      const sm = scene.sound as Phaser.Sound.WebAudioSoundManager & { locked?: boolean };
      if (sm.locked) sm.unlock();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (muted) this.stopMusic();
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  play(key: SfxKey, scene?: Phaser.Scene, config?: { volume?: number }): void {
    if (this.muted) return;
    this.unlock(scene);
    playNativeSfx(key, config?.volume ?? 0.75);

    if (scene?.cache.audio.exists(key)) {
      scene.sound.play(key, { volume: config?.volume ?? 0.75 });
    }
  }

  playMusic(_key: MusicKey, scene?: Phaser.Scene, volume = 0.45): void {
    if (this.muted) return;
    if (this.activeMusic && isNativeMusicPlaying()) return;

    this.unlock(scene);
    this.stopMusic();
    playNativeMusic(volume);
    this.activeMusic = true;

    if (scene?.cache.audio.exists('music-game')) {
      scene.sound.play('music-game', { loop: true, volume });
    }
  }

  stopMusic(scene?: Phaser.Scene): void {
    stopNativeMusic();
    this.activeMusic = false;
    scene?.sound.stopByKey('music-game');
  }
}

export function getSoundManager(game: Phaser.Game): SoundManager | undefined {
  return game.registry.get('soundManager') as SoundManager | undefined;
}

/** Unlock audio on first tap in each scene. */
export function bindSceneAudioUnlock(scene: Phaser.Scene): void {
  scene.sound.pauseOnBlur = false;
  const unlock = () => getSoundManager(scene.game)?.unlock(scene);
  scene.input.on('pointerdown', unlock);
}
