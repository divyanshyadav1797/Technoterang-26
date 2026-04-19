// ─── UserSessionsContext.jsx ──────────────────────────────────────────────────
// Single source of truth for ALL sessions the user creates or joins.
//
// ● Local sessions (created on this device) persist to localStorage.
// ● Global public sessions come from a Firestore real-time onSnapshot listener.
// ● When a session is created via SessionLauncher, it is ALSO written to
//   Firestore via POST /sessions so other users worldwide can see it.
//
// Shape of each session object:
// {
//   id, title, day, startHour, endHour, role ('tutor'|'student'),
//   subject, description, tags, isPublic, room, peer,
//   syllabusLink, color, accessCode, imageUrl, createdAt (ISO string),
//   status ('waiting'|'live'|'complete'), createdBy, createdByName
// }
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext, useState, useCallback, useEffect, useRef,
} from 'react';
import {
  collection, onSnapshot, query, where, limit,
} from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'peertutor_sessions';
const API_BASE    = 'http://localhost:8000';

export const UserSessionsContext = createContext(null);

export function UserSessionsProvider({ children }) {
  // ── Local sessions (created by this user on this device) ─────────────────
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // ── Global public sessions from Firestore (real-time) ─────────────────────
  const [globalPublicSessions, setGlobalPublicSessions] = useState([]);
  const [firestoreError, setFirestoreError] = useState(null);
  const unsubRef = useRef(null);

  // Persist local sessions on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }
    catch { /* quota */ }
  }, [sessions]);

  // Merge helper — combines Firestore + REST results deduplicated by id
  const mergeGlobalSessions = useCallback((firestoreDocs, restDocs) => {
    const map = new Map();
    [...firestoreDocs, ...restDocs].forEach(s => map.set(s.id, s));
    const merged = Array.from(map.values())
      .filter(s => !s.status || s.status === 'waiting' || s.status === 'live')
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    setGlobalPublicSessions(merged);
  }, []);

  // Internal refs for merged state
  const firestoreDocsRef = useRef([]);
  const restDocsRef = useRef([]);

  // ── REST polling fallback ─────────────────────────────────────────────────
  // Polls GET /sessions every 5 s so sessions are visible even when the
  // Firebase JS SDK is misconfigured (e.g. placeholder appId).
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`${API_BASE}/sessions`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const docs = (data.sessions || []).map(s => ({
          ...s,
          createdAt: s.createdAt ?? '',
        }));
        restDocsRef.current = docs;
        mergeGlobalSessions(firestoreDocsRef.current, docs);
      } catch {
        // Backend offline — silent
      }
    }

    poll(); // immediate first poll
    const id = setInterval(poll, 5000); // then every 5 s
    return () => { cancelled = true; clearInterval(id); };
  }, [mergeGlobalSessions]);

  // ── Firestore real-time listener ──────────────────────────────────────────
  useEffect(() => {
    try {
      // Simple single-field query — no composite index required.
      // We filter status client-side to avoid needing a manual Firestore index.
      const q = query(
        collection(db, 'sessions'),
        where('isPublic', '==', true),
        limit(50),
      );

      unsubRef.current = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs
            .map(d => {
              const data = d.data();
              return {
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? '',
              };
            });

          firestoreDocsRef.current = docs;
          mergeGlobalSessions(docs, restDocsRef.current);
          setFirestoreError(null);
        },
        (err) => {
          console.warn('[UserSessionsContext] Firestore listener error:', err.message);
          setFirestoreError(err.message);
          // REST polling continues as fallback — no need to do anything here
        }
      );
    } catch (err) {
      console.warn('[UserSessionsContext] Could not attach Firestore listener:', err.message);
      setFirestoreError(err.message);
    }

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [mergeGlobalSessions]);

  // ── CRUD helpers ──────────────────────────────────────────────────────────

  /**
   * Adds a session to local state AND pushes it to Firestore via the backend.
   * Pass `uid` and `displayName` to identify the creator globally.
   */
  const addSession = useCallback(async (session, { uid = '', displayName = '' } = {}) => {
    // 1. Update local state immediately (optimistic)
    setSessions(prev => [session, ...prev]);

    // 2. Write to Firestore via backend (non-blocking, best-effort)
    try {
      const payload = {
        id:            session.id,
        title:         session.title,
        subject:       session.subject || 'General',
        description:   session.description || '',
        tags:          session.tags || [],
        isPublic:      session.isPublic,
        accessCode:    session.accessCode || '',
        createdBy:     uid,
        createdByName: displayName,
        day:           session.day || '',
        startHour:     session.startHour ?? 9,
        endHour:       session.endHour ?? 10,
        imageUrl:      session.imageUrl || '',
      };
      await fetch(`${API_BASE}/sessions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
    } catch (err) {
      // Backend may be offline — local session still works
      console.warn('[UserSessionsContext] Could not sync session to Firestore:', err.message);
    }
  }, []);

  const removeSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearSessions = useCallback(() => setSessions([]), []);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const publicSessions  = sessions.filter(s => s.isPublic);
  const privateSessions = sessions.filter(s => !s.isPublic);
  const tutorSessions   = sessions.filter(s => s.role === 'tutor');
  const studentSessions = sessions.filter(s => s.role === 'student');

  return (
    <UserSessionsContext.Provider value={{
      // Local (this device)
      sessions, addSession, removeSession, clearSessions,
      publicSessions, privateSessions, tutorSessions, studentSessions,
      // Global (Firestore real-time)
      globalPublicSessions,
      firestoreError,
    }}>
      {children}
    </UserSessionsContext.Provider>
  );
}

// Re-export the hook from its own file for backwards compatibility.
// All existing imports of useUserSessions from this file continue to work.
export { useUserSessions } from './useUserSessions';
