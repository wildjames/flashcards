"use client";

import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/axios/axiosInstance";

interface AuthContextType {
  loading: boolean;
  isAuthenticated: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Log the user out and clear tokens
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setLoading(false);
    console.log("Logged out successfully. Redirecting to login page.");
    router.push("/login");
  };

  // Check whether the user is authenticated by making a protected request
  const checkAuth = async () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    // If no tokens at all, user is not authenticated
    if (!accessToken && !refreshToken) {
      console.log("No tokens found, user is not authenticated.");
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      // Attempt a protected request. If the token is expired,
      // the interceptor will try up to 5 times to refresh it.
      await axiosInstance.get("/protected");
      // If successful (or successfully refreshed), user is authenticated
      console.log("User is authenticated");
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      // If after refresh attempts we still fail, tokens are cleared by the interceptor
      console.log("User is not authenticated", error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // On mount, just check authentication state by hitting a protected endpoint
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    setIsAuthenticated(true);
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider
      value={{ loading, isAuthenticated, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
