import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { exportSessionsCSV, exportAnalyticsPDF } from "../exportUtils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const { tasks, sessions } = useApp();
  const { user } = useAuth();
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [summary, setSummary] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    api.getDaily(7).then(setDaily).catch(() => {});
    api.getWeekly(6).then(setWeekly).catch(() => {});
    api.getSummary().then(setSummary).catch(() => {});
    api.getStreaks().then(setStreaks).catch(() => {});
  }, [tasks, sessions]);

  const completedFocusSessions = sessions.filter((s) => s.mode === "focus" && s.completed).length;
  const abortedFocusSessions = sessions.filter((s) => s.mode === "focus" && !s.completed).length;
  const completionRate =
    completedFocusSessions + abortedFocusSessions > 0
      ? Math.round(
          (completedFocusSessions / (completedFocusSessions + abortedFocusSessions)) * 100
        )
      : 0;

  const handleExportCSV = () => {
    setExporting("csv");
    try {
      exportSessionsCSV(sessions, tasks);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = () => {
    setExporting("pdf");
    try {
      exportAnalyticsPDF({ summary, daily, weekly, streaks, userName: user?.name });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink-600 mb-2">Analytics</p>
          <h1 className="font-display text-3xl text-parchment">The shape of your focus.</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || sessions.length === 0}
            className="px-4 py-2 rounded-lg border border-ink-700 text-sm text-ink-600 hover:text-parchment hover:border-ink-600 disabled:opacity-40 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || !summary}
            className="px-4 py-2 rounded-lg bg-ember-500 hover:bg-ember-600 text-ink-950 text-sm font-semibold disabled:opacity-40 transition-colors"
          >
            Export PDF Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Focus Hours (total)" value={summary ? `${summary.totalFocusHours}h` : "—"} />
        <Stat label="Sessions Completed" value={completedFocusSessions} />
        <Stat label="Completion Rate" value={`${completionRate}%`} />
        <Stat label="Today" value={summary ? `${summary.todaysFocusMinutes}m` : "—"} />
      </div>

      <Section title="Daily Sessions" subtitle="Focus sessions logged per day, last 7 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ink-800))" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="rgb(var(--ink-700))"
                tick={{ fill: "rgb(var(--ink-600))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="rgb(var(--ink-700))"
                tick={{ fill: "rgb(var(--ink-600))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--ink-800))",
                  border: "1px solid rgb(var(--ink-700))",
                  borderRadius: 8,
                  color: "rgb(var(--parchment))",
                }}
                cursor={{ fill: "rgba(242,103,61,0.06)" }}
              />
              <Bar dataKey="sessions" fill="#F2673D" radius={[6, 6, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Productivity Chart" subtitle="Focus minutes trend, last 7 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ink-800))" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="rgb(var(--ink-700))"
                tick={{ fill: "rgb(var(--ink-600))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
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
              <Line
                type="monotone"
                dataKey="focusMinutes"
                stroke="#8FBFA0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#8FBFA0" }}
                name="Focus minutes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Weekly Report" subtitle="Focus hours per week, last 6 weeks">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ink-800))" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="rgb(var(--ink-700))"
                tick={{ fill: "rgb(var(--ink-600))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
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
                cursor={{ fill: "rgba(242,103,61,0.06)" }}
              />
              <Bar dataKey="focusHours" fill="#D9502A" radius={[6, 6, 0, 0]} name="Focus hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-5">
      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-600 mb-2">{label}</p>
      <p className="font-display text-2xl text-parchment">{value}</p>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-6 mb-8">
      <div className="mb-4">
        <h2 className="font-display text-lg text-parchment">{title}</h2>
        <p className="text-xs text-ink-600 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
