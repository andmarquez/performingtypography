# Game Assets

Drop your custom art here when you are ready to replace placeholder graphics.

## Figma UI (edit screens here)

**Andsiosa's Creative Quest — UI** (mobile landscape 1280×720):

https://www.figma.com/design/1zlB4dA4ktyuuBXzseo1ix

Pages in the file:

| Page | Artboard size | Contents |
|------|---------------|----------|
| 🎨 Design Tokens | — | Brand colors + typography notes |
| 📱 Screens — Mobile Landscape | **1280 × 720** | M01 Start, M02 Gameplay, M03 Game Over, M04 Win (+ Wild Rift touch controls) |
| 🖥️ Screens — Desktop | **1920 × 1080** | D01–D04 same screens, centered 1280×720 viewport, keyboard hints (no touch UI) |
| 🧩 Components | — | Andsiosa states, HUD, Wild Rift controls |

After you update a screen in Figma, ask to sync changes back into the Phaser game.

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
