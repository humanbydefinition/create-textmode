/* global $fx */
import { textmode } from 'textmode.js';

const palettes = [
  {
    name: 'Electric Bloom',
    bg: [6, 6, 12],
    colors: [
      [246, 70, 104],
      [255, 191, 0],
      [89, 247, 255]
    ],
    glyphs: ['▓', '▒', '░']
  },
  {
    name: 'Monotone Void',
    bg: [10, 10, 12],
    colors: [
      [240, 240, 240],
      [180, 180, 180],
      [120, 120, 120]
    ],
    glyphs: ['█', '▓', '░']
  },
  {
    name: 'Emerald Night',
    bg: [4, 10, 8],
    colors: [
      [122, 217, 147],
      [48, 163, 84],
      [10, 102, 85]
    ],
    glyphs: ['▒', '░', '▓']
  }
];

const palette = pick(palettes);
const symmetry = $fx.rand() > 0.5 ? 'mirror' : 'radial';
const density = Math.floor($fx.rand() * 5) + 3; // 3..7 controls spacing
const jitter = $fx.rand() > 0.5;

$fx.features({
  Palette: palette.name,
  Symmetry: symmetry,
  Density: density,
  Jitter: jitter ? 'yes' : 'no'
});

const tm = textmode.create({ width: window.innerWidth, height: window.innerHeight });
const seed = $fx.rand() * 10000;
let previewSent = false;

function pick(items) {
  const idx = Math.floor($fx.rand() * items.length);
  return items[idx];
}

function waveNoise(x, y, t) {
  const base = Math.sin(x * 0.45 + y * 0.35 + seed + t);
  const ripple = Math.sin(Math.sqrt(x * x + y * y) * 0.35 + t * 0.5 + seed * 0.3);
  return 0.5 + 0.25 * base + 0.25 * ripple;
}

tm.draw(() => {
  tm.background(...palette.bg);

  const halfCols = Math.floor(tm.grid.cols / 2) + 1;
  const halfRows = Math.floor(tm.grid.rows / 2) + 1;

  for (let y = -halfRows; y < halfRows; y++) {
    for (let x = -halfCols; x < halfCols; x++) {
      if ((Math.abs(x) + Math.abs(y)) % density !== 0) continue;

      const sx = symmetry === 'mirror' ? Math.abs(x) : x;
      const t = tm.frameCount * 0.02;
      const wobble = jitter ? waveNoise(x * 0.05, y * 0.05, t * 1.5) - 0.5 : 0;
      const n = waveNoise(sx * 0.35, y * 0.35, t) + wobble;
      const colorIdx = Math.floor(Math.abs(n * palette.colors.length)) % palette.colors.length;
      const glyph = palette.glyphs[colorIdx % palette.glyphs.length];
      const [r, g, b] = palette.colors[colorIdx];

      tm.push();
      tm.translate(x, y, 0);
      tm.char(glyph);
      tm.charColor(r, g, b);
      tm.point();
      tm.pop();
    }
  }

  if (!previewSent && tm.frameCount > 12) {
    $fx.preview();
    previewSent = true;
  }
});

tm.windowResized(() => {
  tm.resizeCanvas(window.innerWidth, window.innerHeight);
});

console.log('fxhash:', $fx.hash);
