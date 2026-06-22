import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext(null);

const THEME_KEY = "codebloggs:theme";

// Persisted choice always wins; if the user has never toggled, fall back to
// the OS preference. SSR-safe like the other codebloggs:* storage helpers.
const readStoredTheme = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
};

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getInitialTheme = () => readStoredTheme() || getSystemTheme();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  // Whether the user has made an explicit choice (stops us from following the
  // OS once they've picked a side).
  const [isExplicit, setIsExplicit] = useState(() => readStoredTheme() !== null);

  // Drive both our own variables ([data-theme]) and Bootstrap 5.3's built-in
  // component theming ([data-bs-theme]) from the same value.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-bs-theme", theme);
  }, [theme]);

  // Follow OS changes until the user makes an explicit choice.
  useEffect(() => {
    if (isExplicit || typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [isExplicit]);

  const setExplicitTheme = useCallback((next) => {
    setTheme(next);
    setIsExplicit(true);

    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Ignore storage quota / privacy-mode failures; theme still applies for
      // the session.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setExplicitTheme(theme === "dark" ? "light" : "dark");
  }, [setExplicitTheme, theme]);

  const value = useMemo(
    () => ({
      isDarkMode: theme === "dark",
      setTheme: setExplicitTheme,
      theme,
      toggleTheme,
    }),
    [setExplicitTheme, theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
