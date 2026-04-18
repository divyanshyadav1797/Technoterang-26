import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Magnet from './react-bits/Magnet';
import BlurText from './react-bits/BlurText';

/**
 * FooterCTA — Final conversion section with BlurText headline,
 * Magnet register button, and minimal footer links.
 */
const FooterCTA = () => {
  return (
    <section className="py-32 px-4 sm:px-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, var(--accent-color) 0%, transparent 70%)',
          opacity: 0.07,
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="rounded-3xl border border-[var(--primary-color)]/20 bg-[#ffffff] dark:bg-[#0d2f52] shadow-xl transition-all duration-300 p-16 md:p-24 space-y-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent-color)]">
            Get Started Today
          </p>

          <h2 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
            <BlurText
              text="Ready to ace your next exam?"
              delay={0.06}
              animateBy="words"
            />
          </h2>

          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Join thousands of students already learning together. 
            Create your free account and start your first session in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Magnet strength={0.4} radius={120}>
              <Link
                to="/register"
                id="footer-register-cta"
                className="group flex items-center gap-2 px-10 py-5 rounded-full bg-[var(--accent-color)] text-white text-lg font-bold shadow-2xl hover:brightness-110 transition-all"
              >
                Start Learning Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnet>
          </div>
        </motion.div>

        {/* Footer Links */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-secondary)]">
          <p className="opacity-60">© 2026 PeerTutor. All rights reserved.</p>
          <div className="flex gap-6 opacity-60">
            <Link to="/privacy" className="hover:text-[var(--primary-color)] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[var(--primary-color)] transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-[var(--primary-color)] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
