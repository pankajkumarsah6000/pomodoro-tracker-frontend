import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function TaskManager() {
  const { tasks, addTask, toggleTaskStatus, deleteTask, activeTaskId, setActiveTaskId } =
    useApp();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(25);
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await addTask(title, Number(duration) || 25);
      setTitle("");
      setDuration(25);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-16">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-ink-600 mb-2">
          Task Manager
        </p>
        <h1 className="font-display text-3xl text-parchment">What deserves the next ember?</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 mb-8 bg-ink-800/60 border border-ink-700 rounded-xl p-3"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task, e.g. Draft quarterly report"
          className="flex-1 bg-transparent px-3 py-2 text-parchment placeholder:text-ink-600 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={180}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-20 bg-ink-900 border border-ink-700 rounded-lg px-2 py-2 text-sm text-parchment font-mono text-center focus:outline-none focus:border-ember-500"
          />
          <span className="text-xs text-ink-600">min</span>
        </div>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="px-5 py-2 rounded-lg bg-ember-500 hover:bg-ember-600 disabled:opacity-40 disabled:cursor-not-allowed text-ink-950 font-semibold transition-colors"
        >
          Add Task
        </button>
      </form>

      <div className="flex gap-2 mb-6">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-ember-500/10 text-ember-400 border border-ember-500/30"
                : "text-ink-600 border border-ink-700 hover:text-parchment"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink-700 rounded-xl">
          <p className="text-ink-600">
            {tasks.length === 0
              ? "No tasks yet. Add one above to get started."
              : "Nothing here for this filter."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((task) => (
            <li
              key={task.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                activeTaskId === task.id
                  ? "border-ember-500/50 bg-ember-500/5"
                  : "border-ink-700 bg-ink-800/40"
              }`}
            >
              <button
                onClick={() => toggleTaskStatus(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.status === "completed"
                    ? "bg-sage-500 border-sage-500"
                    : "border-ink-600 hover:border-ember-500"
                }`}
                aria-label="Toggle complete"
              >
                {task.status === "completed" && (
                  <span className="text-ink-950 text-[10px] font-bold">✓</span>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm truncate ${
                    task.status === "completed" ? "text-ink-600 line-through" : "text-parchment"
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-[11px] text-ink-600 mt-0.5">
                  {task.duration} min target · {task.completedPomodoros || 0} pomodoro
                  {task.completedPomodoros === 1 ? "" : "s"} logged
                </p>
              </div>

              {task.status !== "completed" && (
                <button
                  onClick={() => setActiveTaskId(task.id)}
                  className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-md border border-ink-700 text-ink-600 hover:text-ember-400 hover:border-ember-500/50 transition-colors whitespace-nowrap"
                >
                  {activeTaskId === task.id ? "Active" : "Focus"}
                </button>
              )}

              <button
                onClick={() => deleteTask(task.id)}
                className="text-ink-600 hover:text-red-400 transition-colors px-1"
                aria-label="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
