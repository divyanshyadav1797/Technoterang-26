/**
 * TrueFocus — React Bits inspired implementation
 * Cycles a sharp-focus spotlight across words while others stay blurred.
 */
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrueFocus = ({
  sentence = 'Master Any Topic Together',
  manualMode = false,
  blurAmount = 4,
  borderColor = 'var(--accent-color)',
  pauseDuration = 1200,
  animationDuration = 0.5,
  className = '',
}) => {
  const words = sentence.split(' ');
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (manualMode) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length);
    }, pauseDuration);
    return () => clearInterval(intervalRef.current);
  }, [manualMode, pauseDuration, words.length]);

  return (
    <span className={`inline-flex flex-wrap gap-x-3 ${className}`}>
      {words.map((word, i) => {
        const isActive = i === activeIndex;
        return (
          <motion.span
            key={i}
            animate={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.4,
            }}
            transition={{ duration: animationDuration, ease: 'easeInOut' }}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            {word}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  key="border"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: animationDuration }}
                  style={{
                    position: 'absolute',
                    inset: '-4px -8px',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '6px',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>
          </motion.span>
        );
      })}
    </span>
  );
};

export default TrueFocus;
