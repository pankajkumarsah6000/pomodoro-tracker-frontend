import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", glyph: "◆" },
  { id: "timer", label: "Timer", glyph: "◷" },
  { id: "tasks", label: "Task Manager", glyph: "☰" },
  { id: "analytics", label: "Analytics", glyph: "▲" },
  { id: "settings", label: "Settings", glyph: "⚙" },
];

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const { settings, toggleTheme } = useSettings();

  return (
    <nav className="w-full md:w-60 shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-ink-700 bg-ink-900/60 backdrop-blur flex md:flex-col">
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 shadow-glow flex items-center justify-center text-ink-950 font-display font-semibold shrink-0">
          E
        </div>
        <div className="hidden sm:block">
          <p className="font-display text-lg leading-none tracking-tight text-parchment">
            Embers
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-600 mt-1">
            Focus Tracker
          </p>
        </div>
      </div>

      <div className="flex md:flex-col overflow-x-auto md:overflow-visible px-3 pb-4 md:pb-0 gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-ember-500/10 text-ember-400"
                  : "text-ink-600 hover:text-parchment hover:bg-ink-800"
              }`}
            >
              {active && (
                <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-ember-500" />
              )}
              <span className="text-base opacity-80">{item.glyph}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex flex-col gap-3 px-6 py-6 border-t border-ink-700">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between text-xs text-ink-600 hover:text-parchment transition-colors"
        >
          <span>{settings.theme === "dark" ? "Dark mode" : "Light mode"}</span>
          <span
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
              settings.theme === "dark" ? "bg-ink-700 justify-start" : "bg-ember-500 justify-end"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-parchment block" />
          </span>
        </button>

        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-parchment truncate">{user.name}</p>
              <p className="text-[10px] text-ink-600 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-[11px] uppercase tracking-wide text-ink-600 hover:text-ember-400 shrink-0"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
