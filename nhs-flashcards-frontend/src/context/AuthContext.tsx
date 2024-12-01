"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

  const tokenRefresh = useCallback(async () => {
    console.log("Refreshing token...");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      console.log("User does not have a refresh token. Not authenticated.");
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      const data = await response.json();

      if (data.access_token) {
        console.log("Token refreshed successfully");
        localStorage.setItem("access_token", data.access_token);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        console.log("Token refresh failed. User is not authenticated.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.log("User does not have an access token");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        console.log("User access token is expired. Refreshing token...");
        const success = await tokenRefresh();
        if (!success) {
          return;
        }
      } else {
        console.log("User has a non-expired access token");
        setIsAuthenticated(true);
        setLoading(false);
      }
    };

    checkToken();
  }, [router, tokenRefresh]);

  const login = (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    setIsAuthenticated(true);
    setLoading(false);
    router.push("/dashboard");
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setLoading(false);
    console.log("Logged out successfully. Redirecting to login page.");
    router.push("/login");
  };

  const checkAuth = async () => {
    if (
      !localStorage.getItem("access_token") &&
      !localStorage.getItem("refresh_token")
    ) {
      console.log(
        "User does not have an access token or a refresh token. Not authenticated."
      );
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    const decodedToken = JSON.parse(atob(token!.split(".")[1]));
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      console.log("User access token is expired. Refreshing token...");
      const success = await tokenRefresh();
      if (!success) {
        console.log("Token refresh failed. User is not authenticated.");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      } else {
        console.log("Token refreshed successfully. User is authenticated.");
        setIsAuthenticated(true);
        setLoading(false);
      }
    }

    try {
      const response = await fetch("/api/protected", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        console.log("User is authenticated");
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ loading, isAuthenticated, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
