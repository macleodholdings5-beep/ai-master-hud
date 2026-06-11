import React, { useEffect, useRef } from 'react';

// Animated waveform strip: green when user speaks, cyan when agent responds.
export default function Waveform({ userSpeaking, agentSpeaking }) {
  const canvasRef = useRef(null);
  const flags = useRef({ userSpeaking, agentSpeaking });
  flags.current = { userSpeaking, agentSpeaking };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;
    function draw() {
      t += 1;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const active = flags.current.userSpeaking || flags.current.agentSpeaking;
      const amp = active ? h * 0.35 : h * 0.05;
      ctx.strokeStyle = flags.current.agentSpeaking ? '#3ad6ff' : '#39ff7a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x += 3) {
        const y =
          h / 2 +
          Math.sin(x * 0.05 + t * 0.2) * amp * Math.sin(x * 0.011 + t * 0.07) +
          (active ? (Math.random() - 0.5) * 4 : 0);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="waveform">
      <canvas ref={canvasRef} width={600} height={56} />
      <span className="wave-label">
        {agentSpeaking ? 'AGENT SPEAKING' : userSpeaking ? 'LISTENING — YOU' : 'STANDBY'}
      </span>
    </div>
  );
}
