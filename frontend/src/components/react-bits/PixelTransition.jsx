/**
 * PixelTransition — React Bits inspired implementation
 * Reveals new content using a spreading pixel/block dissolve animation.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 8; // 8x8 pixel blocks

const generateBlocks = () => {
  const blocks = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      blocks.push({ r, c, delay: Math.random() * 0.4 });
    }
  }
  return blocks;
};

const blocks = generateBlocks();

const PixelTransition = ({ children, trigger, accentColor = 'var(--accent-color)', className = '' }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeChild, setActiveChild] = useState(0);
  const childArray = Array.isArray(children) ? children : [children];

  const handleTransition = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveChild((prev) => (prev + 1) % childArray.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 500);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ position: 'relative' }}>
      <div onClick={handleTransition} style={{ cursor: 'pointer' }}>
        {childArray[activeChild]}
      </div>

      <AnimatePresence>
        {isTransitioning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            {blocks.map(({ r, c, delay }) => (
              <motion.div
                key={`${r}-${c}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.25, delay }}
                style={{ backgroundColor: accentColor }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {trigger && (
        <button
          onClick={handleTransition}
          className="absolute bottom-3 right-3 text-xs px-3 py-1 rounded-full bg-[var(--accent-color)] text-white font-semibold z-10"
        >
          {trigger}
        </button>
      )}
    </div>
  );
};

export default PixelTransition;
