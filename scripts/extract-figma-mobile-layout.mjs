#!/usr/bin/env node
/**
 * Extract M02 mobile gameplay zones from Figma into layout-mobile.json.
 *
 * Platforms frame (26:179) is at y=-100 inside artboard 13:2.
 * goal_platform lives in the markers frame (+35 x) at artboard y=561.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/assets/world/level-1/layout-mobile.json');

const PLATFORM_FRAME_Y = -100;
const MARKERS_FRAME_X = 35;

const PLATFORMS_RAW = [
  ['platform_start', -1, 684, 848, 20],
  ['floating_platform_01', 207, 572, 121, 29],
  ['floating_platform_02', 935, 569, 122, 34],
  ['platform_01', 996, 656, 391, 20],
  ['floating_platform_03', 1395, 571, 124, 34],
  ['platform_02', 1472, 696, 246, 20],
  ['floating_platform_04', 1860, 586, 98, 20],
  ['platform_03', 1791, 655, 314, 20],
  ['platform_04', 2105, 683, 465, 20],
  ['floating_platform_05', 3105, 570, 120, 32],
  ['platform_05', 2717, 776, 1410, 20],
  ['floating_platform_06', 4138, 597, 90, 20],
  ['platform_06', 4127, 756, 386, 20],
  ['floating_platform_07', 4308, 570, 122, 34],
  ['platform_07', 4500, 776, 317, 20],
  ['floating_platform_08', 4788, 678, 195, 20],
];

const GOAL_PLATFORM = ['goal_platform', 5172 + MARKERS_FRAME_X, 561, 163, 20];

const COLLECTIBLES = {
  kiss: [
    [250, 500, 24, 24],
    [415, 328, 24, 24],
    [750, 270, 24, 24],
  ],
  timer: [[850, 270, 28, 28]],
  enemy: [[500, 510, 40, 32]],
};

function toPlatform([name, x, y, w, h], frameY = PLATFORM_FRAME_Y) {
  return {
    name,
    x: Math.max(0, Math.round(x)),
    y: Math.round(y + frameY),
    width: Math.round(w),
    height: Math.round(h),
    type: 'platform',
  };
}

function center([x, y, w, h]) {
  return { x: Math.round(x + w / 2), y: Math.round(y + h / 2) };
}

const platforms = [
  ...PLATFORMS_RAW.map((row) => toPlatform(row)),
  toPlatform(GOAL_PLATFORM, 0),
];

const goal = platforms.find((p) => p.name === 'goal_platform');

const layout = {
  level: 'level-1',
  variant: 'mobile',
  figmaArtboard: 'M02 — Gameplay (Level 1)',
  figmaNodeId: '13:2',
  width: 5335,
  height: 720,
  background: {
    mode: 'sections',
    sections: [
      {
        key: 'world:level-1-background',
        path: '/assets/world/background/level-1-mobile.png',
        x: 0,
        y: 171,
        width: 5335,
        height: 449,
      },
    ],
  },
  platforms,
  markers: {
    player_spawn: { x: 198, y: 564 },
    portal_goal: {
      x: goal.x + Math.round(goal.width / 2),
      y: goal.y - 10,
    },
    kiss_collectibles: COLLECTIBLES.kiss.map(center),
    timer_collectibles: COLLECTIBLES.timer.map(center),
    enemies: COLLECTIBLES.enemy.map((rect) => ({
      ...center(rect),
      min: 200,
      max: 820,
    })),
  },
};

fs.writeFileSync(OUT, `${JSON.stringify(layout, null, 2)}\n`);
console.log(`Wrote ${OUT} — ${layout.platforms.length} platforms`);
