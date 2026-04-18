import React from 'react';
import { motion } from 'framer-motion';

const RollingSteps = ({ steps, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-[var(--primary-color)]/20 rounded-full" />
      
      <div className="space-y-12">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative flex items-start pl-20"
          >
            <div className="absolute left-4 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[var(--bg-color)] bg-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/50 z-10">
              <span className="text-xs font-bold text-[var(--bg-color)]">{index + 1}</span>
            </div>
            
            <div className="glass p-6 rounded-3xl w-full hover:scale-[1.02] transition-transform duration-300">
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                {step.icon && <step.icon className="text-[var(--primary-color)]" size={24} />}
                {step.title}
              </h4>
              <p className="text-[var(--text-secondary)] opacity-80">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RollingSteps;
