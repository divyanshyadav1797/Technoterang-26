import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import AISection from './components/AISection';
import FooterCTA from './components/FooterCTA';

/**
 * App — Root component.
 * Manages dark/light mode state and persists it to localStorage.
 * Wraps the app in BrowserRouter for react-router-dom <Link> tags.
 */
function HomePage() {
  return (
    <main>
      <Hero />
      <FeatureGrid />
      <AISection />
      <FooterCTA />
    </main>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply 'dark' class to <html> so Tailwind dark: and CSS vars both work
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-color)]">
        {/* Sticky glassmorphism navbar */}
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />

        {/* Page routes — swap for full React Router setup as needed */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add /login, /register routes here when ready */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
