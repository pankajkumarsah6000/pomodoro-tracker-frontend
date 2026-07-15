import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

export default function Dashboard({ setPage }) {
  const { tasks, sessions } = useApp();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [streaks, setStreaks] = useState(null);

  useEffect(() => {
    api.getSummary().then(setSummary).catch(() => {});
    api.getDaily(7).then(setDaily).catch(() => {});
    api.getStreaks().then(setStreaks).catch(() => {});
  }, [tasks, sessions]);

  const pendingTasks = tasks.filter((t) => t.status !== "completed").slice(0, 5);
  const earnedBadges = streaks?.badges?.filter((b) => b.earned) || [];
  const nextBadge = streaks?.badges?.find((b) => !b.earned);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink-600 mb-2">Dashboard</p>
          <h1 className="font-display text-3xl text-parchment">
            {user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Good to see you back."}
          </h1>
        </div>
        <button
          onClick={() => setPage("timer")}
          className="px-5 py-2.5 rounded-lg bg-ember-500 hover:bg-ember-600 text-ink-950 font-semibold transition-colors shadow-glow"
        >
          Start a session →
        </button>
      </header>

      {/* Streak banner */}
      {streaks && (
        <div className="flex flex-wrap items-center gap-6 bg-gradient-to-r from-ember-500/10 to-transparent border border-ember-500/20 rounded-xl px-6 py-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-ink-600 mb-1">
              Current Streak
            </p>
            <p className="font-display text-3xl text-ember-400">
              {streaks.currentStreak} <span className="text-base text-ink-600">day{streaks.currentStreak === 1 ? "" : "s"}</span>
            </p>
          </div>
          <div className="w-px h-10 bg-ink-700 hidden sm:block" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-ink-600 mb-1">
              Longest Streak
            </p>
            <p className="font-display text-3xl text-parchment">
              {streaks.longestStreak} <span className="text-base text-ink-600">days</span>
            </p>
          </div>
          <div className="w-px h-10 bg-ink-700 hidden sm:block" />
          <div className="flex-1 min-w-[180px]">
            <p className="text-[11px] uppercase tracking-[0.15em] text-ink-600 mb-1">
              Badges Earned
            </p>
            <p className="font-display text-3xl text-parchment">
              {earnedBadges.length}
              <span className="text-base text-ink-600"> / {streaks.badges.length}</span>
            </p>
          </div>
          {nextBadge && (
            <div className="text-xs text-ink-600 max-w-[220px]">
              Next up: <span className="text-parchment">{nextBadge.label}</span> — {nextBadge.desc}
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Today's Focus"
          value={summary ? `${summary.todaysFocusMinutes}m` : "—"}
          sub={summary ? `${summary.todaysSessions} sessions` : ""}
        />
        <StatCard
          label="Total Focus"
          value={summary ? `${summary.totalFocusHours}h` : "—"}
          sub={summary ? `${summary.totalSessions} sessions` : ""}
        />
        <StatCard
          label="Tasks Pending"
          value={summary ? summary.pendingTasks : "—"}
          sub={summary ? `${summary.completedTasks} completed` : ""}
        />
        <StatCard label="Total Tasks" value={summary ? summary.totalTasks : "—"} sub="all time" />
      </div>

      {/* Mini weekly trend */}
      <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-parchment">This week's rhythm</h2>
          <button
            onClick={() => setPage("analytics")}
            className="text-xs text-ember-400 hover:text-ember-500 uppercase tracking-wide"
          >
            Full analytics →
          </button>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2673D" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#F2673D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="rgb(var(--ink-700))"
                tick={{ fill: "rgb(var(--ink-600))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--ink-800))",
                  border: "1px solid rgb(var(--ink-700))",
                  borderRadius: 8,
                  color: "rgb(var(--parchment))",
                }}
              />
              <Area
                type="monotone"
                dataKey="focusMinutes"
                stroke="#F2673D"
                strokeWidth={2}
                fill="url(#focusGradient)"
                name="Focus minutes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges grid */}
      {streaks && (
        <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-6 mb-8">
          <h2 className="font-display text-lg text-parchment mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {streaks.badges.map((b) => (
              <div
                key={b.id}
                className={`rounded-lg border p-3 text-center ${
                  b.earned
                    ? "border-gold-500/40 bg-gold-500/10 badge-earned"
                    : "border-ink-700 bg-ink-900/40 opacity-40"
                }`}
                title={b.desc}
              >
                <div
                  className={`w-9 h-9 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-display ${
                    b.earned ? "bg-gold-500 text-ink-950" : "bg-ink-700 text-ink-600"
                  }`}
                >
                  ★
                </div>
                <p className="text-[11px] text-parchment leading-tight">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending tasks preview */}
      <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-parchment">Up next</h2>
          <button
            onClick={() => setPage("tasks")}
            className="text-xs text-ember-400 hover:text-ember-500 uppercase tracking-wide"
          >
            All tasks →
          </button>
        </div>
        {pendingTasks.length === 0 ? (
          <p className="text-ink-600 text-sm py-4">
            No pending tasks. Add one from the Task Manager.
          </p>
        ) : (
          <ul className="divide-y divide-ink-700">
            {pendingTasks.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <span className="text-sm text-parchment">{t.title}</span>
                <span className="text-xs text-ink-600 font-mono">{t.duration}m</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-5">
      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-600 mb-2">{label}</p>
      <p className="font-display text-2xl text-parchment">{value}</p>
      {sub && <p className="text-[11px] text-ink-600 mt-1">{sub}</p>}
    </div>
  );
}
