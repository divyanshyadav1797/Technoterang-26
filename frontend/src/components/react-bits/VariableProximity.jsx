/**
 * VariableProximity — React Bits inspired implementation
 * Characters scale/bold based on proximity to the user's cursor.
 */
import { useRef, useEffect, useState, useCallback } from 'react';

const VariableProximity = ({
  label = '',
  className = '',
  radius = 120,
  falloff = 'linear',
  containerRef,
}) => {
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const target = containerRef?.current ?? window;
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    target.addEventListener('mousemove', handler);
    return () => target.removeEventListener('mousemove', handler);
  }, [containerRef]);

  const getWeight = useCallback(
    (el) => {
      if (!el) return 400;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((mousePos.x - cx) ** 2 + (mousePos.y - cy) ** 2);
      const t = Math.max(0, 1 - dist / radius);
      const eased = falloff === 'exponential' ? t * t : t;
      return Math.round(400 + eased * 500); // 400 → 900
    },
    [mousePos, radius, falloff]
  );

  const chars = label.split('');

  return (
    <span className={className} aria-label={label} style={{ display: 'inline' }}>
      {chars.map((char, i) => (
        <Char key={i} char={char} getWeight={getWeight} />
      ))}
    </span>
  );
};

const Char = ({ char, getWeight }) => {
  const ref = useRef(null);
  const [weight, setWeight] = useState(400);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setWeight(getWeight(ref.current));
    });
    return () => cancelAnimationFrame(id);
  });

  return (
    <span
      ref={ref}
      style={{
        fontWeight: weight,
        transition: 'font-weight 0.15s ease',
        display: 'inline-block',
        whiteSpace: char === ' ' ? 'pre' : undefined,
      }}
    >
      {char}
    </span>
  );
};

export default VariableProximity;
