import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import RollingSteps from './react-bits/RollingSteps';
import SpotlightCard from './react-bits/SpotlightCard';
import ShinyText from './react-bits/ShinyText';

/**
 * AISection — Showcases the integrated AI chatbot using RollingSteps
 * to animate how a doubt is cleared in real-time.
 */

const AI_STEPS = [
  {
    title: 'Student asks a question',
    description: '"Can you explain why integration by parts works intuitively?"',
  },
  {
    title: 'AI identifies the concept gap',
    description: 'Detects the student needs a visual analogy, not a formula derivation.',
  },
  {
    title: 'AI provides a clear hint',
    description: '"Think of it as the reverse of the product rule — undo multiplication of derivatives."',
  },
  {
    title: 'Peer builds on the hint',
    description: 'Another student adds a worked example, deepening everyone\'s understanding.',
  },
  {
    title: 'Doubt cleared ✓',
    description: 'The session continues. Micro-rewards earned for the explaining peer.',
  },
];

const AISection = () => {
  return (
    <section className="py-32 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--primary-color)]">
            Integrated AI Chatbot
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
            Never get stuck{' '}
            <span className="text-[var(--primary-color)]">again.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md">
            Our built-in AI assistant instantly clears up doubts and provides targeted hints — 
            so your session never loses momentum.
          </p>
        </motion.div>

        {/* Right — RollingSteps card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <SpotlightCard
            spotlightColor="rgba(25,130,196,0.2)"
            className="rounded-3xl border border-[var(--primary-color)]/20 bg-[#ffffff] dark:bg-[#0d2f52] shadow-sm hover:shadow-xl transition-all duration-300 p-8"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-color)]/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[var(--primary-color)]" />
              </div>
              <ShinyText
                text="AI Session — Live"
                className="text-base font-bold text-[var(--primary-color)]"
                speed={3}
              />
              <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-[var(--text-secondary)]">Active</span>
              </div>
            </div>

            {/* Rolling steps */}
            <RollingSteps
              steps={AI_STEPS}
              interval={2200}
              accentColor="var(--accent-color)"
            />
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};

export default AISection;
