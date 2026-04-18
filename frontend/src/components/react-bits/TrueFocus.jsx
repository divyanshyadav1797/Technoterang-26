import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TrueFocus = ({ sentence, manualMode = false, blurAmount = 5, borderColor = 'var(--accent-color)', animationDuration = 0.5, pauseBetweenAnimations = 1 }) => {
  const words = sentence.split(' ');
  const [focusIndex, setFocusIndex] = useState(0);

  // Auto focus logic can go here if not manualMode, but for simplicity we'll just allow hover to focus if manual, or cycle.
  // We'll implement a simple hover-to-focus for this minimal version.

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {words.map((word, index) => {
        const isFocused = focusIndex === index;

        return (
          <motion.div
            key={index}
            onMouseEnter={() => setFocusIndex(index)}
            className="relative cursor-pointer"
            animate={{
              filter: isFocused ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isFocused ? 1 : 0.5,
              scale: isFocused ? 1.05 : 1,
            }}
            transition={{ duration: animationDuration }}
          >
            <span className="text-5xl md:text-7xl font-black text-[var(--text-primary)]">
              {word}
            </span>
            {isFocused && (
              <motion.div
                layoutId="focus-ring"
                className="absolute -inset-2 rounded-lg border-2"
                style={{ borderColor }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default TrueFocus;
