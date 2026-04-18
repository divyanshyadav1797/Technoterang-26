/**
 * ShinyText — React Bits inspired implementation
 * Renders text with an animated shimmer/shine sweep effect.
 */
import './ShinyText.css';

const ShinyText = ({ text, className = '', speed = 3, disabled = false }) => {
  return (
    <span
      className={`shiny-text ${disabled ? '' : 'shiny-text--animated'} ${className}`}
      style={{ '--shiny-speed': `${speed}s` }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
