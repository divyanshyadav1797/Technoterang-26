import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TiltedScroll = ({ items, className = '' }) => {
  const { scrollYProgress } = useScroll();
  
  // Transform scroll progress to rotation and perspective
  const rotateX = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <div className={`perspective-[1000px] flex justify-center py-20 overflow-hidden ${className}`}>
      <motion.div
        style={{ rotateX, scale }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transform-style-3d"
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="w-64 h-40 rounded-2xl glass p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer"
            whileHover={{ y: -10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--accent-color)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-bold z-10">{item.title}</h3>
            <p className="text-sm opacity-80 z-10">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TiltedScroll;
