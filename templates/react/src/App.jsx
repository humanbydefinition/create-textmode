import { useEffect, useRef } from 'react';
import { textmode } from 'textmode.js';

export default function App() {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const tm = textmode.create({ width: window.innerWidth, height: window.innerHeight });

    tm.draw(() => {
      tm.background(0);

      const halfCols = tm.grid.cols / 2 + 1;
      const halfRows = tm.grid.rows / 2 + 1;

      for (let y = -halfRows; y < halfRows; y++) {
        for (let x = -halfCols; x < halfCols; x++) {
          const dist = Math.sqrt(x * x + y * y);
          const wave = Math.sin(dist * 0.2 - tm.frameCount * 0.1);

          tm.push();
          tm.translate(x, y, 0);
          tm.char(wave > 0.5 ? '▓' : wave > 0 ? '▒' : '░');
          tm.charColor(0, 150 + wave * 100, 255);
          tm.point();
          tm.pop();
        }
      }
    });

    if (typeof tm.windowResized === 'function') {
      tm.windowResized(() => tm.resizeCanvas(window.innerWidth, window.innerHeight));
    }

    return () => {
      // Guarded cleanup if the library exposes a stop/destroy API.
      if (typeof tm.stop === 'function') tm.stop();
    };
  }, []);

  return (
    <main className="app">
      <div className="hud">
        <h1>textmode.js</h1>
        <p>Animated wave demo (React + Vite)</p>
      </div>
    </main>
  );
}
