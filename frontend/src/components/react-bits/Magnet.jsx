/**
 * Magnet — React Bits inspired implementation
 * Wraps a child element and magnetically pulls it toward the cursor when nearby.
 */
import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const Magnet = ({ children, strength = 0.4, radius = 120, className = '' }) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        setOffset({ x: dx * strength, y: dy * strength });
      }
    },
    [strength, radius]
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
};

export default Magnet;
