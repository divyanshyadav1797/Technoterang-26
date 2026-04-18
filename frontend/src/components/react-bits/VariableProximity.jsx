import React, { useRef } from 'react';
import { motion, useTransform, useMotionValue, useSpring } from 'framer-motion';

const VariableProximity = ({ text, radius = 200, className = '' }) => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
    mouseY.set(Infinity);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-wrap gap-1 ${className}`}
    >
      {text.split('').map((char, index) => {
        if (char === ' ') return <span key={index} className="w-2" />;
        return (
          <ProximityChar
            key={index}
            char={char}
            mouseX={mouseX}
            mouseY={mouseY}
            radius={radius}
          />
        );
      })}
    </div>
  );
};

const ProximityChar = ({ char, mouseX, mouseY, radius }) => {
  const charRef = useRef(null);
  
  // Create motion values that will be updated based on distance
  const distance = useMotionValue(Infinity);
  
  // Calculate distance in a requestAnimationFrame loop or use simple distance calculation on render
  // Since we can't easily hook into mouse move for every character efficiently without a loop,
  // we'll use framer-motion's useTransform on the shared mouse coordinates.
  
  const scale = useSpring(
    useTransform(() => {
      if (!charRef.current) return 1;
      const rect = charRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(
        Math.pow(mouseX.get() - centerX, 2) + Math.pow(mouseY.get() - centerY, 2)
      );
      
      if (dist < radius) {
        // Map distance [0, radius] to scale [1.5, 1]
        return 1 + (0.5 * (1 - dist / radius));
      }
      return 1;
    }),
    { damping: 20, stiffness: 200 }
  );

  const fontWeight = useSpring(
    useTransform(() => {
      if (!charRef.current) return 400;
      const rect = charRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(
        Math.pow(mouseX.get() - centerX, 2) + Math.pow(mouseY.get() - centerY, 2)
      );
      
      if (dist < radius) {
        // Map distance [0, radius] to weight [800, 400]
        return 400 + (400 * (1 - dist / radius));
      }
      return 400;
    }),
    { damping: 20, stiffness: 200 }
  );

  return (
    <motion.span
      ref={charRef}
      style={{ scale, fontWeight }}
      className="inline-block transition-colors"
    >
      {char}
    </motion.span>
  );
};

export default VariableProximity;
