import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, User, Mail, Shield, Calendar,
  LogOut, RefreshCw, AlertCircle, Hash
} from 'lucide-react';
import CosmosBackground from '../components/CosmosBackground';
import FloatingParticles from '../components/FloatingParticles';

const BACKEND = 'http://localhost:8000';

/** Individual credential card */
const CredentialCard = ({ icon: Icon, label, value, delay = 0, accent = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
      ${accent
        ? 'border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5 hover:border-[var(--accent-color)]/60'
        : 'border-[var(--primary-color)]/20 bg-white/5 dark:bg-[#0d2f52] hover:border-[var(--primary-color)]/50'
      }`}
  >
    {/* Glow */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
      bg-gradient-to-br ${accent ? 'from-[var(--accent-color)]/10' : 'from-[var(--primary-color)]/10'} to-transparent`} />

    <div className="relative flex items-start gap-4">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
        ${accent ? 'bg-[var(--accent-color)]/15 text-[var(--accent-color)]' : 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1.5 opacity-70">
          {label}
        </p>
        <p className="text-[var(--text-primary)] font-semibold text-sm break-all leading-relaxed">
          {value || <span className="opacity-40 italic">—</span>}
        </p>
      </div>
    </div>
  </motion.div>
);

/**
 * ProfilePage — displays user credentials fetched from Firestore via backend.
 * Reads UID from localStorage, re-fetches from the database on every load.
 */
const ProfilePage = ({ isDark }) => {
  const navigate = useNavigate();
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchProfile = async (uid) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND}/users/${uid}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Failed to load profile.');
        return;
      }
      // Persist the freshly fetched data
      localStorage.setItem('peertutor_user', JSON.stringify(data));
      setUser(data);
    } catch {
      setError('Could not reach the backend. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('peertutor_user');
    if (!stored) {
      // Not logged in → redirect to login
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);   // show cached data immediately
    fetchProfile(parsed.uid); // then refresh from database
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('peertutor_user');
    localStorage.removeItem('peertutor_token');
    navigate('/login');
  };

  const formatDate = (iso) => {
    if (!iso) return 'Just now';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'long', timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[var(--bg-color)]">
      <CosmosBackground isDark={isDark} />
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur-md bg-[var(--bg-color)]/40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary-color)] flex items-center justify-center group-hover:rotate-12 transition-transform">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[var(--text-primary)]">PeerTutor</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => user && fetchProfile(user.uid)}
            title="Refresh from database"
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 px-4 py-16 max-w-2xl mx-auto w-full">

        {/* Error banner */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </motion.div>
        )}

        {/* Loading shimmer */}
        {loading && !user && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 dark:bg-[#0d2f52] animate-pulse border border-white/10" />
            ))}
          </div>
        )}

        {/* Profile content */}
        {user && (
          <>
            {/* Hero greeting */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-10 text-center"
            >
              {/* Avatar */}
              <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center shadow-2xl ring-4 ring-[var(--accent-color)]/20">
                <span className="text-3xl font-extrabold text-white">
                  {user.full_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
                {user.full_name}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                {user.role === 'student' ? '🎓 Student' : '📚 Tutor'} · Fetched live from Firestore
              </p>

              {/* Live badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live Database
              </div>
            </motion.div>

            {/* Divider */}
            <div className="mb-8 h-px bg-gradient-to-r from-transparent via-[var(--primary-color)]/30 to-transparent" />

            {/* Credentials grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CredentialCard icon={User}     label="Full Name"    value={user.full_name}  delay={0.05} />
              <CredentialCard icon={Mail}     label="Email"        value={user.email}       delay={0.1}  />
              <CredentialCard icon={Hash}     label="User ID (UID)" value={user.uid}        delay={0.15} />
              <CredentialCard icon={Shield}   label="Role"         value={user.role}        delay={0.2} accent />
              <CredentialCard icon={Calendar} label="Member Since" value={formatDate(user.created_at)} delay={0.25} className="sm:col-span-2" />
            </div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/"
                className="px-8 py-3.5 rounded-2xl bg-[var(--primary-color)] text-white font-bold text-sm text-center hover:brightness-110 transition-all shadow-lg hover:shadow-[var(--primary-color)]/30 hover:shadow-2xl"
              >
                🏠 Go to Homepage
              </Link>
              <button
                onClick={handleLogout}
                className="px-8 py-3.5 rounded-2xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-all"
              >
                Logout
              </button>
            </motion.div>
          </>
        )}
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-[var(--text-secondary)]/60 border-t border-white/5">
        © 2026 PeerTutor &nbsp;·&nbsp;
        <Link to="/privacy" className="hover:text-[var(--primary-color)] transition-colors">Privacy</Link>
        &nbsp;|&nbsp;<Link to="/terms" className="hover:text-[var(--primary-color)] transition-colors">Terms</Link>
        &nbsp;|&nbsp;<Link to="/contact" className="hover:text-[var(--primary-color)] transition-colors">Contact</Link>
      </footer>
    </div>
  );
};

export default ProfilePage;
