// Using the global `textmode` from the UMD bundle
const tm = textmode.create({ width: window.innerWidth, height: window.innerHeight });

tm.draw(() => {
    tm.background(0);

    const halfCols = (tm.grid.cols / 2) + 1;
    const halfRows = (tm.grid.rows / 2) + 1;

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

tm.windowResized(() => {
    tm.resizeCanvas(window.innerWidth, window.innerHeight);
});
