/**
 * TiltedScroll — React Bits inspired implementation
 * A grid of items rendered at a perspective tilt, scrolling into view.
 */
import { motion } from 'framer-motion';

const TiltedScroll = ({ items = [] }) => {
  return (
    <div
      className="tilted-scroll-container"
      style={{
        perspective: '1000px',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ opacity: 0, rotateX: 25, y: 60 }}
        animate={{ opacity: 1, rotateX: 15, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          transformStyle: 'preserve-3d',
          transformOrigin: 'top center',
          padding: '0 16px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--primary-color)]/20 bg-white dark:bg-[#0d2f52] p-4 text-sm text-[var(--text-secondary)]"
            style={{
              opacity: i > 2 ? 0.5 : 1,
            }}
          >
            <div className="font-semibold text-[var(--text-primary)] mb-1 truncate">
              {item.title}
            </div>
            <div className="text-xs opacity-70 truncate">{item.subtitle}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TiltedScroll;
