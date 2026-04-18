import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PixelTransition = ({ 
  children, 
  activeComponentIndex = 0, 
  gridSize = 7, 
  transitionDuration = 0.5 
}) => {
  const [internalIndex, setInternalIndex] = useState(activeComponentIndex);
  const [isAnimating, setIsAnimating] = useState(false);

  // When activeComponentIndex changes, trigger animation
  if (activeComponentIndex !== internalIndex && !isAnimating) {
    setIsAnimating(true);
    // Halfway through the transition, swap the content
    setTimeout(() => {
      setInternalIndex(activeComponentIndex);
    }, transitionDuration * 500); // Wait half the duration for blocks to cover
    
    setTimeout(() => {
      setIsAnimating(false);
    }, transitionDuration * 1000 + (gridSize * gridSize * 10)); // Total time including stagger
  }

  // Create grid cells
  const cells = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    cells.push(i);
  }

  return (
    <div className="relative overflow-hidden w-full h-full rounded-3xl">
      {/* Content Container */}
      <div className="w-full h-full relative z-0">
        {children[internalIndex]}
      </div>

      {/* Pixel Overlay */}
      <AnimatePresence>
        {isAnimating && (
          <div 
            className="absolute inset-0 z-10 grid"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)` 
            }}
          >
            {cells.map((index) => {
              // Calculate a staggered delay based on position
              const row = Math.floor(index / gridSize);
              const col = index % gridSize;
              const delay = (row + col) * 0.02;

              return (
                <motion.div
                  key={`pixel-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.05, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    duration: transitionDuration * 0.5, 
                    delay,
                    ease: "easeInOut"
                  }}
                  className="bg-[var(--accent-color)] w-full h-full"
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PixelTransition;
