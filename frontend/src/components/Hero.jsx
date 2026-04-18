import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SplashCursor from './react-bits/SplashCursor';
import TrueFocus from './react-bits/TrueFocus';
import BlurText from './react-bits/BlurText';
import VariableProximity from './react-bits/VariableProximity';
import TiltedScroll from './react-bits/TiltedScroll';
import Magnet from './react-bits/Magnet';

const SESSION_PREVIEWS = [
  { title: '📐 Calculus: Limits & Continuity', subtitle: '12 students • 45 min' },
  { title: '⚗️ Organic Chemistry Review', subtitle: '8 students • 30 min' },
  { title: '💻 DSA: Trees & Graphs', subtitle: '20 students • 60 min' },
  { title: '📖 Shakespeare & Metaphor', subtitle: '5 students • 25 min' },
  { title: '🌍 World History: Cold War', subtitle: '15 students • 50 min' },
  { title: '🔢 Linear Algebra Fundamentals', subtitle: '10 students • 40 min' },
];

/**
 * Hero — Hyper-Minimalist AI hero with SplashCursor, TrueFocus headline,
 * VariableProximity subtext, and TiltedScroll session previews.
 */
const Hero = () => {
  const containerRef = useRef(null);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden"
    >
      {/* SplashCursor interactive background */}
      <SplashCursor color={[0.1, 0.51, 0.77]} opacity={0.3} />

      {/* Subtle ambient gradient blob */}
      <div
        aria-hidden
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)',
          opacity: 0.08,
          filter: 'blur(60px)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--primary-color)]/30 text-[var(--primary-color)] text-xs font-semibold uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
          Peer-to-Peer Micro-Tutoring
        </motion.div>

        {/* TrueFocus headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)]">
          <TrueFocus
            sentence="Master Any Topic Together"
            borderColor="var(--accent-color)"
            pauseDuration={1400}
            animationDuration={0.45}
          />
        </h1>

        {/* VariableProximity subheadline */}
        <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <VariableProximity
            label="Teach what you know. Learn what you don't. Earn micro-rewards for every session you ace."
            containerRef={containerRef}
            radius={200}
            falloff="exponential"
          />
        </p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Magnet strength={0.45} radius={120}>
            <Link
              to="/register"
              id="hero-register-cta"
              className="group flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent-color)] text-white text-base font-bold shadow-2xl hover:brightness-110 transition-all"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Magnet>

          <Magnet strength={0.3} radius={100}>
            <Link
              to="/login"
              id="hero-login-cta"
              className="px-8 py-4 rounded-full border border-[var(--primary-color)]/40 text-[var(--primary-color)] text-base font-semibold hover:bg-[var(--primary-color)]/10 transition-all"
            >
              Sign In
            </Link>
          </Magnet>
        </motion.div>
      </div>

      {/* TiltedScroll session previews */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl mx-auto mt-16 px-4"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-6 opacity-60">
          Live Public Sessions
        </p>
        <TiltedScroll items={SESSION_PREVIEWS} />
      </motion.div>
    </section>
  );
};

export default Hero;
