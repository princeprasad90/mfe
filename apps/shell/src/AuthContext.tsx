import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { User, AuthState } from "./types";
import { authApi } from "./api";

type AuthContextType = AuthState & {
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const checkAuth = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const user = await authApi.me();
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
      });
    } catch {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  const login = useCallback(() => {
    window.location.href = authApi.loginUrl();
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    login();
  }, [login]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
