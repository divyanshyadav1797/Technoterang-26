import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import { UserSessionsProvider } from './context/UserSessionsContext';

/**
 * App — Root component.
 *
 * STATE LIFTING:  userName is owned here at the root so it can be:
 *   • Written by LoginPage  via the `setUserName` prop callback.
 *   • Read   by ProfilePage via the `userName` prop.
 *
 * This implements the Prop-Drilling / State-Lifting pattern as requested —
 * no database or context needed; the name flows purely through React props.
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

/**
 * AnimatedRoutes — must be a child of BrowserRouter so useLocation() works.
 * Wrapped in AnimatePresence to enable seamless Login → Profile transitions.
 */
function AnimatedRoutes({ isDark, toggleTheme, userName, setUserName }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
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
        <Route
          path="/login"
          element={
            <LoginPage
              isDark={isDark}
              toggleTheme={toggleTheme}
              /* STATE LIFTING: LoginPage calls this to store the user's name
                 in App-level state so ProfilePage can receive it as a prop. */
              setUserName={setUserName}
            />
          }
        />
        <Route
          path="/register"
          element={<RegisterPage isDark={isDark} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/profile"
          element={
            /* PROP DRILLING: userName flows down from App → ProfilePage */
            <ProfilePage isDark={isDark} toggleTheme={toggleTheme} userName={userName} />
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // ── Theme state ───────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // ── Lifted User Name state ────────────────────────────────────────────────
  // Seeded from localStorage so a page refresh preserves the name.
  const [userName, setUserName] = useState(() => {
    try {
      const stored = localStorage.getItem('peertutor_user');
      if (stored) return JSON.parse(stored)?.full_name || '';
    } catch { /* ignore */ }
    return '';
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
    <UserSessionsProvider>
      <BrowserRouter>
        <AnimatedRoutes
          isDark={isDark}
          toggleTheme={toggleTheme}
          userName={userName}
          setUserName={setUserName}
        />
      </BrowserRouter>
    </UserSessionsProvider>
  );
}

export default App;
