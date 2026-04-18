// ─── TimetableContext.jsx ─────────────────────────────────────────────────────
// Persists timetable view-mode and subject filters across refreshes via
// localStorage. Wrap the app (or just the Profile route) with <TimetableProvider>.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'peertutor_timetable_prefs';

const defaults = {
  viewMode: 'student',      // 'student' | 'tutor'
  adminMode: false,         // drag-and-drop rearrange toggle
  subjectFilter: 'all',     // 'all' | subject label
};

const TimetableContext = createContext(null);

export function TimetableProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  // Persist every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* quota exceeded — ignore */ }
  }, [prefs]);

  const setViewMode     = useCallback((v) => setPrefs((p) => ({ ...p, viewMode: v })), []);
  const setAdminMode    = useCallback((v) => setPrefs((p) => ({ ...p, adminMode: v })), []);
  const setSubjectFilter= useCallback((v) => setPrefs((p) => ({ ...p, subjectFilter: v })), []);

  return (
    <TimetableContext.Provider value={{ ...prefs, setViewMode, setAdminMode, setSubjectFilter }}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const ctx = useContext(TimetableContext);
  if (!ctx) throw new Error('useTimetable must be used inside <TimetableProvider>');
  return ctx;
}
