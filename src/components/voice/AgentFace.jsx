import React, { useEffect, useRef } from 'react';

// Pixelated matrix-style animated face. Renders a low-res grid of glyph cells
// forming eyes + mouth; mouth amplitude follows agent speech, eyes blink.
const COLS = 32;
const ROWS = 24;

export default function AgentFace({ speaking, status }) {
  const canvasRef = useRef(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;
    let blink = 0;

    function draw() {
      t += 1;
      if (blink <= 0 && Math.random() < 0.008) blink = 8;
      if (blink > 0) blink -= 1;

      const w = canvas.width;
      const h = canvas.height;
      const cw = w / COLS;
      const ch = h / ROWS;
      ctx.fillStyle = '#070b08';
      ctx.fillRect(0, 0, w, h);

      const mouthAmp = speakingRef.current ? 2 + Math.abs(Math.sin(t * 0.35)) * 3 : 0.6;

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          let lit = 0;
          // Eyes: two blocks around rows 7-9.
          const eyeRow = y >= 7 && y <= 9 && blink === 0;
          if (eyeRow && ((x >= 8 && x <= 11) || (x >= 20 && x <= 23))) lit = 1;
          if (blink > 0 && y === 8 && ((x >= 8 && x <= 11) || (x >= 20 && x <= 23))) lit = 0.5;
          // Mouth: waveform band around row 17.
          const mouthY = 17 + Math.round(Math.sin(x * 0.7 + t * 0.3) * mouthAmp);
          if (x >= 9 && x <= 22 && Math.abs(y - mouthY) < 1) lit = 1;
          // Faint matrix rain in the background.
          const rain = (x * 53 + Math.floor(t / 3)) % ROWS === y ? 0.18 : 0;
          const a = Math.max(lit, rain);
          if (a > 0) {
            ctx.fillStyle = `rgba(57, 255, 122, ${a})`;
            ctx.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`agent-face ${status}`}>
      <canvas ref={canvasRef} width={384} height={288} />
    </div>
  );
}
