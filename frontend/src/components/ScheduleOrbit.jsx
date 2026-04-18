// ─── ScheduleOrbit.jsx ───────────────────────────────────────────────────────
// Academic Timetable — now driven entirely by UserSessionsContext.
// Falls back to an empty-state CTA when the user has no sessions yet.

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Filter, Plus, Trash2 } from 'lucide-react';
import { useTimetable } from '../context/TimetableContext';
import { useUserSessions } from '../context/UserSessionsContext';
import SessionModal from './SessionModal';

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const GRID_START = HOURS[0];
const GRID_END   = HOURS[HOURS.length - 1];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatHour(h) {
  const s = h >= 12 ? 'PM' : 'AM';
  const d = h > 12 ? h - 12 : h;
  return `${d}${s}`;
}

function getIsActive(s) {
  const now = new Date();
  const dayMap = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6, Sun:0 };
  if (dayMap[s.day] !== now.getDay()) return false;
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= s.startHour && h < s.endHour;
}

function todayDayKey() {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
}

// ── Live Time Line ────────────────────────────────────────────────────────────
function LiveTimeLine() {
  const [pct, setPct] = useState(null);
  useEffect(() => {
    function update() {
      const h = new Date().getHours() + new Date().getMinutes() / 60;
      if (h < GRID_START || h > GRID_END) { setPct(null); return; }
      setPct(((h - GRID_START) / (GRID_END - GRID_START)) * 100);
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  if (pct === null) return null;
  return (
    <div className="schedule-timeline" style={{ top: `${pct}%` }} aria-label="Current time">
      <span className="schedule-timeline-dot" />
    </div>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────────
function SessionCard({ session, adminMode, onClick, onDelete }) {
  const isActive  = getIsActive(session);
  const isStudent = session.role === 'student';
  const color     = isStudent ? '#669BBC' : '#FFCA3A';
  const bg        = isStudent ? 'rgba(102,155,188,0.15)' : 'rgba(255,202,58,0.12)';
  const rowStart  = session.startHour - GRID_START + 1;
  const rowEnd    = session.endHour   - GRID_START + 1;
  const colStart  = DAYS.indexOf(session.day) + 1;

  return (
    <motion.div
      layout={adminMode}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick({ ...session, isActive })}
      className="session-card"
      style={{
        gridRow: `${rowStart} / ${rowEnd}`,
        gridColumn: `${colStart} / span 1`,
        background: bg,
        borderLeft: `3px solid ${color}`,
        boxShadow: isActive
          ? `0 0 18px ${color}55, inset 0 0 12px ${color}11`
          : `0 2px 12px rgba(0,0,0,0.25)`,
        cursor: adminMode ? 'grab' : 'pointer',
      }}
    >
      {/* Delete button — hover reveals */}
      <button
        className="session-delete-btn"
        onClick={e => { e.stopPropagation(); onDelete(session.id); }}
        title="Delete session"
      >×</button>

      {adminMode && <GripVertical size={12} className="absolute top-1.5 right-6 opacity-40" style={{ color }} />}
      {isActive && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
          className="session-live-badge" style={{ background: color + '33', color }}
        >LIVE</motion.span>
      )}
      <p className="session-card-title" style={{ color: isStudent ? '#a8d4ef' : '#ffe27a' }}>{session.title}</p>
      <p className="session-card-meta">{session.subject}</p>
      <p className="session-card-time">{formatHour(session.startHour)} – {formatHour(session.endHour)}</p>
      {session.tags?.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {session.tags.slice(0,2).map(t => (
            <span key={t} className="text-[8px] px-1 rounded-full" style={{ background: color+'22', color }}>#{t}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Mobile Accordion ──────────────────────────────────────────────────────────
function MobileAccordion({ sessions, onSelect }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="mobile-accordion">
      {sessions.map(s => {
        const isActive = getIsActive(s);
        const color = s.role === 'student' ? '#669BBC' : '#FFCA3A';
        const isOpen = open === s.id;
        return (
          <div key={s.id} className="mobile-card" style={{ borderLeft: `3px solid ${color}` }}>
            <button className="mobile-card-header" onClick={() => setOpen(isOpen ? null : s.id)}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{s.role === 'student' ? '🎓' : '🏫'}</span>
                <div className="text-left">
                  <p className="mobile-card-title" style={{ color: s.role === 'student' ? '#a8d4ef' : '#ffe27a' }}>{s.title}</p>
                  <p className="mobile-card-sub">{s.day} · {formatHour(s.startHour)} – {formatHour(s.endHour)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isActive && <span className="session-live-badge" style={{ background: color+'33', color }}>LIVE</span>}
                <span className="mobile-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                  exit={{ height:0, opacity:0 }} transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="mobile-card-body">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {[['Subject', s.subject], ['Time', `${formatHour(s.startHour)}–${formatHour(s.endHour)}`],
                        ['Room', s.room || 'Online'], ['Peer', s.peer || 'Open']].map(([l,v]) => (
                        <div key={l} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color }}>{l}</p>
                          <p className="text-xs text-[#e8f4fd] font-semibold">{v}</p>
                        </div>
                      ))}
                    </div>
                    {s.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.tags.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: color+'22', color }}>#{t}</span>
                        ))}
                      </div>
                    )}
                    <button className="mobile-detail-btn" style={{ borderColor: color+'55', color }} onClick={() => onSelect({ ...s, isActive })}>
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

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onAddClick }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease:'easeInOut' }}
        className="text-6xl"
      >🌌</motion.div>
      <h3 className="text-[#e8f4fd] font-bold text-lg">Your orbit is empty</h3>
      <p className="text-[#94a9bd] text-sm text-center max-w-xs">
        Launch your first session and it will appear here on your personal schedule.
      </p>
      <motion.button
        whileHover={{ scale:1.05, boxShadow:'0 0 24px rgba(255,202,58,0.4)' }}
        whileTap={{ scale:0.97 }}
        onClick={onAddClick}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FFCA3A] text-[#09264A] font-bold text-sm"
      >
        <Plus size={16} /> Launch First Session
      </motion.button>
    </motion.div>
  );
}

// ── Main ScheduleOrbit ────────────────────────────────────────────────────────
export default function ScheduleOrbit({ onAddSession }) {
  const { viewMode, adminMode, subjectFilter, setSubjectFilter } = useTimetable();
  const { sessions, removeSession } = useUserSessions();
  const [selectedSession, setSelectedSession] = useState(null);
  const gridRef = useRef(null);

  // Confirm-delete with animation
  function handleDelete(id) {
    if (window.confirm('Remove this session from your orbit?')) {
      removeSession(id);
    }
  }

  // Derive all unique subjects from real sessions
  const allSubjects = ['all', ...Array.from(new Set(sessions.map(s => s.subject).filter(Boolean)))];

  // Filter sessions for the current view
  const filtered = sessions.filter(s => {
    if (s.role !== viewMode) return false;
    if (subjectFilter !== 'all' && s.subject !== subjectFilter) return false;
    return true;
  });

  // Today's label for visual highlight
  const today = todayDayKey();

  return (
    <div className="schedule-orbit-wrapper">

      {/* ── Filter Strip ── */}
      <div className="filter-strip" id="subject-filter-strip">
        <Filter size={13} className="text-[#669BBC] shrink-0" />
        {allSubjects.map(sub => (
          <motion.button
            key={sub} id={`filter-${sub.replace(/[^a-z]/gi,'')}`}
            onClick={() => setSubjectFilter(sub)}
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
            className="filter-pill"
            style={{
              background: subjectFilter === sub ? '#FFCA3A' : 'rgba(255,255,255,0.06)',
              color:      subjectFilter === sub ? '#09264A' : '#94a9bd',
              border:     subjectFilter === sub ? '1px solid #FFCA3A' : '1px solid rgba(255,255,255,0.12)',
              fontWeight: subjectFilter === sub ? 700 : 500,
            }}
          >
            {sub === 'all' ? 'All' : sub}
          </motion.button>
        ))}
      </div>

      {/* ── Desktop Grid ── */}
      <div className="schedule-desktop" ref={gridRef} id="schedule-grid">
        {/* Day headers */}
        <div className="schedule-header-row">
          <div className="schedule-time-gutter" />
          {DAYS.map(d => (
            <div key={d} className="schedule-day-header" style={{
              color: d === today ? '#FFCA3A' : undefined,
              background: d === today ? 'rgba(255,202,58,0.07)' : undefined,
            }}>
              {d}
              {d === today && <span className="block w-1 h-1 rounded-full bg-[#FFCA3A] mx-auto mt-0.5 animate-pulse" />}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState onAddClick={onAddSession} />
        ) : (
          <div className="schedule-body">
            <div className="schedule-time-gutter-col">
              {HOURS.map(h => <div key={h} className="schedule-hour-label">{formatHour(h)}</div>)}
            </div>
            <div className="schedule-grid-area" style={{ position:'relative' }}>
              {HOURS.map((h,i) => (
                <div key={h} className="schedule-hour-line" style={{ gridRow:`${i+1}`, gridColumn:`1 / -1` }} />
              ))}
              {filtered.map(s => {
                const colIdx = DAYS.indexOf(s.day);
                if (colIdx < 0) return null;
                return (
                  <SessionCard key={s.id} session={s} adminMode={adminMode}
                    onClick={setSelectedSession} onDelete={handleDelete} />
                );
              })}
              <LiveTimeLine />
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Accordion ── */}
      <div className="schedule-mobile">
        {filtered.length === 0 ? (
          <EmptyState onAddClick={onAddSession} />
        ) : (
          <MobileAccordion sessions={filtered} onSelect={setSelectedSession} />
        )}
      </div>

      {/* ── Session Detail Modal ── */}
      <AnimatePresence>
        {selectedSession && (
          <SessionModal key="session-modal" session={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
