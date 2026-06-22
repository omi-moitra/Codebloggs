// lib/presence.js — In-memory user presence tracking.
//
// Real-time "who is online right now" without touching the User schema. We keep
// a per-user lastSeen timestamp in a module-scoped Map (process memory only,
// never persisted). A user counts as active if their lastSeen is within
// ACTIVE_WINDOW_MS. Presence is refreshed ("touched") on every authenticated
// request via middleware/requireSession.js, and the client polls GET /presence
// on an interval, so an open tab stays active even when idle.
//
// ⚠️ This is intentionally ephemeral: a server restart clears all presence
// (everyone shows offline until their next heartbeat), and it is per-process.
// That is an acceptable trade-off for not persisting presence to the database.

// A user is "active" if seen within this window. Must be comfortably larger than
// the client heartbeat interval (~30s) so one missed beat doesn't flip them off.
export const ACTIVE_WINDOW_MS = 90 * 1000;

// userId (string) -> lastSeen epoch ms.
const lastSeenByUser = new Map();

// Record activity for a user. Called on each authenticated request.
export function touch(userId) {
  if (!userId) {
    return;
  }
  lastSeenByUser.set(String(userId), Date.now());
}

// True if the user has been seen within the active window.
export function isActive(userId) {
  const lastSeen = lastSeenByUser.get(String(userId));
  if (!lastSeen) {
    return false;
  }
  return Date.now() - lastSeen < ACTIVE_WINDOW_MS;
}

// All user ids currently within the active window. Prunes stale entries so the
// Map doesn't grow unbounded as users come and go.
export function getActiveUserIds() {
  const now = Date.now();
  const active = [];

  for (const [userId, lastSeen] of lastSeenByUser) {
    if (now - lastSeen < ACTIVE_WINDOW_MS) {
      active.push(userId);
    } else {
      lastSeenByUser.delete(userId);
    }
  }

  return active;
}

// Immediately drop a user from presence (e.g. on explicit logout).
export function clear(userId) {
  lastSeenByUser.delete(String(userId));
}
