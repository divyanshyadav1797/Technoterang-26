import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import AISection from './components/AISection';
import FooterCTA from './components/FooterCTA';

// Placeholder components for routing
const Login = () => <div className="min-h-screen flex items-center justify-center text-4xl font-bold">Login Page</div>;
const Register = () => <div className="min-h-screen flex items-center justify-center text-4xl font-bold">Register Page</div>;

function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return true; // Default to Dark Mode
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] transition-colors duration-300 font-sans selection:bg-[var(--accent-color)] selection:text-[var(--bg-color)]">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <FeatureGrid />
                <AISection />
                <FooterCTA />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
