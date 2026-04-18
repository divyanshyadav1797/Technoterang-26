/**
 * RollingSteps — React Bits inspired implementation
 * Sequentially reveals numbered steps with an animated roll-in.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const RollingSteps = ({ steps = [], interval = 2000, accentColor = 'var(--accent-color)' }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, interval);
    return () => clearInterval(timer);
  }, [steps.length, interval]);

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        return (
          <motion.div
            key={i}
            animate={{
              opacity: isActive ? 1 : isPast ? 0.5 : 0.25,
              x: isActive ? 0 : -8,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-start gap-4"
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors duration-300"
              style={{ backgroundColor: isActive ? accentColor : 'rgba(128,128,128,0.3)' }}
            >
              {isPast ? '✓' : i + 1}
            </div>
            <div>
              <div className={`font-semibold text-[var(--text-primary)] ${isActive ? '' : 'opacity-50'}`}>
                {step.title}
              </div>
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--text-secondary)] mt-1"
                  >
                    {step.description}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RollingSteps;
