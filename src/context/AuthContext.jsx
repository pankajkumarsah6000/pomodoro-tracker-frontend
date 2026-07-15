import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setChecking(false);
      return;
    }
    try {
      const { user } = await api.me();
      setUser(user);
    } catch (e) {
      setToken(null);
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
    const handler = () => {
      setUser(null);
    };
    window.addEventListener("embers:unauthorized", handler);
    return () => window.removeEventListener("embers:unauthorized", handler);
  }, [loadMe]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { token, user } = await api.login({ email, password });
      setToken(token);
      setUser(user);
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const { token, user } = await api.register({ name, email, password });
      setToken(token);
      setUser(user);
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, checking, authError, setAuthError, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
