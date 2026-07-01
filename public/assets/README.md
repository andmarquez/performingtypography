# Game Assets

Drop your custom art here when you are ready to replace placeholder graphics.

## Suggested files

| File | Purpose |
|------|---------|
| `andsiosa.png` | Spritesheet for Andsiosa (idle, run, jump, fall, hurt, victory) |
| `deadline-bug.png` | Enemy spritesheet |
| `kiss.png` | Kiss collectible |
| `timer.png` | Timer power-up |
| `portal.png` | Creative portal at level end |
| `platform.png` | Platform tile |
| `particle.png` | Particle sparkle |

## How to swap placeholders

1. Add images to this folder.
2. In `src/scenes/BootScene.ts`, load them in `preload()` instead of (or before) `generatePlaceholderTextures()`.
3. Keep the same texture keys (`andsiosa-idle`, `kiss`, `timer`, etc.) so gameplay code keeps working.
4. Update animation frame definitions in `src/objects/Player.ts` when using a real spritesheet.

Placeholder shapes are generated at runtime so the game runs without any files in this folder.
