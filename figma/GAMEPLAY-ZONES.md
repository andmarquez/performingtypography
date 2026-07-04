# Figma Gameplay Zones

Layer **🎯 Gameplay Zones** on:

- **M02 — Gameplay (Level 1)** (`13:2`)
- **D02 — Gameplay** → inside **Game Viewport 1280×720** (`24:433`)

## Contents

| Group | Items | Style |
|-------|-------|--------|
| **Platforms (collision)** | `platform_start`, `platform_01`…`05`, `floating_platform_01`…`08`, `goal_platform` | Green dashed rectangles + name labels |
| **Markers** | `player_spawn`, `portal_goal`, `kiss_1`…, `timer_1`…, `enemy_1`… | Colored ellipses + labels |

Move the green rectangles until they sit on the walkable tops in the artwork.

## Sync to the game

After repositioning in Figma, copy each rectangle’s **x, y, width, height** into:

`public/assets/world/level-1/layout-mobile.json` → `platforms[]`

Marker positions → `markers` object (use ellipse center as `x`, `y`).

Then run:

```bash
npm run assets:layout   # refresh desktop copy
```

Or ask to **extract zones from Figma** and the agent will read positions from the artboard.

## Debug in-game

`?debug=1` or press **H** — should match the Figma green boxes.
