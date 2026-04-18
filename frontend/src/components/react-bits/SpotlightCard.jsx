/**
 * SpotlightCard — React Bits inspired implementation
 * A card where a coloured glow follows the user's cursor.
 */
import { useRef, useCallback } from 'react';

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(255,166,48,0.15)',
}) => {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spotlight-x', `${x}px`);
    card.style.setProperty('--spotlight-y', `${y}px`);
    card.style.setProperty('--spotlight-color', spotlightColor);
  }, [spotlightColor]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--spotlight-x', `-9999px`);
    card.style.setProperty('--spotlight-y', `-9999px`);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--spotlight-x': '-9999px',
        '--spotlight-y': '-9999px',
        '--spotlight-color': spotlightColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Spotlight radial overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(300px circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.05s',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default SpotlightCard;
