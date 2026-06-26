import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import { from, interval, Subject, fromEvent } from "rxjs";
import { filter, startWith, switchMap, takeUntil } from "rxjs/operators";
import { getPresence } from "../services/presenceService";

const PresenceContext = createContext(null);

// How often we ask the server who is online. Each poll is also a heartbeat (it
// refreshes our own presence server-side), so this must be shorter than the
// server's active window (90s).
const POLL_INTERVAL_MS = 30 * 1000;

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

  useEffect(() => {
    const stop$ = new Subject();

    // Re-start the polling stream each time the tab becomes visible, and tear
    // it down when the tab is hidden. The outer switchMap cancels the previous
    // inner stream automatically on each visibility change.
    fromEvent(document, "visibilitychange")
      .pipe(
        startWith(null),
        filter(() => document.visibilityState === "visible"),
        switchMap(() =>
          interval(POLL_INTERVAL_MS).pipe(
            startWith(0),
            switchMap(() =>
              from(
                getPresence().catch(() => null) // keep last known set on blip
              )
            ),
            takeUntil(
              fromEvent(document, "visibilitychange").pipe(
                filter(() => document.visibilityState === "hidden")
              )
            )
          )
        ),
        takeUntil(stop$)
      )
      .subscribe((result) => {
        if (result?.activeUserIds) {
          setActiveIds(new Set(result.activeUserIds));
        }
      });

    return () => {
      stop$.next();
      stop$.complete();
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
