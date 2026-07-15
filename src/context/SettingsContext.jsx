import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

const DEFAULTS = {
  theme: "dark",
  alarmSound: "chime",
  alarmVolume: 0.5,
  longBreakInterval: 4,
};

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const applyThemeToDom = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  useEffect(() => {
    if (!user) {
      // Not logged in yet: fall back to a locally-remembered theme so the
      // login screen itself can still respect dark/light preference.
      const localTheme = localStorage.getItem("embers_theme") || "dark";
      applyThemeToDom(localTheme);
      setSettings((s) => ({ ...s, theme: localTheme }));
      setLoaded(true);
      return;
    }
    (async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
        applyThemeToDom(data.theme);
        localStorage.setItem("embers_theme", data.theme);
      } catch (e) {
        applyThemeToDom(DEFAULTS.theme);
      } finally {
        setLoaded(true);
      }
    })();
  }, [user]);

  const updateSettings = useCallback(
    async (patch) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      if (patch.theme) {
        applyThemeToDom(patch.theme);
        localStorage.setItem("embers_theme", patch.theme);
      }
      if (user) {
        try {
          const saved = await api.updateSettings(patch);
          setSettings(saved);
        } catch (e) {
          // Keep optimistic local update even if the sync fails.
        }
      }
    },
    [settings, user]
  );

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  return (
    <SettingsContext.Provider value={{ settings, loaded, updateSettings, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
