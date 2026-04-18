import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const Magnet = ({ children, padding = 100, disabled = false, className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    if (disabled) {
      x.set(0);
      y.set(0);
      return;
    }

    const handleMouseMove = (e) => {
      if (!isActive) return;
      
      const { clientX, clientY } = e;
      const element = document.getElementById('magnet-wrapper');
      if (!element) return;
      
      const { left, top, width, height } = element.getBoundingClientRect();
      
      // Calculate distance from center of element
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;
      
      // Only apply effect if within padding distance
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (distance < padding + Math.max(width, height)) {
        // Move towards the cursor, but constrained
        x.set(distanceX * 0.2);
        y.set(distanceY * 0.2);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, disabled, padding, x, y]);

  return (
    <motion.div
      id="magnet-wrapper"
      className={className}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => {
        setIsActive(false);
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
};

export default Magnet;
