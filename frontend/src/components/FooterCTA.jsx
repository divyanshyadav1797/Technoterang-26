import React from 'react';
import { motion } from 'framer-motion';

const FooterCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with slight tint */}
      <div className="absolute inset-0 bg-[var(--primary-color)]/5" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-[#0c1a30] rounded-3xl p-12 md:p-20 shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-6">
            Ready to ace your next exam?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already learning together. Create your free account and start your first session today.
          </p>
          
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#register"
            className="inline-block px-10 py-5 rounded-full bg-[var(--accent-color)] text-white text-xl font-bold shadow-xl hover:brightness-110"
          >
            Start Learning Today
          </motion.a>
        </motion.div>
      </div>
      
      {/* Simple Footer Links Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mt-20 flex flex-col md:flex-row justify-between items-center text-[var(--text-secondary)]">
        <p>© 2026 PeerTutor. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-[var(--primary-color)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--primary-color)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--primary-color)] transition-colors">Contact</a>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
