// ─── SessionLauncher.jsx ─────────────────────────────────────────────────────
// Floating glassmorphic session-creation modal.
// Props:
//   isOpen   : boolean — controls visibility
//   onClose  : () => void
//   isDark   : boolean — theme flag
//
// Backend hook points are marked with  ← BACKEND
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Globe, Lock, Upload, Copy, Check, Zap, Tag, Clock,
  BookOpen, ChevronDown, Image as ImageIcon,
} from 'lucide-react';
import { useUserSessions } from '../context/UserSessionsContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const QUICK_TOPICS = ['AI / ML', 'Web3', 'Python', 'DSA', 'Physics', 'React', 'Math', 'Chemistry'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS   = { Mon:'Mon', Tue:'Tue', Wed:'Wed', Thu:'Thu', Fri:'Fri', Sat:'Sat', Sun:'Sun' };
const COSMIC_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#1a4a7a"/>
        <stop offset="100%" stop-color="#09264A"/>
      </radialGradient>
    </defs>
    <rect width="400" height="200" fill="url(#g)"/>
    <circle cx="200" cy="90" r="36" fill="none" stroke="#FFCA3A" stroke-width="2" opacity="0.6"/>
    <circle cx="200" cy="90" r="22" fill="none" stroke="#669BBC" stroke-width="1.5" opacity="0.5"/>
    <circle cx="200" cy="90" r="8"  fill="#FFCA3A" opacity="0.8"/>
    <circle cx="148" cy="70" r="3" fill="#669BBC" opacity="0.7"/>
    <circle cx="258" cy="115" r="4" fill="#FFCA3A" opacity="0.6"/>
    <circle cx="310" cy="55"  r="2" fill="#669BBC" opacity="0.5"/>
    <circle cx="85"  cy="140" r="3" fill="#FFCA3A" opacity="0.5"/>
    <text x="200" y="155" text-anchor="middle" fill="#94a9bd" font-size="11"
          font-family="Inter,sans-serif" opacity="0.8">Cosmic Node</text>
  </svg>
`);

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PT-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function computeEndTime(startHour, durationMinutes) {
  const totalMins = startHour * 60 + durationMinutes;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2,'0')} ${suffix}`;
}

function todayKey() {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Tag pill input — type and press Enter/comma to add */
function TagInput({ tags, setTags }) {
  const [input, setInput] = useState('');

  function addTag(raw) {
    const val = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (val && !tags.includes(val) && tags.length < 8) {
      setTags([...tags, val]);
    }
    setInput('');
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) setTags(tags.slice(0, -1));
  }

  return (
    <div className="sl-tag-input-wrap">
      {tags.map(t => (
        <span key={t} className="sl-tag">
          #{t}
          <button onClick={() => setTags(tags.filter(x => x !== t))} className="sl-tag-x">×</button>
        </span>
      ))}
      <input
        className="sl-tag-field"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        placeholder={tags.length === 0 ? 'e.g. hard, jee, beginner…' : ''}
        maxLength={20}
      />
    </div>
  );
}

/** Image upload zone */
function ImageZone({ preview, onFile }) {
  const ref = useRef();
  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }
  return (
    <div
      className="sl-image-zone"
      onClick={() => ref.current.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      <img src={preview} alt="Session cover" className="sl-image-preview" />
      <div className="sl-image-overlay">
        <Upload size={18} className="text-white" />
        <span className="text-xs text-white font-semibold mt-1">Change Cover</span>
      </div>
    </div>
  );
}

/** Privacy toggle */
function PrivacyToggle({ isPublic, onChange }) {
  return (
    <button
      type="button"
      id="privacy-toggle"
      onClick={() => onChange(!isPublic)}
      className="sl-privacy-toggle"
      style={{ justifyContent: isPublic ? 'flex-start' : 'flex-end' }}
    >
      <motion.div
        className="sl-privacy-thumb"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{ background: isPublic ? '#FFCA3A' : '#669BBC' }}
      >
        {isPublic ? <Globe size={12} style={{ color: '#09264A' }} /> : <Lock size={12} className="text-white" />}
      </motion.div>
    </button>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ isPublic, code, sessionId, onClose, onEnterSession }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sl-success"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
        className="sl-success-icon"
        style={{ background: isPublic ? 'rgba(255,202,58,0.15)' : 'rgba(102,155,188,0.15)' }}
      >
        {isPublic
          ? <Globe size={36} style={{ color: '#FFCA3A' }} />
          : <Lock   size={36} style={{ color: '#669BBC' }} />
        }
      </motion.div>

      <h2 className="sl-success-title">
        {isPublic ? '🌐 Live Globally!' : '🔒 Private Node Ready'}
      </h2>
      <p className="sl-success-sub">
        {isPublic
          ? 'Your session is now visible to all learners in the cosmos.'
          : 'Share this access code with your friends to join.'}
      </p>

      {/* Private code display */}
      {!isPublic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sl-code-block"
        >
          <motion.span
            animate={{ textShadow: ['0 0 20px #FFCA3A88', '0 0 40px #FFCA3Acc', '0 0 20px #FFCA3A88'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="sl-code-text"
          >
            {code}
          </motion.span>
          <button id="copy-code-btn" onClick={copy} className="sl-copy-btn">
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="ok"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1"><Check size={14}/> Copied!</motion.span>
                : <motion.span key="cp"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1"><Copy size={14}/> Copy</motion.span>
              }
            </AnimatePresence>
          </button>
        </motion.div>
      )}

      {isPublic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          className="sl-live-pill"
        >
          <span className="sl-live-dot" />
          SESSION IS LIVE
        </motion.div>
      )}

      <motion.button
        id="enter-session-btn"
        onClick={onEnterSession}
        whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,202,58,0.5)' }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl bg-[#FFCA3A] text-[#09264A] font-extrabold text-sm tracking-wide flex items-center justify-center gap-2"
        style={{ boxShadow: '0 4px 24px rgba(255,202,58,0.35)' }}
      >
        <Zap size={16} className="fill-[#09264A]" /> Enter Session Room
      </motion.button>

      <button id="close-success-btn" onClick={onClose} className="sl-close-success-btn">
        Back to Dashboard
      </button>
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function SessionLauncher({ isOpen, onClose, isDark = true }) {
  const { addSession } = useUserSessions();
  const navigate = useNavigate();
  const [createdSessionId, setCreatedSessionId] = useState('');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle]             = useState('');
  const [scheduledDay, setScheduledDay] = useState(() => todayKey());
  const [startHour, setStartHour]     = useState(() => new Date().getHours());
  const [duration, setDuration]       = useState(60);
  const [topics, setTopics]           = useState([]);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustom, setShowCustom]   = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags]               = useState([]);
  const [isPublic, setIsPublic]       = useState(true);
  const [imagePreview, setImagePreview] = useState(COSMIC_PLACEHOLDER);
  const [phase, setPhase]             = useState('form');
  const [accessCode, setAccessCode]   = useState('');
  const [errors, setErrors]           = useState({});

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setScheduledDay(todayKey());
      setStartHour(new Date().getHours());
      setDuration(60);
      setTopics([]); setCustomTopic('');
      setShowCustom(false); setDescription(''); setTags([]); setIsPublic(true);
      setImagePreview(COSMIC_PLACEHOLDER); setPhase('form'); setErrors({});
    }
  }, [isOpen]);

  // Image file handler
  const handleImageFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // Topic toggle
  function toggleTopic(t) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  // Validate
  function validate() {
    const e = {};
    if (!title.trim()) e.title = 'Session title is required.';
    const allTopics = [...topics, ...(showCustom && customTopic.trim() ? [customTopic.trim()] : [])];
    if (allTopics.length === 0) e.topics = 'Pick at least one topic.';
    return e;
  }

  // Submit
  async function handleLaunch() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setPhase('loading');

    const allTopics = [...topics, ...(showCustom && customTopic.trim() ? [customTopic.trim()] : [])];

    const durationHours = Math.max(1, Math.round(duration / 60));
    const endHour = Math.min(startHour + durationHours, 22);
    const code = isPublic ? '' : generateAccessCode();

    const newSession = {
      id:          `s_${Date.now()}`,
      title:       title.trim(),
      day:         scheduledDay,
      startHour,
      endHour,
      role:        'tutor',
      subject:     allTopics[0] || 'General',
      description: description.trim(),
      tags,
      isPublic,
      room:        'Online',
      peer:        '0 students',
      syllabusLink:'#',
      color:       '#FFCA3A',
      accessCode:  code,
      imageUrl:    imagePreview,
      createdAt:   new Date().toISOString(),
    };

    await new Promise(r => setTimeout(r, 900));

    // Get user info for Firestore sync
    let uid = '', displayName = '';
    try {
      const stored = JSON.parse(localStorage.getItem('peertutor_user') || '{}');
      uid = stored.uid || '';
      displayName = stored.full_name || '';
    } catch {}

    addSession(newSession, { uid, displayName });
    setAccessCode(code);
    setCreatedSessionId(newSession.id);
    setPhase('success');
  }

  const endTimePreview = computeEndTime(startHour, duration);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="sl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={phase !== 'loading' ? onClose : undefined}
            className="sl-backdrop"
          />

          {/* ── Floating card ── */}
          <div className="sl-center">
            <motion.div
              key="sl-card"
              initial={{ opacity: 0, scale: 0.82, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{
                opacity:  { duration: 0.35 },
                scale:    { type: 'spring', stiffness: 300, damping: 26 },
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
              }}
              className="sl-card"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(9,38,74,0.97) 0%, rgba(13,52,98,0.96) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,246,255,0.95) 100%)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(102,155,188,0.3)',
                color: isDark ? '#e8f4fd' : '#0d2137',
              }}
            >
              <AnimatePresence mode="wait">
                {/* ── FORM PHASE ── */}
                {(phase === 'form' || phase === 'loading') && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Header */}
                    <div className="sl-header">
                      <div className="sl-header-left">
                        <div className="sl-logo-icon">
                          <BookOpen size={16} style={{ color: '#09264A' }} />
                        </div>
                        <div>
                          <h2 className="sl-title">Launch Session</h2>
                          <p className="sl-subtitle" style={{ color: isDark ? '#94a9bd' : '#4a6680' }}>
                            Configure your cosmic learning node
                          </p>
                        </div>
                      </div>
                      <button
                        id="sl-close-btn"
                        onClick={onClose}
                        className="sl-x-btn"
                        style={{ color: isDark ? '#94a9bd' : '#4a6680', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="sl-body">
                      {/* Image zone */}
                      <ImageZone preview={imagePreview} onFile={handleImageFile} />

                      {/* Title */}
                      <div className="sl-field">
                        <label className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                          <BookOpen size={12} /> Session Title *
                        </label>
                        <input
                          id="sl-title-input"
                          className="sl-input"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                            border: errors.title ? '1px solid #f87171' : isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(102,155,188,0.3)',
                            color: isDark ? '#e8f4fd' : '#0d2137',
                          }}
                          placeholder="e.g. React Hooks Deep Dive"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                        />
                        {errors.title && <p className="sl-error">{errors.title}</p>}
                      </div>

                      {/* ── Schedule: Day + Time ── */}
                      <div className="sl-field">
                        <label className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                          📅 Schedule
                        </label>
                        {/* Day picker */}
                        <div className="sl-day-grid">
                          {DAYS_OF_WEEK.map(d => {
                            const active = scheduledDay === d;
                            return (
                              <motion.button
                                key={d} type="button"
                                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setScheduledDay(d)}
                                className="sl-day-chip"
                                style={{
                                  background: active ? '#669BBC' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                                  color: active ? '#fff' : isDark ? '#94a9bd' : '#4a6680',
                                  border: active ? '1px solid #669BBC' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(102,155,188,0.25)',
                                  fontWeight: active ? 700 : 500,
                                }}
                              >{d}</motion.button>
                            );
                          })}
                        </div>
                        {/* Time + duration row */}
                        <div className="sl-time-row">
                          <div className="sl-time-block">
                            <span className="sl-time-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>Start</span>
                            <input
                              id="sl-start-time"
                              type="number" min={0} max={23}
                              value={startHour}
                              onChange={e => setStartHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                              className="sl-time-input"
                              style={{
                                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(102,155,188,0.3)',
                                color: isDark ? '#e8f4fd' : '#0d2137',
                              }}
                            />
                            <span className="sl-time-unit" style={{ color: isDark ? '#94a9bd':'#4a6680' }}>
                              {startHour >= 12 ? 'PM' : 'AM'} (hour {startHour})
                            </span>
                          </div>
                          <div className="sl-time-arrow" style={{ color: isDark?'#FFCA3A':'#b07d00' }}>→</div>
                          <div className="sl-time-block">
                            <span className="sl-time-label" style={{ color: isDark ? '#FFCA3A' : '#b07d00' }}>Ends</span>
                            <span className="sl-time-end" style={{ color: isDark ? '#FFCA3A' : '#b07d00' }}>{endTimePreview}</span>
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="sl-field">
                        <label className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                          <Clock size={12} /> Duration
                        </label>
                        <div className="sl-duration-row">
                          <input
                            id="sl-duration-slider"
                            type="range" min={15} max={240} step={15}
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="sl-slider"
                          />
                          <span className="sl-duration-pill">
                            {duration >= 60 ? `${Math.floor(duration/60)}h ${duration%60 ? duration%60+'m':''}` : `${duration}m`}
                          </span>
                        </div>
                      </div>

                      {/* Topics */}
                      <div className="sl-field">
                        <label className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                          <Tag size={12} /> Topics *
                        </label>
                        <div className="sl-topic-grid">
                          {QUICK_TOPICS.map(t => {
                            const active = topics.includes(t);
                            return (
                              <motion.button
                                key={t}
                                type="button"
                                id={`topic-${t.replace(/[^a-z]/gi,'')}`}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => toggleTopic(t)}
                                className="sl-topic-chip"
                                style={{
                                  background: active ? '#FFCA3A' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)',
                                  color: active ? '#09264A' : isDark ? '#94a9bd' : '#4a6680',
                                  border: active ? '1px solid #FFCA3A' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(102,155,188,0.25)',
                                  fontWeight: active ? 700 : 500,
                                }}
                              >
                                {active && <Check size={11} />}
                                {t}
                              </motion.button>
                            );
                          })}

                          {/* Other toggle */}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowCustom(p => !p)}
                            className="sl-topic-chip"
                            style={{
                              background: showCustom ? 'rgba(102,155,188,0.25)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                              color: isDark ? '#669BBC' : '#1a5c8c',
                              border: `1px solid ${showCustom ? '#669BBC' : 'rgba(102,155,188,0.25)'}`,
                            }}
                          >
                            + Other
                          </motion.button>
                        </div>

                        <AnimatePresence>
                          {showCustom && (
                            <motion.input
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="sl-input mt-2"
                              style={{
                                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(102,155,188,0.3)',
                                color: isDark ? '#e8f4fd' : '#0d2137',
                              }}
                              placeholder="Enter custom topic…"
                              value={customTopic}
                              onChange={e => setCustomTopic(e.target.value)}
                            />
                          )}
                        </AnimatePresence>
                        {errors.topics && <p className="sl-error">{errors.topics}</p>}
                      </div>

                      {/* Description */}
                      <div className="sl-field">
                        <label className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                          📝 Description
                        </label>
                        <textarea
                          id="sl-description"
                          className="sl-input sl-textarea"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(102,155,188,0.3)',
                            color: isDark ? '#e8f4fd' : '#0d2137',
                          }}
                          placeholder="What will you cover in this session? Give a brief overview…"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Tags */}
                      <div className="sl-field">
                        <label className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                          <Tag size={12} /> Quick Tags
                          <span className="sl-label-hint">(Enter or comma to add)</span>
                        </label>
                        <div
                          className="sl-input"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(102,155,188,0.3)',
                            padding: '0.4rem 0.75rem',
                            height: 'auto',
                          }}
                        >
                          <TagInput tags={tags} setTags={setTags} />
                        </div>
                      </div>

                      {/* Privacy toggle */}
                      <div className="sl-field sl-privacy-row">
                        <div>
                          <p className="sl-label" style={{ color: isDark ? '#669BBC' : '#1a5c8c' }}>
                            {isPublic ? <Globe size={12} className="inline mr-1" /> : <Lock size={12} className="inline mr-1" />}
                            {isPublic ? 'Public Orbit' : 'Private Node'}
                          </p>
                          <p className="sl-privacy-hint" style={{ color: isDark ? '#94a9bd' : '#4a6680' }}>
                            {isPublic ? 'Visible to all learners globally' : 'Only accessible with access code'}
                          </p>
                        </div>
                        <PrivacyToggle isPublic={isPublic} onChange={setIsPublic} />
                      </div>

                      {/* Submit */}
                      <motion.button
                        id="sl-launch-btn"
                        type="button"
                        onClick={handleLaunch}
                        disabled={phase === 'loading'}
                        whileHover={phase !== 'loading' ? { scale: 1.03, boxShadow: '0 0 40px rgba(255,202,58,0.6)' } : {}}
                        whileTap={phase !== 'loading' ? { scale: 0.97 } : {}}
                        className="sl-launch-btn"
                      >
                        {phase === 'loading' ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block w-5 h-5 border-2 border-[#09264A] border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            {/* Pulsing glow ring */}
                            <motion.span
                              className="sl-btn-glow"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                              transition={{ duration: 2.2, repeat: Infinity }}
                            />
                            <Zap size={18} className="fill-[#09264A] relative z-10" />
                            <span className="relative z-10">START SESSION</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS PHASE ── */}
                {phase === 'success' && (
                  <SuccessScreen
                    key="success"
                    isPublic={isPublic}
                    code={accessCode}
                    sessionId={createdSessionId}
                    onClose={onClose}
                    onEnterSession={() => {
                      onClose();
                      navigate(`/session/${createdSessionId}`);
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
