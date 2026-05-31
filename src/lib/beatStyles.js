export const BEAT_COOLDOWN_MS = 155;
export const BASS_HISTORY_SIZE = 36;

export const BEAT_STYLES = [
  {
    label: 'Impact',
    family: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
    color: '#ffffff',
    glow: '#ff183d',
    weight: 900,
    size: 1,
    spacing: '-0.08em',
  },
  {
    label: 'Bebas Red',
    family: '"Bebas Neue", Impact, sans-serif',
    color: '#ff183d',
    glow: '#ffffff',
    weight: 400,
    size: 1.14,
    spacing: '0.04em',
  },
  {
    label: 'Anton Gold',
    family: 'Anton, Impact, sans-serif',
    color: '#ffd400',
    glow: '#ff4d00',
    weight: 400,
    size: 1.08,
    spacing: '0.02em',
  },
  {
    label: 'Archivo',
    family: '"Archivo Black", Impact, sans-serif',
    color: '#ffffff',
    glow: '#00e5ff',
    weight: 400,
    size: 0.92,
    spacing: '-0.04em',
  },
  {
    label: 'Bungee',
    family: 'Bungee, Impact, sans-serif',
    color: '#00ffcc',
    glow: '#ff00aa',
    weight: 400,
    size: 0.88,
    spacing: '0.06em',
  },
  {
    label: 'Monoton',
    family: 'Monoton, Impact, cursive',
    color: '#ff6bff',
    glow: '#ffffff',
    weight: 400,
    size: 0.78,
    spacing: '0.12em',
  },
  {
    label: 'Oswald Thin',
    family: '"Oswald", Impact, sans-serif',
    color: '#ffffff',
    glow: '#ff183d',
    weight: 500,
    size: 1.22,
    spacing: '0.14em',
  },
  {
    label: 'Black Ops',
    family: '"Black Ops One", Impact, sans-serif',
    color: '#c8ff00',
    glow: '#ff183d',
    weight: 400,
    size: 0.96,
    spacing: '-0.02em',
  },
  {
    label: 'Rubik Mono',
    family: '"Rubik Mono One", Impact, monospace',
    color: '#ffffff',
    glow: '#ff183d',
    weight: 400,
    size: 0.82,
    spacing: '-0.06em',
  },
  {
    label: 'Staatliches',
    family: 'Staatliches, Impact, sans-serif',
    color: '#ff314f',
    glow: '#ffffff',
    weight: 400,
    size: 1.18,
    spacing: '0.08em',
  },
  {
    label: 'Syne',
    family: 'Syne, Impact, sans-serif',
    color: '#ffffff',
    glow: '#7c3aed',
    weight: 800,
    size: 1.06,
    spacing: '-0.1em',
  },
  {
    label: 'Righteous',
    family: 'Righteous, Impact, sans-serif',
    color: '#ff9500',
    glow: '#ffffff',
    weight: 400,
    size: 1,
    spacing: '0.03em',
  },
  {
    label: 'Ultra',
    family: 'Ultra, Impact, serif',
    color: '#ffffff',
    glow: '#00ff66',
    weight: 400,
    size: 0.9,
    spacing: '0.01em',
  },
  {
    label: 'Passero',
    family: '"Passero One", Impact, serif',
    color: '#ff4081',
    glow: '#ffe600',
    weight: 400,
    size: 1.12,
    spacing: '0.05em',
  },
  {
    label: 'Wallpoet',
    family: 'Wallpoet, Impact, cursive',
    color: '#e0e0ff',
    glow: '#ff183d',
    weight: 400,
    size: 1.04,
    spacing: '0.1em',
  },
];

export function applyBeatStyle(style, updateFrameVariable) {
  updateFrameVariable('--beat-font', style.family);
  updateFrameVariable('--beat-color', style.color);
  updateFrameVariable('--beat-glow', style.glow);
  updateFrameVariable('--beat-weight', String(style.weight));
  updateFrameVariable('--beat-size', String(style.size));
  updateFrameVariable('--beat-spacing', style.spacing);
}
