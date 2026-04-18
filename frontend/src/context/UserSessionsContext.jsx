// ─── UserSessionsContext.jsx ──────────────────────────────────────────────────
// Single source of truth for ALL sessions the user creates or joins.
// Persists to localStorage under 'peertutor_sessions'.
// Shape of each session object:
// {
//   id, title, day, startHour, endHour, role ('tutor'|'student'),
//   subject, description, tags, isPublic, room, peer,
//   syllabusLink, color, accessCode, imageUrl, createdAt (ISO string)
// }

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'peertutor_sessions';

const UserSessionsContext = createContext(null);

export function UserSessionsProvider({ children }) {
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }
    catch { /* quota */ }
  }, [sessions]);

  const addSession = useCallback((session) => {
    setSessions(prev => [session, ...prev]);
  }, []);

  const removeSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearSessions = useCallback(() => setSessions([]), []);

  // Derived helpers
  const publicSessions  = sessions.filter(s => s.isPublic);
  const privateSessions = sessions.filter(s => !s.isPublic);
  const tutorSessions   = sessions.filter(s => s.role === 'tutor');
  const studentSessions = sessions.filter(s => s.role === 'student');

  return (
    <UserSessionsContext.Provider value={{
      sessions, addSession, removeSession, clearSessions,
      publicSessions, privateSessions, tutorSessions, studentSessions,
    }}>
      {children}
    </UserSessionsContext.Provider>
  );
}

export function useUserSessions() {
  const ctx = useContext(UserSessionsContext);
  if (!ctx) throw new Error('useUserSessions must be used inside <UserSessionsProvider>');
  return ctx;
}
