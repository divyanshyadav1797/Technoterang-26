// ─── ScheduleOrbit.jsx ───────────────────────────────────────────────────────
// The full Academic Timetable System:
//   • CSS Grid mapping days × hours
//   • Live time indicator (pulsing horizontal line)
//   • Color-coded by role (student=blue / tutor=gold)
//   • Subject filter pill strip
//   • Admin drag-visual toggle
//   • Mobile accordion fallback via CSS media query

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Filter } from 'lucide-react';
import { useTimetable } from '../context/TimetableContext';
import SessionModal from './SessionModal';

// ─── Mock Timetable Data ───────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // 8 AM – 6 PM

const SESSIONS = [
  // Student sessions
  { id: 's1', day: 'Mon', startHour: 9,  endHour: 10, role: 'student', title: 'React Hooks Help',   subject: 'Frontend',  room: 'Lab-3A', peer: 'Priya S.', syllabusLink: '#', color: '#669BBC' },
  { id: 's2', day: 'Mon', startHour: 14, endHour: 15, role: 'student', title: 'DSA Crash Course',   subject: 'CS Basics', room: 'Hall-B', peer: 'Raj M.',   syllabusLink: '#', color: '#669BBC' },
  { id: 's3', day: 'Tue', startHour: 10, endHour: 12, role: 'student', title: 'Python for AI',      subject: 'ML / AI',   room: 'Lab-2', peer: 'Ananya K.',syllabusLink: '#', color: '#669BBC' },
  { id: 's4', day: 'Wed', startHour: 8,  endHour: 9,  role: 'student', title: 'Calculus Deep Dive', subject: 'Maths',     room: 'Room-5',peer: 'Dev P.',   syllabusLink: '#', color: '#669BBC' },
  { id: 's5', day: 'Thu', startHour: 15, endHour: 16, role: 'student', title: 'System Design 101',  subject: 'Backend',   room: 'Hall-A', peer: 'Sara L.',  syllabusLink: '#', color: '#669BBC' },
  { id: 's6', day: 'Fri', startHour: 11, endHour: 12, role: 'student', title: 'CSS Wizardry',       subject: 'Frontend',  room: 'Lab-1', peer: 'Nik T.',   syllabusLink: '#', color: '#669BBC' },
  { id: 's7', day: 'Sat', startHour: 10, endHour: 11, role: 'student', title: 'Cloud Basics',       subject: 'DevOps',    room: 'Online', peer: 'Meera R.', syllabusLink: '#', color: '#669BBC' },

  // Tutor sessions
  { id: 't1', day: 'Mon', startHour: 11, endHour: 13, role: 'tutor', title: 'JS Fundamentals',       subject: 'Frontend', room: 'Lab-4B', peer: '4 students',syllabusLink: '#', color: '#FFCA3A' },
  { id: 't2', day: 'Tue', startHour: 14, endHour: 16, role: 'tutor', title: 'Algo Masterclass',      subject: 'CS Basics',room: 'Hall-C', peer: '7 students',syllabusLink: '#', color: '#FFCA3A' },
  { id: 't3', day: 'Wed', startHour: 10, endHour: 11, role: 'tutor', title: 'Database Design',       subject: 'Backend',  room: 'Lab-2B', peer: '3 students',syllabusLink: '#', color: '#FFCA3A' },
  { id: 't4', day: 'Thu', startHour: 9,  endHour: 10, role: 'tutor', title: 'Pandas & NumPy',        subject: 'ML / AI',  room: 'Room-7', peer: '5 students',syllabusLink: '#', color: '#FFCA3A' },
  { id: 't5', day: 'Fri', startHour: 13, endHour: 15, role: 'tutor', title: 'React Advanced Patterns',subject: 'Frontend',room: 'Lab-1', peer: '6 students', syllabusLink: '#', color: '#FFCA3A' },
  { id: 't6', day: 'Sat', startHour: 14, endHour: 16, role: 'tutor', title: 'Docker & CI/CD',        subject: 'DevOps',   room: 'Online', peer: '8 students',syllabusLink: '#', color: '#FFCA3A' },
];

const ALL_SUBJECTS = ['all', ...Array.from(new Set(SESSIONS.map((s) => s.subject)))];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIsActive(session) {
  const now = new Date();
  const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  if (dayMap[session.day] !== now.getDay()) return false;
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= session.startHour && h < session.endHour;
}

function formatHour(h) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h;
  return `${display}${suffix}`;
}

// ─── Live Time Line ────────────────────────────────────────────────────────────

function LiveTimeLine({ gridStart, gridEnd }) {
  const [pct, setPct] = useState(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      if (h < gridStart || h > gridEnd) { setPct(null); return; }
      setPct(((h - gridStart) / (gridEnd - gridStart)) * 100);
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [gridStart, gridEnd]);

  if (pct === null) return null;

  return (
    <div
      className="schedule-timeline"
      style={{ top: `${pct}%` }}
      aria-label="Current time indicator"
    >
      <span className="schedule-timeline-dot" />
    </div>
  );
}

// ─── Single Session Card ───────────────────────────────────────────────────────

function SessionCard({ session, adminMode, onClick, colIdx, totalCols }) {
  const isActive = getIsActive(session);
  const isStudent = session.role === 'student';
  const baseColor = isStudent ? '#669BBC' : '#FFCA3A';
  const bgColor   = isStudent ? 'rgba(102,155,188,0.15)' : 'rgba(255,202,58,0.12)';

  // CSS grid placement: rows are 1-indexed; hour 8 → row 1, hour 9 → row 2 etc.
  const GRID_START_HOUR = HOURS[0];
  const rowStart = session.startHour - GRID_START_HOUR + 1;
  const rowEnd   = session.endHour   - GRID_START_HOUR + 1;
  const colStart = colIdx + 1;
  const colSpan  = 1;

  return (
    <motion.div
      layout={adminMode}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick({ ...session, isActive })}
      className="session-card"
      style={{
        gridRow: `${rowStart} / ${rowEnd}`,
        gridColumn: `${colStart} / span ${colSpan}`,
        background: bgColor,
        borderLeft: `3px solid ${baseColor}`,
        boxShadow: isActive
          ? `0 0 18px ${baseColor}55, inset 0 0 12px ${baseColor}11`
          : `0 2px 12px rgba(0,0,0,0.25)`,
        cursor: adminMode ? 'grab' : 'pointer',
      }}
    >
      {adminMode && (
        <GripVertical size={12} className="absolute top-1.5 right-1.5 opacity-40" style={{ color: baseColor }} />
      )}

      {isActive && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="session-live-badge"
          style={{ background: baseColor + '33', color: baseColor }}
        >
          LIVE
        </motion.span>
      )}

      <p className="session-card-title" style={{ color: isStudent ? '#a8d4ef' : '#ffe27a' }}>
        {session.title}
      </p>
      <p className="session-card-meta">{session.subject}</p>
      <p className="session-card-time">
        {formatHour(session.startHour)} – {formatHour(session.endHour)}
      </p>
    </motion.div>
  );
}

// ─── Mobile Accordion ─────────────────────────────────────────────────────────

function MobileAccordion({ sessions, onSelect }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="mobile-accordion">
      {sessions.map((s, i) => {
        const isActive = getIsActive(s);
        const color = s.role === 'student' ? '#669BBC' : '#FFCA3A';
        const isOpen = open === s.id;
        return (
          <div key={s.id} className="mobile-card" style={{ borderLeft: `3px solid ${color}` }}>
            <button
              className="mobile-card-header"
              onClick={() => setOpen(isOpen ? null : s.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{s.role === 'student' ? '🎓' : '🏫'}</span>
                <div className="text-left">
                  <p className="mobile-card-title" style={{ color: s.role === 'student' ? '#a8d4ef' : '#ffe27a' }}>
                    {s.title}
                  </p>
                  <p className="mobile-card-sub">{s.day} · {formatHour(s.startHour)} – {formatHour(s.endHour)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="session-live-badge" style={{ background: color + '33', color }}>LIVE</span>
                )}
                <span className="mobile-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="mobile-card-body">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <MiniTile label="Room"    value={s.room}    color={color} />
                      <MiniTile label="Peer"    value={s.peer}    color={color} />
                      <MiniTile label="Subject" value={s.subject} color={color} />
                    </div>
                    <button
                      className="mobile-detail-btn"
                      style={{ borderColor: color + '55', color }}
                      onClick={() => onSelect({ ...s, isActive })}
                    >
                      View Full Details →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function MiniTile({ label, value, color }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color }}>{label}</p>
      <p className="text-xs text-[#e8f4fd] font-semibold">{value}</p>
    </div>
  );
}

// ─── Main ScheduleOrbit ────────────────────────────────────────────────────────

export default function ScheduleOrbit() {
  const { viewMode, adminMode, subjectFilter, setSubjectFilter } = useTimetable();
  const [selectedSession, setSelectedSession] = useState(null);
  const gridRef = useRef(null);

  const filteredSessions = SESSIONS.filter((s) => {
    if (s.role !== viewMode) return false;
    if (subjectFilter !== 'all' && s.subject !== subjectFilter) return false;
    return true;
  });

  const GRID_START_HOUR = HOURS[0];
  const GRID_END_HOUR   = HOURS[HOURS.length - 1];

  return (
    <div className="schedule-orbit-wrapper">
      {/* ── Subject Filter Strip ── */}
      <div className="filter-strip" id="subject-filter-strip">
        <Filter size={13} className="text-[#669BBC] shrink-0" />
        {ALL_SUBJECTS.map((sub) => (
          <motion.button
            key={sub}
            id={`filter-${sub}`}
            onClick={() => setSubjectFilter(sub)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="filter-pill"
            style={{
              background: subjectFilter === sub ? '#FFCA3A' : 'rgba(255,255,255,0.06)',
              color:      subjectFilter === sub ? '#09264A' : '#94a9bd',
              border:     subjectFilter === sub ? '1px solid #FFCA3A' : '1px solid rgba(255,255,255,0.12)',
              fontWeight: subjectFilter === sub ? 700 : 500,
            }}
          >
            {sub === 'all' ? 'All Subjects' : sub}
          </motion.button>
        ))}
      </div>

      {/* ── Desktop Grid ── */}
      <div className="schedule-desktop" ref={gridRef} id="schedule-grid">
        {/* Column headers (days) */}
        <div className="schedule-header-row">
          <div className="schedule-time-gutter" />
          {DAYS.map((d) => (
            <div key={d} className="schedule-day-header">{d}</div>
          ))}
        </div>

        {/* Body: time gutter + grid columns */}
        <div className="schedule-body">
          {/* Time gutter */}
          <div className="schedule-time-gutter-col">
            {HOURS.map((h) => (
              <div key={h} className="schedule-hour-label">{formatHour(h)}</div>
            ))}
          </div>

          {/* Grid columns per day */}
          <div className="schedule-grid-area" style={{ position: 'relative' }}>
            {/* Background hour lines */}
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="schedule-hour-line"
                style={{ gridRow: `${i + 1}`, gridColumn: `1 / -1` }}
              />
            ))}

            {/* Session cards */}
            {filteredSessions.map((s, i) => {
              const colIdx = DAYS.indexOf(s.day);
              if (colIdx < 0) return null;
              return (
                <SessionCard
                  key={s.id}
                  session={s}
                  adminMode={adminMode}
                  onClick={setSelectedSession}
                  colIdx={colIdx}
                  totalCols={DAYS.length}
                />
              );
            })}

            {/* Live time indicator */}
            <LiveTimeLine gridStart={GRID_START_HOUR} gridEnd={GRID_END_HOUR} />
          </div>
        </div>

        {/* No sessions placeholder */}
        {filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-sessions-placeholder"
          >
            <span className="text-4xl mb-3">🌌</span>
            <p className="text-[#94a9bd]">No sessions match your current filters.</p>
          </motion.div>
        )}
      </div>

      {/* ── Mobile Accordion ── */}
      <div className="schedule-mobile">
        {filteredSessions.length === 0 ? (
          <div className="no-sessions-placeholder">
            <span className="text-4xl mb-3">🌌</span>
            <p className="text-[#94a9bd]">No sessions match your current filters.</p>
          </div>
        ) : (
          <MobileAccordion sessions={filteredSessions} onSelect={setSelectedSession} />
        )}
      </div>

      {/* ── Session Detail Modal ── */}
      <AnimatePresence>
        {selectedSession && (
          <SessionModal
            key="session-modal"
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
