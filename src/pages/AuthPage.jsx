import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 shadow-glow flex items-center justify-center text-ink-950 font-display font-semibold">
            E
          </div>
          <div>
            <p className="font-display text-xl leading-none tracking-tight text-parchment">
              Embers
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-600 mt-1">
              Focus Tracker
            </p>
          </div>
        </div>

        <div className="bg-ink-800/60 border border-ink-700 rounded-2xl p-7">
          <h1 className="font-display text-2xl text-parchment mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-ink-600 mb-6">
            {mode === "login"
              ? "Sign in to keep your focus streak alive."
              : "Start tracking your focus sessions today."}
          </p>

          {authError && (
            <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-ink-600 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 text-parchment focus:outline-none focus:border-ember-500"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 text-parchment focus:outline-none focus:border-ember-500"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 text-parchment focus:outline-none focus:border-ember-500"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-ember-500 hover:bg-ember-600 disabled:opacity-50 text-ink-950 font-semibold transition-colors shadow-glow"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-ink-600 text-center mt-5">
            {mode === "login" ? "New to Embers?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setAuthError(null);
              }}
              className="text-ember-400 hover:text-ember-500 font-medium"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
