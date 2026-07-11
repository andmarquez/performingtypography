import Phaser from 'phaser';

const MUTE_KEY = 'venezuelan-game.soundMuted';

export type SfxKey =
  | 'sfx-jump'
  | 'sfx-collect'
  | 'sfx-timer'
  | 'sfx-spark'
  | 'sfx-stomp'
  | 'sfx-hurt'
  | 'sfx-select'
  | 'sfx-win'
  | 'sfx-game-over'
  | 'sfx-kiss';

export type MusicKey = 'music-game';

/**
 * Central audio helper — Kenney CC0 platformer SFX + looped gameplay music.
 * Call unlock() on the first user tap (required on iOS).
 */
export class SoundManager {
  private muted = false;
  private unlocked = false;
  private activeMusic?: MusicKey;

  constructor(private readonly game: Phaser.Game) {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    const scene = this.game.scene.getScene('BootScene');
    if (scene?.sound.locked) {
      scene.sound.unlock();
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
    if (muted) {
      this.stopMusic();
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  play(key: SfxKey, config?: Phaser.Types.Sound.SoundConfig): void {
    if (this.muted) return;
    const scene = this.activeScene();
    if (!scene || !scene.sound.get(key)) return;
    scene.sound.play(key, { volume: 0.55, ...config });
  }

  playMusic(key: MusicKey, volume = 0.28): void {
    if (this.muted) return;
    const scene = this.activeScene();
    if (!scene) return;
    if (this.activeMusic === key) {
      const current = scene.sound.get(key) as Phaser.Sound.WebAudioSound | undefined;
      if (current?.isPlaying) return;
    }
    this.stopMusic();
    scene.sound.play(key, { loop: true, volume });
    this.activeMusic = key;
  }

  stopMusic(): void {
    const scene = this.activeScene();
    if (!scene) return;
    scene.sound.stopByKey('music-game');
    this.activeMusic = undefined;
  }

  private activeScene(): Phaser.Scene | undefined {
    const scenes = this.game.scene.getScenes(true);
    return scenes.find((s) => s.sys.isActive()) ?? scenes[0];
  }
}

export function getSoundManager(game: Phaser.Game): SoundManager | undefined {
  return game.registry.get('soundManager') as SoundManager | undefined;
}
