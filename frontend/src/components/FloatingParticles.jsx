import React, { useEffect, useRef } from 'react';

/**
 * FloatingParticles — lightweight CSS/JS dust mote particle layer
 */
const FloatingParticles = () => {
  const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[var(--primary-color)]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          50%  { transform: translateY(-30px) translateX(10px); opacity: 0.5; }
          100% { transform: translateY(-60px) translateX(-10px); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default FloatingParticles;
