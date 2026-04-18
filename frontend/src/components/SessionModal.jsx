// ─── SessionModal.jsx ─────────────────────────────────────────────────────────
// Glassmorphic modal that shows session details when a timetable slot is clicked.
// Uses framer-motion AnimatePresence for smooth enter/exit.

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, ExternalLink, Zap, Clock } from 'lucide-react';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panel = {
  hidden: { opacity: 0, scale: 0.88, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  exit:   { opacity: 0, scale: 0.9, y: 30, transition: { duration: 0.22 } },
};

/**
 * SessionModal
 * @param {object} session  – the timetable session object (or null to close)
 * @param {function} onClose
 */
export default function SessionModal({ session, onClose }) {
  if (!session) return null;

  const isActive = session.isActive ?? false;
  const roleColor = session.role === 'student' ? '#669BBC' : '#FFCA3A';

  return (
    <AnimatePresence>
      {session && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(9,38,74,0.75)', backdropFilter: 'blur(8px)' }}
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          >
            {/* ── Panel ── */}
            <motion.div
              key="modal-panel"
              variants={panel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-white/20 p-7"
              style={{
                background: 'linear-gradient(135deg, rgba(9,38,74,0.95) 0%, rgba(15,55,100,0.92) 100%)',
                boxShadow: `0 0 60px ${roleColor}33, 0 24px 64px rgba(0,0,0,0.6)`,
                borderColor: roleColor + '55',
              }}
            >
              {/* Close button */}
              <button
                id="modal-close-btn"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border border-white/15 text-white/50 hover:text-white hover:border-white/40 transition-all"
              >
                <X size={15} />
              </button>

              {/* Role badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5"
                style={{ background: roleColor + '22', color: roleColor, border: `1px solid ${roleColor}44` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: roleColor, boxShadow: `0 0 6px ${roleColor}` }}
                />
                {session.role === 'student' ? '🎓 Learning Session' : '🏫 Teaching Slot'}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-extrabold text-[#e8f4fd] leading-tight mb-1">
                {session.title}
              </h2>
              <p className="text-sm text-[#94a9bd] mb-6">{session.subject}</p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoTile icon={<MapPin size={14} />} label="Room" value={session.room || 'TBD'} color="#669BBC" />
                <InfoTile icon={<User size={14} />}   label="Peer"  value={session.peer || 'Open'} color="#FFCA3A" />
                <InfoTile icon={<Clock size={14} />}  label="Time"  value={`${session.startTime} – ${session.endTime}`} color="#669BBC" />
                <InfoTile icon={<ExternalLink size={14} />} label="Syllabus" value="View PDF →" color="#FFCA3A" isLink href={session.syllabusLink || '#'} />
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl mb-5 text-sm font-semibold"
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
                  Session is LIVE right now
                </motion.div>
              )}

              {/* CTA */}
              {isActive ? (
                <motion.button
                  id="join-session-btn"
                  whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(255,202,58,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#FFCA3A] text-[#09264A] font-extrabold text-base shadow-lg"
                >
                  <Zap size={18} className="fill-[#09264A]" />
                  Join Now — Live Session
                </motion.button>
              ) : (
                <button
                  id="remind-session-btn"
                  className="w-full py-3 rounded-2xl border border-white/15 text-[#94a9bd] text-sm font-semibold hover:border-[#669BBC]/50 hover:text-[#e8f4fd] transition-all"
                >
                  Set Reminder
                </button>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoTile({ icon, label, value, color, isLink, href }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {isLink ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#e8f4fd] hover:text-[#FFCA3A] transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-sm font-semibold text-[#e8f4fd]">{value}</p>
      )}
    </div>
  );
}
