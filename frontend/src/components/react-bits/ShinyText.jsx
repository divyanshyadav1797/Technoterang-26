import React from 'react';

const ShinyText = ({ text, disabled = false, speed = 3, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: disabled ? 'inherit' : 'transparent',
        animation: disabled ? 'none' : `shine ${animationDuration} linear infinite`,
      }}
    >
      <style>
        {`
          @keyframes shine {
            0% { background-position: 100% 50%; }
            100% { background-position: -100% 50%; }
          }
        `}
      </style>
      <span className={disabled ? '' : 'bg-[var(--text-primary)] bg-clip-text text-transparent'}>
        {text}
      </span>
    </div>
  );
};

export default ShinyText;
