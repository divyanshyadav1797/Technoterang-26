import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, BookOpen } from 'lucide-react';
import Magnet from './react-bits/Magnet';

/**
 * Navbar — Glassmorphism sticky navbar with Magnet buttons & dark/light toggle.
 */
const Navbar = ({ isDark, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-[var(--bg-color)]/70 backdrop-blur-xl shadow-lg border-b border-white/10'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary-color)] flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            PeerTutor
          </span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors duration-200"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Login — Magnet effect */}
          <Magnet strength={0.35} radius={100}>
            <Link
              to="/login"
              id="nav-login"
              className="px-5 py-2 rounded-full text-[var(--primary-color)] font-semibold border border-[var(--primary-color)]/30 hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-200 text-sm"
            >
              Login
            </Link>
          </Magnet>

          {/* Register — Magnet effect */}
          <Magnet strength={0.4} radius={110}>
            <Link
              to="/register"
              id="nav-register"
              className="px-5 py-2 rounded-full bg-[var(--accent-color)] text-white font-bold text-sm shadow-lg hover:brightness-110 hover:shadow-[var(--accent-color)]/40 hover:shadow-xl transition-all duration-200"
            >
              Register
            </Link>
          </Magnet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
