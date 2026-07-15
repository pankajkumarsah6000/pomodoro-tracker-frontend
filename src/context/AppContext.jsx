import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
      setApiError(null);
    } catch (e) {
      setApiError(e.message);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      setApiError(null);
    } catch (e) {
      setApiError(e.message);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setSessions([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      await Promise.all([refreshTasks(), refreshSessions()]);
      setLoading(false);
    })();
  }, [user, refreshTasks, refreshSessions]);

  const addTask = async (title, duration) => {
    const task = await api.createTask({ title, duration });
    setTasks((prev) => [task, ...prev]);
    return task;
  };

  const updateTask = async (id, patch) => {
    const updated = await api.updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const toggleTaskStatus = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const status = task.status === "completed" ? "pending" : "completed";
    await updateTask(id, { status });
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const logSession = async (session) => {
    const saved = await api.createSession(session);
    setSessions((prev) => [saved, ...prev]);
    if (session.completed && session.mode === "focus" && session.taskId) {
      const task = tasks.find((t) => t.id === session.taskId);
      if (task) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === session.taskId
              ? { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 }
              : t
          )
        );
      }
    }
    return saved;
  };

  const value = {
    tasks,
    sessions,
    loading,
    apiError,
    activeTaskId,
    setActiveTaskId,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    logSession,
    refreshTasks,
    refreshSessions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
