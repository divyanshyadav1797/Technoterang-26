import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogOut, Zap, Radio, Globe, Lock, ArrowRight, Users, Star, Cpu, Download, Settings2, Sun, Moon, TrendingUp, Clock, CalendarDays, Trash2, X } from 'lucide-react';
import CosmosBackground from '../components/CosmosBackground';
import FloatingParticles from '../components/FloatingParticles';
import ScheduleOrbit from '../components/ScheduleOrbit';
import SessionLauncher from '../components/SessionLauncher';
import { TimetableProvider, useTimetable } from '../context/TimetableContext';
import { useUserSessions } from '../context/UserSessionsContext';
import html2canvas from 'html2canvas';


// ── Cosmic Data ──────────────────────────────────────────────────────────────
const COSMIC_TITLES = ['Celestial Coder','The Logic Architect','Quantum Explorer','Neural Navigator','Data Conjurer','Algorithm Alchemist'];

const AURA_COLORS = [
  { border: '#FFCA3A', shadow: 'rgba(255,202,58,0.55)',  label: 'Solar Gold' },
  { border: '#669BBC', shadow: 'rgba(102,155,188,0.55)', label: 'Sky Pulse' },
  { border: '#a78bfa', shadow: 'rgba(167,139,250,0.55)', label: 'Violet Nebula' },
  { border: '#34d399', shadow: 'rgba(52,211,153,0.55)',  label: 'Emerald Drift' },
];

const TOPIC_ICONS = { 'AI / ML':'🤖', 'Web3':'⛓️', 'Python':'🐍', 'DSA':'🌳', 'Physics':'⚛️', 'React':'⚛️', 'Frontend':'🎨', 'Backend':'🏗️', 'ML / AI':'🤖', 'CS Basics':'💻', 'Maths':'📐', 'DevOps':'🐳', 'General':'📚' };

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Next Session Countdown reads from real context ─────────────────────────────────
function NextSessionTimer() {
  const { viewMode } = useTimetable();
  const { sessions } = useUserSessions();
  const [countdown, setCountdown] = useState('');
  const [nextSession, setNextSession] = useState(null);

  useEffect(() => {
    const DAY_MAP = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
    function compute() {
      const now = new Date();
      const todayDay = DAY_MAP[now.getDay()];
      const h = now.getHours() + now.getMinutes() / 60;
      const relevant = sessions.filter(s => s.role === viewMode && s.day === todayDay && s.startHour > h);
      if (relevant.length > 0) {
        const next = relevant.reduce((a,b) => a.startHour < b.startHour ? a : b);
        setNextSession(next);
        const diffMins = Math.round((next.startHour - h) * 60);
        const hr = Math.floor(diffMins / 60);
        const mn = diffMins % 60;
        setCountdown(hr > 0 ? `${hr}h ${mn}m` : `${mn}m`);
      } else {
        setNextSession(null);
        setCountdown(sessions.length === 0 ? 'No sessions yet' : 'None today');
      }
    }
    compute();
    const id = setInterval(compute, 30000);
    return () => clearInterval(id);
  }, [viewMode, sessions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex items-center justify-between gap-4"
      style={{ boxShadow: '0 0 30px rgba(255,202,58,0.08)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFCA3A]/15 flex items-center justify-center">
          <span className="text-xl">⏱️</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#669BBC] font-bold">Next Session</p>
          <p className="font-bold text-sm" style={{ color:'#e8f4fd' }}>{nextSession ? nextSession.title : '—'}</p>
          {nextSession && <p className="text-[10px] text-[#94a9bd]">{nextSession.subject} · {nextSession.day}</p>}
        </div>
      </div>
      <div className="text-right">
        <motion.p animate={{ opacity:[0.7,1,0.7] }} transition={{ duration:2, repeat:Infinity }}
          className="text-2xl font-extrabold text-[#FFCA3A]">{countdown}</motion.p>
        <p className="text-[10px] text-[#94a9bd]">{nextSession ? 'away' : ''}</p>
      </div>
    </motion.div>
  );
}

// ── View Toggle ───────────────────────────────────────────────────────────────
function ViewToggle() {
  const { viewMode, setViewMode, adminMode, setAdminMode } = useTimetable();
  const modes = [
    { id: 'student', label: '🎓 Student', color: '#669BBC' },
    { id: 'tutor',   label: '🏫 Faculty', color: '#FFCA3A' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Role toggle */}
      <div className="view-toggle-container">
        {modes.map((m) => (
          <button
            key={m.id}
            id={`view-toggle-${m.id}`}
            className="view-toggle-btn"
            style={{ color: viewMode === m.id ? '#09264A' : '#94a9bd' }}
            onClick={() => setViewMode(m.id)}
          >
            {viewMode === m.id && (
              <motion.span
                layoutId="view-pill"
                className="view-toggle-active-pill"
                style={{ background: m.color }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Admin rearrange toggle */}
      <motion.button
        id="admin-toggle-btn"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setAdminMode(!adminMode)}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background: adminMode ? 'rgba(255,202,58,0.15)' : 'rgba(255,255,255,0.05)',
          border: adminMode ? '1px solid rgba(255,202,58,0.5)' : '1px solid rgba(255,255,255,0.1)',
          color: adminMode ? '#FFCA3A' : '#94a9bd',
        }}
      >
        <Settings2 size={13} />
        {adminMode ? 'Admin ON' : 'Admin'}
      </motion.button>

      {adminMode && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="admin-mode-hint"
        >
          ✦ Drag-and-drop rearrange enabled
        </motion.p>
      )}
    </div>
  );
}

// ── Export Button ─────────────────────────────────────────────────────────────
function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const el = document.getElementById('schedule-grid');
    if (!el) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#09264A', scale: 2, useCORS: true });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'peertutor-trajectory.png';
      a.click();
    } catch (e) { console.error('Export failed:', e); }
    finally { setExporting(false); }
  }, []);

  return (
    <motion.button
      id="export-trajectory-btn"
      whileHover={{ scale: 1.06, boxShadow: '0 0 28px rgba(255,202,58,0.45)' }}
      whileTap={{ scale: 0.97 }}
      onClick={handleExport}
      disabled={exporting}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #FFCA3A, #f5b800)',
        color: '#09264A',
        boxShadow: '0 4px 24px rgba(255,202,58,0.35)',
      }}
    >
      <Download size={16} />
      {exporting ? 'Exporting…' : 'Download Trajectory'}
    </motion.button>
  );
}

// ── GlassCard & OrbitCard ────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', delay = 0, id, isDark = true }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay }}
    whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(102,155,188,0.22)' }}
    className={`rounded-2xl backdrop-blur-xl p-6 transition-all duration-300 ${className}`}
    style={{
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)',
      border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(102,155,188,0.25)',
      boxShadow: isDark ? 'none' : '0 4px 24px rgba(102,155,188,0.1)',
    }}
  >
    {children}
  </motion.div>
);

const OrbitCard = ({ session, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(255,202,58,0.18)' }}
    className="relative group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:border-[#FFCA3A]/40 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-2xl">{session.icon}</span>
      <span className="flex items-center gap-1 text-xs text-[#669BBC] font-semibold">
        <Users size={11} /> {session.peers}
      </span>
    </div>
    <p className="text-[#e8f4fd] font-bold text-sm leading-snug">{session.title}</p>
    <p className="text-xs text-[#94a9bd] mt-0.5">{session.subject}</p>
    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight size={13} className="text-[#FFCA3A]" />
    </div>
  </motion.div>
);

// ── Private Key Gate ─────────────────────────────────────────────────────────
function PrivateKeyGate({ session, onClose, navigate }) {
  const [key, setKey]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function verify(e) {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/verify-key`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, access_code: key.trim() }),
      });
      if (res.ok) { onClose(); navigate(`/session/${session.id}`); }
      else { const d = await res.json(); setError(d.detail || 'Invalid key.'); }
    } catch { setError('Could not reach server. Try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="w-full max-w-sm rounded-3xl p-8 backdrop-blur-2xl border border-white/15 flex flex-col gap-4"
      style={{ background: 'rgba(9,38,74,0.97)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-[#e8f4fd] text-lg">🔒 Private Session</h3>
        <button onClick={onClose} className="text-[#94a9bd] hover:text-white"><X size={18}/></button>
      </div>
      <p className="text-sm text-[#94a9bd]">{session.title}</p>
      <form onSubmit={verify} className="flex flex-col gap-3">
        <input value={key} onChange={e => setKey(e.target.value.toUpperCase())}
          placeholder="Enter access code…"
          className="px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-[#e8f4fd] font-mono tracking-widest text-sm focus:outline-none focus:border-[#FFCA3A]/60"
          maxLength={12} autoFocus />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="py-3 rounded-xl bg-[#FFCA3A] text-[#09264A] font-extrabold text-sm hover:bg-[#ffd84d] transition-all disabled:opacity-60">
          {loading ? 'Verifying…' : 'Enter Orbit →'}
        </button>
      </form>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
const ProfilePageInner = ({ isDark, toggleTheme, userName }) => {
  const navigate = useNavigate();
  const resolvedName = userName || (() => {
    try { return JSON.parse(localStorage.getItem('peertutor_user') || '{}')?.full_name || 'Cosmic Explorer'; }
    catch { return 'Cosmic Explorer'; }
  })();

  const { sessions, publicSessions, tutorSessions, removeSession, globalPublicSessions } = useUserSessions();
  // Merge local public sessions with global Firestore sessions (de-dup by id)
  const allPublicSessions = React.useMemo(() => {
    const map = new Map();
    [...publicSessions, ...globalPublicSessions].forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  }, [publicSessions, globalPublicSessions]);
  const [cosmicTitle] = useState(() => getRandom(COSMIC_TITLES));
  const [aura]        = useState(() => getRandom(AURA_COLORS));
  const [showOrbits, setShowOrbits] = useState(false);
  const [roomCode, setRoomCode]     = useState('');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [keyModal, setKeyModal]         = useState(null); // { session }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id of session pending delete

  useEffect(() => {
    const stored = localStorage.getItem('peertutor_user');
    if (!stored && !userName) navigate('/login');
  }, [navigate, userName]);

  const handleLogout = () => {
    localStorage.removeItem('peertutor_user');
    localStorage.removeItem('peertutor_token');
    navigate('/login');
  };

  const initials = resolvedName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const T = isDark
    ? { bg:'#09264A', header:'rgba(9,38,74,0.5)', headerBorder:'rgba(255,255,255,0.1)',
        text:'#e8f4fd', sub:'#94a9bd', label:'#669BBC', card:'rgba(255,255,255,0.05)',
        cardBorder:'rgba(255,255,255,0.15)', inputBg:'rgba(255,255,255,0.1)',
        inputBorder:'rgba(255,255,255,0.15)', footerBorder:'rgba(255,255,255,0.05)',
        footerText:'rgba(148,169,189,0.6)' }
    : { bg:'#f0f6ff', header:'rgba(240,246,255,0.85)', headerBorder:'rgba(102,155,188,0.2)',
        text:'#0d2137', sub:'#4a6680', label:'#1a5c8c', card:'rgba(255,255,255,0.8)',
        cardBorder:'rgba(102,155,188,0.25)', inputBg:'rgba(255,255,255,0.9)',
        inputBorder:'rgba(102,155,188,0.3)', footerBorder:'rgba(102,155,188,0.15)',
        footerText:'rgba(74,102,128,0.7)' };

  return (
    <motion.div
      key="profile-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: T.bg, transition: 'background 0.4s ease' }}
    >
      <CosmosBackground isDark={isDark} />
      {isDark && <FloatingParticles />}

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5 backdrop-blur-md" style={{ background: T.header, borderBottom: `1px solid ${T.headerBorder}` }}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#FFCA3A] flex items-center justify-center group-hover:rotate-12 transition-transform">
            <BookOpen className="w-4 h-4 text-[#09264A]" />
          </div>
          <span className="font-extrabold text-lg" style={{ color: T.text }}>PeerTutor</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            id="profile-theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: isDark ? 'rgba(255,202,58,0.15)' : 'rgba(26,92,140,0.1)', color: isDark ? '#FFCA3A' : '#1a5c8c' }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-12 gap-14 max-w-5xl mx-auto w-full">

        {/* ── SECTION 1: Cosmic Profile Card ── */}
        <motion.div
          id="cosmic-profile-card"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full max-w-lg relative"
        >
          <div className="absolute -inset-3 rounded-3xl blur-2xl pointer-events-none" style={{ background: aura.shadow, opacity: isDark ? 0.45 : 0.25 }} />
          <div className="relative rounded-3xl p-8 backdrop-blur-2xl border-2" style={{ background: T.card, borderColor: aura.border, boxShadow: `0 0 48px ${aura.shadow}` }}>
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: T.cardBorder, border: `1px solid ${T.cardBorder}`, color: T.text }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: aura.border }} />
              {aura.label} Aura
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 text-[#09264A] font-extrabold text-3xl border-4"
                style={{ background: `linear-gradient(135deg, ${aura.border}, #669BBC)`, borderColor: aura.border, boxShadow: `0 0 32px ${aura.shadow}` }}>
                {initials}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-center" style={{ color: T.text }}>{resolvedName}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Star size={13} className="text-[#FFCA3A]" fill="#FFCA3A" />
                <span className="text-sm font-semibold" style={{ color: aura.border }}>{cosmicTitle}</span>
                <Star size={13} className="text-[#FFCA3A]" fill="#FFCA3A" />
              </div>
            </div>
            <div className="rounded-xl px-5 py-4 text-center" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(102,155,188,0.08)', border: `1px solid ${T.cardBorder}` }}>
              <p className="text-xs" style={{ color: T.sub }}>
                <Cpu size={12} className="inline mr-1.5" style={{ color: T.label }} />
                Your identity is <span className="font-semibold" style={{ color: '#FFCA3A' }}>local</span>. Will be{' '}
                <span className="font-semibold" style={{ color: T.label }}>broadcasted globally</span> once you start your first session.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 2: Live Stats Bar ── */}
        <motion.section
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="w-full grid grid-cols-3 gap-3"
        >
          {[
            { icon: <CalendarDays size={18}/>, label:'Sessions', value: sessions.length, color:'#FFCA3A' },
            { icon: <TrendingUp size={18}/>,   label:'Teaching',  value: tutorSessions.length, color:'#669BBC' },
            { icon: <Globe size={18}/>,         label:'Public',    value: publicSessions.length, color:'#34d399' },
          ].map(({ icon, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale:1.04, y:-2 }}
              className="rounded-2xl p-4 flex flex-col items-center gap-1 backdrop-blur-xl"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', border:`1px solid ${color}30`, boxShadow:`0 0 20px ${color}11` }}
            >
              <div style={{ color }}>{icon}</div>
              <motion.p
                key={value}
                initial={{ scale:1.3, opacity:0 }} animate={{ scale:1, opacity:1 }}
                className="text-2xl font-extrabold" style={{ color }}
              >{value}</motion.p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: isDark ? '#94a9bd':'#4a6680' }}>{label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ── SECTION 3: Next Session Countdown ── */}
        <section id="next-session-countdown" className="w-full">
          <div className="text-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: T.label }}>Next Session Countdown</h2>
            <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#FFCA3A]/50 to-transparent" />
          </div>
          <NextSessionTimer />
        </section>

        {/* ── SECTION 4: Schedule Orbit ── */}
        <section id="schedule-orbit-section" className="w-full flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: T.label }}>Academic Schedule Orbit</h2>
            <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#FFCA3A]/50 to-transparent" />
          </div>

          {/* View toggle row */}
          <ViewToggle />

          {/* The timetable grid — onAddSession opens the launcher */}
          <ScheduleOrbit onAddSession={() => setLauncherOpen(true)} />
        </section>

        {/* ── SECTION 5: My Sessions ── */}
        <section id="my-sessions-section" className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: T.label }}>My Sessions</h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#FFCA3A]/50 to-transparent" />
            </div>
            <motion.button
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
              onClick={() => setLauncherOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background:'rgba(255,202,58,0.15)', color:'#FFCA3A', border:'1px solid rgba(255,202,58,0.3)' }}
            >
              + Schedule New
            </motion.button>
          </div>

          <div className="my-sessions-panel">
            {sessions.length === 0 ? (
              <div className="my-sessions-empty">
                🌌 No sessions yet. Launch your first session!
              </div>
            ) : (
              sessions.map((s, i) => {
                const color = s.isPublic ? '#34d399' : '#669BBC';
                const roleColor = s.role === 'tutor' ? '#FFCA3A' : '#669BBC';
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}
                    className="my-session-row"
                  >
                    <div className="my-session-dot" style={{ background: roleColor }} />
                    <div className="my-session-info">
                      <p className="my-session-title" style={{ color: T.text }}>{s.title}</p>
                      <p className="my-session-meta">
                        {s.day} · {s.startHour}:00 – {s.endHour}:00 · {s.subject}
                        {s.tags?.length > 0 && ' · ' + s.tags.slice(0,2).map(t=>`#${t}`).join(' ')}
                      </p>
                    </div>
                    <span className="my-session-badge" style={{
                      background: s.isPublic ? 'rgba(52,211,153,0.15)' : 'rgba(102,155,188,0.15)',
                      color, border:`1px solid ${color}44`
                    }}>
                      {s.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
                    {confirmDeleteId === s.id ? (
                      <span className="flex items-center gap-1">
                        <button
                          onClick={() => { removeSession(s.id); setConfirmDeleteId(null); }}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                        >Yes, delete</button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 text-[#94a9bd] font-bold hover:bg-white/20 transition-all"
                        >Cancel</button>
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                        className="my-session-delete"
                        onClick={() => setConfirmDeleteId(s.id)}
                        title="Delete session"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* ── SECTION 6: Session Command Center ── */}
        <section id="session-command-center" className="w-full flex flex-col items-center gap-8">
          <div className="text-center mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: T.label }}>Session Command Center</h2>
            <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#FFCA3A]/50 to-transparent" />
          </div>

          {/* Primary CTA — opens SessionLauncher modal */}
          <motion.button
            id="start-session-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative group"
            onClick={() => setLauncherOpen(true)}
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(255,202,58,0.25)', filter: 'blur(18px)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <span className="relative z-10 flex items-center gap-3 px-10 py-5 rounded-full bg-[#FFCA3A] text-[#09264A] font-extrabold text-lg tracking-wide shadow-[0_0_40px_rgba(255,202,58,0.5)]">
              <Zap size={22} className="fill-[#09264A]" />
              START NEW SESSION
            </span>
          </motion.button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Explore Orbits */}
            <GlassCard id="explore-orbits-card" delay={0.1} isDark={isDark}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe size={18} style={{ color: T.label }} />
                  <h3 className="font-bold text-sm" style={{ color: T.text }}>Explore Public Orbits</h3>
                </div>
                <button id="toggle-orbits-btn" onClick={() => setShowOrbits(p => !p)} className="text-xs font-semibold text-[#FFCA3A]">
                  {showOrbits ? 'Collapse ▲' : 'Expand ▼'}
                </button>
              </div>
              <p className="text-xs mb-4" style={{ color: T.sub }}>Join an active public session created by peers in the cosmos.</p>
              <AnimatePresence>
                {showOrbits && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {allPublicSessions.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: T.sub }}>No public sessions yet. Launch one above! 🚀</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {allPublicSessions.map((s, i) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ scale:1.04, boxShadow:'0 0 24px rgba(255,202,58,0.18)' }}
                            className="relative group cursor-pointer rounded-xl border border-white/10 p-4 backdrop-blur-sm hover:border-[#FFCA3A]/40 transition-all flex flex-col"
                            style={{ background: T.card }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-2xl">{TOPIC_ICONS[s.subject] || '📚'}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                                s.status==='live' ? 'bg-green-500/20 text-green-400' : 'bg-[#669BBC]/20 text-[#669BBC]'
                              }`}>{s.status === 'live' ? '● LIVE' : '◎ WAITING'}</span>
                            </div>
                            <p className="font-bold text-sm leading-snug" style={{ color: T.text }}>{s.title}</p>
                            <p className="text-xs mt-0.5 mb-2" style={{ color: T.sub }}>{s.subject}</p>
                            {s.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {s.tags.slice(0,2).map(t => (
                                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FFCA3A]/15 text-[#FFCA3A] font-bold">#{t}</span>
                                ))}
                              </div>
                            )}
                            {s.createdByName && (
                              <p className="text-[9px] mb-2" style={{ color: T.sub }}>by {s.createdByName}</p>
                            )}
                            <motion.button
                              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                              onClick={() => {
                                if (s.isPublic) navigate(`/session/${s.id}`);
                                else setKeyModal({ session: s });
                              }}
                              className="mt-auto w-full py-1.5 rounded-lg text-[10px] font-bold transition-all"
                              style={{ background:'rgba(255,202,58,0.15)', color:'#FFCA3A', border:'1px solid rgba(255,202,58,0.3)' }}
                            >
                              Enter Orbit →
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* Join Private Node */}
            <GlassCard id="join-private-node-card" delay={0.18} isDark={isDark}>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-[#FFCA3A]" />
                <h3 className="font-bold text-sm" style={{ color: T.text }}>Join Private Node</h3>
              </div>
              <p className="text-xs mb-5" style={{ color: T.sub }}>Enter a private room code to connect with a specific peer or study group.</p>
              <div className="flex gap-2">
                <input
                  id="private-room-code-input"
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ORBIT-7X2K"
                  maxLength={12}
                  className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none transition-all font-mono tracking-widest"
                  style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.text }}
                />
                <motion.button
                  id="connect-room-btn"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (!roomCode) return;
                    const found = allPublicSessions.find(s => s.accessCode === roomCode || s.id.startsWith(roomCode.toLowerCase()));
                    if (found) setKeyModal({ session: found });
                    else navigate(`/session/${roomCode}`);
                  }}
                  className="px-5 py-3 rounded-xl bg-[#FFCA3A] text-[#09264A] font-bold text-sm"
                >
                  Connect
                </motion.button>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── SECTION 5: Global Radar ── */}
        <section id="global-connection-radar" className="w-full flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Radio size={14} className="text-[#FFCA3A]" />
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: T.label }}>Global Connection Radar</h2>
              <Radio size={14} className="text-[#FFCA3A]" />
            </div>
            <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#669BBC]/50 to-transparent" />
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-medium"
            style={{ color: T.sub }}
          >
            <span className="text-[#FFCA3A] font-bold">●</span> Scanning for peers in your orbit...
          </motion.p>
        </section>

      </main>

      <footer className="relative z-10 py-4 text-center text-xs" style={{ color: T.footerText, borderTop: `1px solid ${T.footerBorder}` }}>
        © 2026 PeerTutor &nbsp;·&nbsp;
        <Link to="/privacy" className="hover:text-[#FFCA3A] transition-colors">Privacy</Link>
        &nbsp;|&nbsp;<Link to="/terms" className="hover:text-[#FFCA3A] transition-colors">Terms</Link>
      </footer>

      {/* Floating Export Button */}
      <ExportButton />

      {/* Session Launcher Modal */}
      <SessionLauncher
        isOpen={launcherOpen}
        onClose={() => setLauncherOpen(false)}
        isDark={isDark}
      />

      {/* Private Key Gate Modal */}
      <AnimatePresence>
        {keyModal && (
          <>
            <motion.div key="km-bg" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              onClick={() => setKeyModal(null)} />
            <motion.div key="km-card" initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.85, opacity:0 }}
              className="fixed inset-0 z-51 flex items-center justify-center p-4">
              <PrivateKeyGate session={keyModal.session} onClose={() => setKeyModal(null)} navigate={navigate} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Wrap with TimetableProvider so context is available to all children
const ProfilePage = (props) => (
  <TimetableProvider>
    <ProfilePageInner {...props} />
  </TimetableProvider>
);


export default ProfilePage;
