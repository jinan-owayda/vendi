import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getSession,
  isAllowedRole,
  loginRequest,
  saveSession,
} from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (session && session.user && session.token && isAllowedRole(session.user.role)) {
      setUser(session.user);
      setToken(session.token);
    } else {
      clearSession();
    }

    setLoading(false);
  }, []);

  async function login(email, password) {
  const data = await loginRequest(email, password);
  const payload = data?.payload;

  if (!payload) {
    throw new Error("Invalid login response.");
  }

  if (!payload.token) {
    throw new Error("Token not found in response.");
  }

  if (!isAllowedRole(payload.role)) {
    throw new Error("You are not allowed to access this dashboard.");
  }

  const userData = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    status: payload.status,
    created_at: payload.created_at,
    updated_at: payload.updated_at,
  };

  saveSession(payload.token, userData);
  setToken(payload.token);
  setUser(userData);

  return userData;
}

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}