// ─── useUserSessions.js ──────────────────────────────────────────────────────
// Custom hook separated into its own file to satisfy Vite Fast Refresh rules.
// A file can only export React components OR hooks, not both, for HMR to work.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { UserSessionsContext } from './UserSessionsContext';

export function useUserSessions() {
  const ctx = useContext(UserSessionsContext);
  if (!ctx) throw new Error('useUserSessions must be used inside <UserSessionsProvider>');
  return ctx;
}
