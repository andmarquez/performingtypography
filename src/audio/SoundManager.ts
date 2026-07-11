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
  | 'sfx-game-over'
  | 'sfx-kiss';

export type MusicKey = 'music-game';

/**
 * Central audio helper — Kenney CC0 platformer SFX + looped gameplay music.
 * Always pass the active scene; each Phaser scene has its own sound manager.
 */
export class SoundManager {
  private muted = false;
  private activeMusic?: MusicKey;

  constructor(private readonly game: Phaser.Game) {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  /** Unlock audio on the scene that received the user tap (required on iOS). */
  unlock(scene: Phaser.Scene): void {
    if (scene.sound.locked) {
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
      this.stopMusic(this.activeScene());
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  play(
    key: SfxKey,
    scene?: Phaser.Scene,
    config?: Phaser.Types.Sound.SoundConfig,
  ): void {
    if (this.muted) return;
    const s = scene ?? this.activeScene();
    if (!s || !this.hasAudio(s, key)) return;
    this.unlock(s);
    s.sound.play(key, { volume: 0.55, ...config });
  }

  playMusic(key: MusicKey, scene?: Phaser.Scene, volume = 0.28): void {
    if (this.muted) return;
    const s = scene ?? this.activeScene();
    if (!s || !this.hasAudio(s, key)) return;

    const current = s.sound.get(key) as Phaser.Sound.WebAudioSound | undefined;
    if (this.activeMusic === key && current?.isPlaying) return;

    this.stopMusic(s);
    this.unlock(s);
    s.sound.play(key, { loop: true, volume });
    this.activeMusic = key;
  }

  stopMusic(scene?: Phaser.Scene): void {
    const s = scene ?? this.activeScene();
    if (!s) return;
    s.sound.stopByKey('music-game');
    this.activeMusic = undefined;
  }

  private hasAudio(scene: Phaser.Scene, key: string): boolean {
    return scene.cache.audio.exists(key);
  }

  private activeScene(): Phaser.Scene | undefined {
    const scenes = this.game.scene.getScenes(true);
    return scenes.find((s) => s.sys.isActive()) ?? scenes[0];
  }
}

export function getSoundManager(game: Phaser.Game): SoundManager | undefined {
  return game.registry.get('soundManager') as SoundManager | undefined;
}
