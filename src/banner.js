import kleur from 'kleur';
import { HEADER } from './constants.js';

const SPLIT_FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&/\\<>[]=+*';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function randomFlapChar() {
  const idx = Math.floor(Math.random() * SPLIT_FLAP_CHARS.length);
  return SPLIT_FLAP_CHARS[idx];
}

async function animateSplitFlap(lines, { flips = 16, frameDelay = 32, columnStagger = 6 } = {}) {
  const canAnimate = process.stdout.isTTY && process.env.CI !== 'true';
  if (!canAnimate) {
    console.log(kleur.cyan(lines.join('\n')));
    return;
  }

  const lineCount = lines.length;
  const blankFrame = lines.map((line) => line.replace(/[^\s]/g, ' '));
  let firstRender = true;

  const render = (frame) => {
    if (!firstRender) {
      process.stdout.write(`\x1b[${lineCount}F`);
    } else {
      firstRender = false;
    }
    process.stdout.write(frame.join('\n'));
    process.stdout.write('\n');
  };

  render(blankFrame);

  for (let flip = 0; flip < flips; flip++) {
    const frameLines = lines.map((line) => {
      const chars = line.split('').map((ch, idx) => {
        if (ch === ' ') return ' ';
        const shouldSettle = flip >= flips - 2 || flip > Math.floor(idx / columnStagger);
        return shouldSettle ? ch : randomFlapChar();
      });
      return kleur.cyan(chars.join(''));
    });
    render(frameLines);
    await sleep(frameDelay + flip * 6);
  }

  render(lines.map((line) => kleur.cyan(line)));
}

export async function printHeader() {
  const headerLines = HEADER.trim().split('\n');
  console.log('');
  await animateSplitFlap(headerLines);
  console.log('');
}
