import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import AISection from './components/AISection';
import FooterCTA from './components/FooterCTA';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

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
      <Routes>
        {/* Homepage — shared Navbar + page layout */}
        <Route
          path="/"
          element={
            <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-color)]">
              <Navbar isDark={isDark} toggleTheme={toggleTheme} />
              <HomePage />
            </div>
          }
        />

        {/* Auth pages — full-screen standalone layouts */}
        <Route path="/login"    element={<LoginPage    isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/register" element={<RegisterPage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/profile"  element={<ProfilePage  isDark={isDark} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
