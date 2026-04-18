import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, ArrowLeft } from 'lucide-react';

// Inline brand SVG icons (avoids lucide version issues)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);
const GithubIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color || 'currentColor'}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
import CosmosBackground from '../components/CosmosBackground';
import FloatingParticles from '../components/FloatingParticles';
import Magnet from '../components/react-bits/Magnet';

/**
 * Reusable glass input field with icon and focus micro-interaction.
 */
const GlassInput = ({ id, label, type = 'text', icon: Icon, placeholder, value, onChange, rightElement }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-[var(--primary-color)] opacity-80">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-60 group-focus-within:opacity-100 transition-opacity">
        <Icon size={16} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 text-sm backdrop-blur-sm focus:outline-none focus:border-[var(--primary-color)]/60 focus:bg-white/20 focus:shadow-[0_0_0_3px_var(--primary-color,#1982C4)1A] transition-all duration-300"
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] transition-colors">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

/**
 * Social login button.
 */
const SocialButton = ({ icon: Icon, label }) => (
  <Magnet strength={0.3} radius={80}>
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 hover:border-[var(--primary-color)]/40 hover:bg-white/20 transition-all duration-200 group min-w-[70px]"
    >
      <div className="group-hover:scale-110 transition-transform">
        <Icon />
      </div>
      <span className="text-[10px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{label}</span>
    </motion.button>
  </Magnet>
);

/**
 * LoginPage — Anti-gravity frosted glass login panel.
 */
const LoginPage = ({ isDark, toggleTheme }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const panelVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[var(--bg-color)]">
      <CosmosBackground isDark={isDark} />
      <FloatingParticles />

      {/* ── Header ── */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur-md bg-[var(--bg-color)]/40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary-color)] flex items-center justify-center group-hover:rotate-12 transition-transform">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[var(--text-primary)]">PeerTutor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
          {['Learn', 'Teach', 'Find Tutors'].map((item) => (
            <Link key={item} to={`/${item.toLowerCase().replace(' ', '-')}`}
              className="hover:text-[var(--primary-color)] transition-colors">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
            <ArrowLeft size={13} /> Back to Home
          </Link>
          <Magnet strength={0.35} radius={80}>
            <Link to="/register"
              className="px-4 py-1.5 rounded-full bg-[var(--accent-color)] text-white text-xs font-bold hover:brightness-110 transition-all">
              Register
            </Link>
          </Magnet>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
          style={{ animation: 'float 7s ease-in-out infinite alternate' }}
        >
          {/* Glow ring */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--accent-color)]/10 blur-xl pointer-events-none" />

          {/* Glass panel */}
          <div className="relative rounded-3xl border border-white/20 dark:border-white/10 bg-[var(--bg-color)]/60 dark:bg-[#09264A]/70 backdrop-blur-2xl p-8 shadow-2xl">

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
                Access Your Account
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Welcome back to your personalized learning hub.
              </p>
              {/* Glowing divider */}
              <div className="mt-4 h-px bg-gradient-to-r from-[var(--primary-color)]/50 via-[var(--accent-color)]/30 to-transparent" />
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <GlassInput
                id="login-email"
                label="Email or Username"
                type="text"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <GlassInput
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <span onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </span>
                }
              />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-[var(--primary-color)] hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>

              <Magnet strength={0.3} radius={100}>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(255,166,48,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl bg-[var(--accent-color)] text-white font-bold text-base tracking-wide shadow-xl hover:brightness-110 transition-all"
                >
                  Login
                </motion.button>
              </Magnet>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social login */}
            <div className="flex justify-center gap-3">
              <SocialButton icon={GoogleIcon} label="Google" />
              <SocialButton icon={MicrosoftIcon} label="Microsoft" />
              <SocialButton icon={() => <GithubIcon color={isDark ? '#fff' : '#24292e'} />} label="GitHub" />
            </div>

            {/* Cross-link with glowing trail */}
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register"
                className="font-bold text-[var(--primary-color)] hover:text-[var(--accent-color)] transition-colors relative group">
                Sign up
                <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] transition-all duration-300" />
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[var(--text-secondary)]/60 border-t border-white/5">
        © 2026 PeerTutor &nbsp;·&nbsp;
        <Link to="/privacy" className="hover:text-[var(--primary-color)] transition-colors">Privacy</Link>
        &nbsp;|&nbsp;
        <Link to="/terms" className="hover:text-[var(--primary-color)] transition-colors">Terms</Link>
        &nbsp;|&nbsp;
        <Link to="/contact" className="hover:text-[var(--primary-color)] transition-colors">Contact</Link>
      </footer>

      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
