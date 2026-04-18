import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Bot, Bell } from 'lucide-react';
import SpotlightCard from './react-bits/SpotlightCard';
import ShinyText from './react-bits/ShinyText';
import PixelTransition from './react-bits/PixelTransition';

/**
 * FeatureGrid — Hyper-minimalist Bento box layout with SpotlightCard hover glow
 * and PixelTransition for Public/Private session toggle demo.
 */

const features = [
  {
    title: 'Time-Boxed Sessions',
    description:
      'Start highly focused, time-specific study sessions to maximize productivity without burnout.',
    icon: Clock,
    span: 'md:col-span-2 md:row-span-1',
    accent: 'rgba(255,166,48,0.18)',
  },
  {
    title: 'Public & Private Rooms',
    description:
      null, // handled by PixelTransition below
    icon: Users,
    span: 'md:col-span-2 md:row-span-2',
    accent: 'rgba(25,130,196,0.18)',
    pixelTransition: true,
  },
  {
    title: 'AI Focus Alerts',
    description:
      'Stay in the zone. Smart AI alerts monitor engagement and send friendly nudges to keep the session on track.',
    icon: Bell,
    span: 'md:col-span-2 md:row-span-1',
    accent: 'rgba(255,202,58,0.18)',
  },
];

const PublicRoomDemo = () => (
  <div className="p-6 h-full flex flex-col justify-between">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
      <span className="text-sm font-semibold text-[var(--text-primary)]">Public Room</span>
    </div>
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
      Host open sessions for anyone interested in the topic — the more the merrier.
    </p>
    <div className="mt-4 flex gap-2 flex-wrap">
      {['Math', 'Physics', 'Coding'].map((tag) => (
        <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const PrivateRoomDemo = () => (
  <div className="p-6 h-full flex flex-col justify-between">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-3 h-3 rounded-full bg-[var(--accent-color)]" />
      <span className="text-sm font-semibold text-[var(--text-primary)]">Private Room</span>
    </div>
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
      Lock it down to just your friends. Share a secret code to keep sessions exclusive.
    </p>
    <div className="mt-4 flex items-center gap-2">
      <div className="flex-1 h-8 rounded-lg bg-[var(--accent-color)]/10 flex items-center px-3 text-xs text-[var(--text-secondary)]">
        🔒 Room code: <span className="font-mono font-bold ml-2 text-[var(--accent-color)]">PT-4827</span>
      </div>
    </div>
  </div>
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const FeatureGrid = () => {
  return (
    <section className="py-32 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--primary-color)] mb-4">
          Platform Features
        </p>
        <h2 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Built for how{' '}
          <span className="text-[var(--primary-color)]">students actually learn.</span>
        </h2>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 md:grid-cols-4 gap-5 auto-rows-[220px]"
      >
        {/* Card 1 — Time-Boxed Sessions */}
        <motion.div variants={cardVariants} className="md:col-span-2 md:row-span-1">
          <SpotlightCard
            spotlightColor={features[0].accent}
            className="h-full rounded-3xl border border-[var(--primary-color)]/20 bg-[#ffffff] dark:bg-[#0d2f52] hover:border-[var(--primary-color)]/50 transition-all duration-300 group shadow-sm hover:shadow-xl"
          >
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] group-hover:scale-110 group-hover:bg-[var(--primary-color)] group-hover:text-white transition-all duration-300">
                <Clock size={22} />
              </div>
              <div>
                <ShinyText
                  text={features[0].title}
                  className="text-xl font-bold text-[var(--primary-color)] mb-2"
                  speed={4}
                />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {features[0].description}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Card 2 — PixelTransition Public/Private */}
        <motion.div variants={cardVariants} className="md:col-span-2 md:row-span-2">
          <SpotlightCard
            spotlightColor={features[1].accent}
            className="h-full rounded-3xl border border-[var(--primary-color)]/20 bg-[#ffffff] dark:bg-[#0d2f52] hover:border-[var(--primary-color)]/50 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 pb-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] group-hover:bg-[var(--primary-color)] group-hover:text-white transition-all duration-300">
                  <Users size={18} />
                </div>
                <ShinyText
                  text="Public & Private Rooms"
                  className="text-lg font-bold text-[var(--primary-color)]"
                  speed={5}
                />
              </div>

              {/* PixelTransition Demo */}
              <div className="flex-1 mt-2 relative">
                <PixelTransition
                  trigger="Switch →"
                  accentColor="var(--accent-color)"
                  className="h-full"
                >
                  <PublicRoomDemo />
                  <PrivateRoomDemo />
                </PixelTransition>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Card 3 — AI Focus Alerts */}
        <motion.div variants={cardVariants} className="md:col-span-2 md:row-span-1">
          <SpotlightCard
            spotlightColor={features[2].accent}
            className="h-full rounded-3xl border border-[var(--accent-color)]/20 bg-[#ffffff] dark:bg-[#0d2f52] hover:border-[var(--accent-color)]/50 transition-all duration-300 group shadow-sm hover:shadow-xl"
          >
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] group-hover:scale-110 group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all duration-300">
                <Bell size={22} />
              </div>
              <div>
                <ShinyText
                  text={features[2].title}
                  className="text-xl font-bold text-[var(--primary-color)] mb-2"
                  speed={4}
                />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {features[2].description}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeatureGrid;
