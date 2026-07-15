import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useSettings } from "../context/SettingsContext";
import { notify, playChime, requestNotificationPermission } from "../notifications";

const MODES = {
  focus: { label: "Focus", minutes: 25, color: "ember" },
  short_break: { label: "Short Break", minutes: 5, color: "sage" },
  long_break: { label: "Long Break", minutes: 15, color: "sage" },
};

const RADIUS = 120;
const CIRC = 2 * Math.PI * RADIUS;

export default function TimerPage() {
  const { tasks, activeTaskId, setActiveTaskId, logSession } = useApp();
  const { settings } = useSettings();

  const [mode, setMode] = useState("focus");
  const [customMinutes, setCustomMinutes] = useState({
    focus: 25,
    short_break: 5,
    long_break: 15,
  });
  const [secondsLeft, setSecondsLeft] = useState(customMinutes.focus * 60);
  const [running, setRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [startedAt, setStartedAt] = useState(null);

  const intervalRef = useRef(null);
  const longBreakInterval = settings.longBreakInterval || 4;

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!running) {
      setSecondsLeft(customMinutes[mode] * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, customMinutes[mode]]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleComplete = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    playChime(settings.alarmSound, settings.alarmVolume);
    notify(
      `${MODES[mode].label} session complete`,
      mode === "focus" ? "Nice work. Time for a break." : "Break's over — ready to refocus?"
    );

    const now = new Date();
    const start = startedAt || new Date(now.getTime() - customMinutes[mode] * 60000);
    logSession({
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      completed: true,
      taskId: mode === "focus" ? activeTaskId : null,
      mode,
      plannedMinutes: customMinutes[mode],
    }).catch(() => {});

    if (mode === "focus") {
      const nextCycles = cyclesCompleted + 1;
      setCyclesCompleted(nextCycles);
      setMode(nextCycles % longBreakInterval === 0 ? "long_break" : "short_break");
    } else {
      setMode("focus");
    }
    setStartedAt(null);
  };

  const handleStart = () => {
    if (!running) {
      setStartedAt(new Date(Date.now() - (customMinutes[mode] * 60 - secondsLeft) * 1000));
      setRunning(true);
    }
  };

  const handlePause = () => {
    setRunning(false);
    if (mode === "focus" && startedAt) {
      const now = new Date();
      const elapsedMinutes = (now - startedAt) / 60000;
      if (elapsedMinutes >= 1) {
        logSession({
          startTime: startedAt.toISOString(),
          endTime: now.toISOString(),
          completed: false,
          taskId: activeTaskId,
          mode,
          plannedMinutes: customMinutes[mode],
        }).catch(() => {});
      }
    }
    setStartedAt(null);
  };

  const handleReset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSecondsLeft(customMinutes[mode] * 60);
    setStartedAt(null);
  };

  const handleDurationChange = (val) => {
    const minutes = Math.min(180, Math.max(1, Number(val) || 1));
    setCustomMinutes((prev) => ({ ...prev, [mode]: minutes }));
  };

  const minutesDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secondsDisplay = String(secondsLeft % 60).padStart(2, "0");
  const totalSeconds = customMinutes[mode] * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const dashOffset = CIRC * (1 - progress);

  const accent = MODES[mode].color === "ember" ? "#F2673D" : "#8FBFA0";
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-ink-600 mb-2">Timer</p>
        <h1 className="font-display text-3xl text-parchment">Stay in the ember.</h1>
      </header>

      <div className="flex gap-2 mb-10 bg-ink-800 p-1 rounded-full w-fit">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => {
              if (!running) setMode(key);
            }}
            disabled={running}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              mode === key ? "bg-ink-700 text-parchment" : "text-ink-600 hover:text-parchment"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-12 items-center">
        <div className="relative w-[280px] h-[280px] mx-auto">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={RADIUS} fill="none" stroke="rgb(var(--ink-800))" strokeWidth="14" />
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke={accent}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 140 140)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl tabular text-parchment tracking-tight">
              {minutesDisplay}:{secondsDisplay}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-600 mt-2">
              {running ? "In progress" : "Paused"}
            </span>
          </div>
          {running && (
            <div className="absolute inset-0 rounded-full timer-pulse pointer-events-none" />
          )}
        </div>

        <div className="space-y-6">
          <div className="flex gap-3">
            {!running ? (
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-lg bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold transition-colors shadow-glow"
              >
                {secondsLeft === totalSeconds ? "Start" : "Resume"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-6 py-3 rounded-lg bg-ink-700 hover:bg-ink-600 text-parchment font-semibold transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-lg border border-ink-700 hover:border-ink-600 text-ink-600 hover:text-parchment font-medium transition-colors"
            >
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink-600 mb-2">
              Custom duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              disabled={running}
              value={customMinutes[mode]}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-32 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 font-mono text-parchment disabled:opacity-50 focus:outline-none focus:border-ember-500"
            />
          </div>

          {mode === "focus" && (
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-ink-600 mb-2">
                Working on
              </label>
              <select
                value={activeTaskId || ""}
                onChange={(e) => setActiveTaskId(e.target.value || null)}
                className="w-full max-w-xs bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-parchment focus:outline-none focus:border-ember-500"
              >
                <option value="">No task selected</option>
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
              {activeTask && (
                <p className="text-xs text-ink-600 mt-2">
                  {activeTask.completedPomodoros || 0} pomodoro
                  {activeTask.completedPomodoros === 1 ? "" : "s"} logged on this task
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-ink-600">
            <span className="w-2 h-2 rounded-full bg-ember-500" />
            {cyclesCompleted} focus session{cyclesCompleted === 1 ? "" : "s"} completed this
            visit · long break every {longBreakInterval}
          </div>
        </div>
      </div>
    </div>
  );
}
