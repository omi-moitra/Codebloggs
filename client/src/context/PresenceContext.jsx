import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { getPresence } from "../services/presenceService";

const PresenceContext = createContext(null);

// How often we ask the server who is online. Each poll is also a heartbeat (it
// refreshes our own presence server-side), so this must be shorter than the
// server's active window (90s).
const POLL_INTERVAL_MS = 30 * 1000;

// Normalize the various id shapes (string, ObjectId-ish, populated doc) to a
// plain string, matching the getId pattern used across the pages.
const getId = (value) => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return String(value._id || value.$oid || value);
};

export const PresenceProvider = ({ children }) => {
  const [activeIds, setActiveIds] = useState(() => new Set());
  // Hold the latest setter target in a ref so the polling effect can stay
  // mounted for the provider's lifetime without re-subscribing each render.
  const isPollingRef = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    let intervalId = null;

    const poll = async () => {
      try {
        const { activeUserIds } = await getPresence();
        if (isCurrent) {
          setActiveIds(new Set(activeUserIds));
        }
      } catch {
        // Network blip or a 401 (handled globally by apiClient). Keep the last
        // known set rather than flickering everyone offline.
      }
    };

    const start = () => {
      if (isPollingRef.current) {
        return;
      }
      isPollingRef.current = true;
      poll(); // immediate first beat so dots appear without waiting a full cycle
      intervalId = setInterval(poll, POLL_INTERVAL_MS);
    };

    const stop = () => {
      isPollingRef.current = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Only poll while the tab is visible: a hidden/closed tab stops sending
    // heartbeats, so the user naturally drops offline after the active window.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isCurrent = false;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const isActive = useCallback(
    (userId) => activeIds.has(getId(userId)),
    [activeIds]
  );

  const value = useMemo(() => ({ isActive }), [isActive]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

PresenceProvider.propTypes = {
  children: PropTypes.node,
};

export const usePresence = () => {
  const context = useContext(PresenceContext);

  if (!context) {
    throw new Error("usePresence must be used inside PresenceProvider");
  }

  return context;
};
