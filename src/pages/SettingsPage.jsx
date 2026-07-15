import React from "react";
import { useSettings } from "../context/SettingsContext";
import { ALARM_SOUND_OPTIONS, previewSound } from "../notifications";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-16">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-ink-600 mb-2">Settings</p>
        <h1 className="font-display text-3xl text-parchment">Tune your workspace.</h1>
      </header>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <Row label="Theme" desc="Switch between dark and light interface">
          <div className="flex gap-2">
            {["dark", "light"].map((t) => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                  settings.theme === t
                    ? "bg-ember-500/10 border-ember-500/50 text-ember-400"
                    : "border-ink-700 text-ink-600 hover:text-parchment"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>
      </SectionCard>

      {/* Alarm */}
      <SectionCard title="Alarm & Notifications">
        <Row label="Alarm sound" desc="Plays when a timer session finishes">
          <div className="flex flex-wrap gap-2">
            {ALARM_SOUND_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  updateSettings({ alarmSound: opt.id });
                  previewSound(opt.id, settings.alarmVolume);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  settings.alarmSound === opt.id
                    ? "bg-ember-500/10 border-ember-500/50 text-ember-400"
                    : "border-ink-700 text-ink-600 hover:text-parchment"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Volume" desc="Adjust alarm loudness">
          <div className="flex items-center gap-3 w-full max-w-xs">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.alarmVolume}
              onChange={(e) => updateSettings({ alarmVolume: Number(e.target.value) })}
              onMouseUp={() => previewSound(settings.alarmSound, settings.alarmVolume)}
              className="flex-1 accent-ember-500"
            />
            <span className="text-xs text-ink-600 font-mono w-10 text-right">
              {Math.round(settings.alarmVolume * 100)}%
            </span>
          </div>
        </Row>
      </SectionCard>

      {/* Timer behavior */}
      <SectionCard title="Timer Behavior">
        <Row label="Long break interval" desc="Take a long break after this many focus sessions">
          <input
            type="number"
            min={2}
            max={12}
            value={settings.longBreakInterval}
            onChange={(e) => updateSettings({ longBreakInterval: Number(e.target.value) || 4 })}
            className="w-24 bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 font-mono text-parchment focus:outline-none focus:border-ember-500"
          />
        </Row>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-6 mb-6">
      <h2 className="font-display text-lg text-parchment mb-5">{title}</h2>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm text-parchment">{label}</p>
        <p className="text-xs text-ink-600 mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}
