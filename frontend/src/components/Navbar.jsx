import React from 'react';
import { Moon, Sun, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ isDark, toggleTheme }) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--bg-color)] border-b border-[var(--border-color)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <BookOpen className="h-6 w-6 text-[var(--text-primary)]" />
            <span className="ml-3 text-lg font-semibold tracking-tighter text-[var(--text-primary)]">
              PeerTutor
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Auth Buttons */}
            <Link 
              to="/login" 
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-all"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 bg-[var(--accent-color)] text-[#09264A] text-sm font-semibold border border-transparent hover:brightness-110 transition-all rounded-sm"
            >
              Register
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
