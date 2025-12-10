import { textmode } from 'textmode.js';
import { Pane } from 'tweakpane';

type RGB = { r: number; g: number; b: number };

type Params = {
  speed: number;
  frequency: number;
  amplitude: number;
  baseCharColor: RGB;
  baseCellColor: RGB;
};

const tm = textmode.create({ width: window.innerWidth, height: window.innerHeight });

const params: Params = {
  speed: 0.1,
  frequency: 0.22,
  amplitude: 1.1,
  baseCharColor: { r: 0, g: 170, b: 255 },
  baseCellColor: { r: 0, g: 0, b: 0 }
};

const paneContainer = document.querySelector<HTMLElement>('#pane') ?? undefined;
const pane = new Pane({ title: 'Controls', container: paneContainer });

pane.addBinding(params, 'speed', { min: 0, max: 0.4, step: 0.005, label: 'Speed' });
pane.addBinding(params, 'frequency', { min: 0.05, max: 0.8, step: 0.01, label: 'Frequency' });
pane.addBinding(params, 'amplitude', { min: 0.5, max: 2.0, step: 0.05, label: 'Amplitude' });
pane.addBinding(params, 'baseCharColor', { label: 'Base Char Color' });
pane.addBinding(params, 'baseCellColor', { label: 'Base Cell Color' });

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const getChar = (wave: number): string => {
  if (wave > 0.6) return '▓';
  if (wave > 0.2) return '▒';
  return '░';
};

tm.draw(() => {
  const halfCols = Math.round(tm.grid.cols / 2) + 1;
  const halfRows = Math.round(tm.grid.rows / 2) + 1;

  for (let y = -halfRows; y < halfRows; y++) {
    for (let x = -halfCols; x < halfCols; x++) {
      const dist = Math.hypot(x, y);
      const wave = Math.sin(dist * params.frequency - tm.frameCount * params.speed) * params.amplitude;
      const char = getChar(wave);

      const lightness = 0.35 + 0.65 * ((wave + params.amplitude) / (2 * params.amplitude));
      const charR = clamp(params.baseCharColor.r * lightness, 0, 255);
      const charG = clamp(params.baseCharColor.g * lightness, 0, 255);
      const charB = clamp(params.baseCharColor.b * lightness, 0, 255);
      const cellR = clamp(params.baseCellColor.r * lightness, 0, 255);
      const cellG = clamp(params.baseCellColor.g * lightness, 0, 255);
      const cellB = clamp(params.baseCellColor.b * lightness, 0, 255);

      tm.push();
      tm.translate(x, y, 0);
      tm.char(char);
      tm.charColor(charR, charG, charB);
      tm.cellColor(cellR, cellG, cellB);
      tm.point();
      tm.pop();
    }
  }
});

tm.windowResized(() => {
  tm.resizeCanvas(window.innerWidth, window.innerHeight);
});
