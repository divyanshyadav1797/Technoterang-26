/**
 * BlurText — React Bits inspired implementation
 * Animates each word of a text string with a blur + fade reveal.
 */
import { motion } from 'framer-motion';

const BlurText = ({
  text = '',
  delay = 0.05,
  className = '',
  animateBy = 'words',
  variant,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const defaultVariants = {
    hidden: { filter: 'blur(12px)', opacity: 0, y: 20 },
    visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
  };
  const usedVariant = variant || defaultVariants;

  return (
    <span className={className} style={{ display: 'inline-block' }}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate="visible"
          variants={usedVariant}
          transition={{ duration: 0.6, delay: i * delay, ease: 'easeOut' }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {el}
          {animateBy === 'words' && i < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
