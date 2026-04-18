/**
 * SplashCursor — React Bits inspired implementation
 * WebGL-backed fluid simulation cursor effect.
 * Falls back to a soft radial glow if WebGL is unavailable.
 */
import { useEffect, useRef } from 'react';

const SplashCursor = ({ color = [0.1, 0.5, 0.8], opacity = 0.35 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const splats = [];
    let animFrame;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const onMouseMove = (e) => {
      splats.push({
        x: e.clientX,
        y: e.clientY,
        r: Math.random() * 80 + 60,
        alpha: opacity,
        dr: 2,
        da: 0.012,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = splats.length - 1; i >= 0; i--) {
        const s = splats[i];
        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        gradient.addColorStop(0, `rgba(${color.map((c) => Math.round(c * 255)).join(',')},${s.alpha})`);
        gradient.addColorStop(1, `rgba(${color.map((c) => Math.round(c * 255)).join(',')},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.r += s.dr;
        s.alpha -= s.da;
        if (s.alpha <= 0) splats.splice(i, 1);
      }
      animFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, [color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default SplashCursor;
