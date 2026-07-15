import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AppProvider, useApp } from "./context/AppContext";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import TimerPage from "./components/TimerPage";
import TaskManager from "./components/TaskManager";
import Analytics from "./components/Analytics";

function Shell() {
  const [page, setPage] = useState("dashboard");
  const { loading, apiError } = useApp();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ink-950">
      <Navbar page={page} setPage={setPage} />
      <main className="flex-1 min-w-0">
        {apiError && (
          <div className="bg-red-500/10 border-b border-red-500/30 text-red-300 text-sm px-6 py-3">
            Couldn't reach the backend API ({apiError}). Make sure the backend server is
            running on port 5000.
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-screen text-ink-600">
            Loading your workspace…
          </div>
        ) : (
          <>
            {page === "dashboard" && <Dashboard setPage={setPage} />}
            {page === "timer" && <TimerPage />}
            {page === "tasks" && <TaskManager />}
            {page === "analytics" && <Analytics />}
            {page === "settings" && <SettingsPage />}
          </>
        )}
      </main>
    </div>
  );
}

function Gate() {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950 text-ink-600">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Gate />
      </SettingsProvider>
    </AuthProvider>
  );
}
