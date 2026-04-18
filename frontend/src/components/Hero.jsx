import React from 'react';
import { motion } from 'framer-motion';
import BlurText from './react-bits/BlurText';
import Magnet from './react-bits/Magnet';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 min-h-[70vh] flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Minimalist Headline */}
        <div className="mb-8">
          <BlurText 
            text="Peer Learning, Perfected." 
            delay={0} 
            className="text-5xl md:text-7xl font-semibold tracking-tighter text-[var(--text-primary)] leading-tight" 
          />
        </div>

        {/* Animated Divider */}
        <motion.hr 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
          className="border-[var(--border-color)] mb-8"
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.8 }}
            className="text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed"
          >
            A sophisticated environment for focused study sessions. Collaborate, teach, and master any subject without distractions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 1 }}
          >
            <Magnet padding={40}>
              <button className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-color)] text-sm font-semibold hover:opacity-90 transition-opacity rounded-sm whitespace-nowrap">
                Start Session
              </button>
            </Magnet>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
