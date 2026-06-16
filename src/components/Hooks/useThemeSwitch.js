"use client";

import { useEffect, useRef, useState } from "react";

export function useThemeSwitch() {
  const preferDarkQuery = "(prefers-color-schema:dark)";
  const storageKey = "theme";

  const toggleTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem(storageKey, theme);
  };

  const getUserPreference = () => {
    const userPref = window.localStorage.getItem(storageKey);
    if (userPref) {
      return userPref;
    }
    return window.matchMedia(preferDarkQuery).matches ? "dark" : "light";
  };

  const [mode, setMode] = useState("dark");
  const settled = useRef(false);

  // Enable the smooth cross-fade only after the initial theme is resolved, so
  // the first paint snaps to the right theme without animating.
  useEffect(() => {
    const id = window.setTimeout(() => {
      settled.current = true;
    }, 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(preferDarkQuery);
    const handleChange = () => {
      const newMode = getUserPreference();
      setMode(newMode);
      toggleTheme(newMode);
    };

    handleChange();

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (settled.current) {
      // Briefly flag the document so globals.css applies the slow colour
      // transition to this toggle, then clear it so hovers stay snappy.
      const root = document.documentElement;
      root.classList.add("theme-transition");
      window.clearTimeout(root.__themeTransitionTimer);
      root.__themeTransitionTimer = window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 850);
    }
    toggleTheme(mode);
  }, [mode]);
  


  return [mode, setMode]
}
