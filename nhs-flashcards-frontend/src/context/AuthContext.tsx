"use client";

import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // If there's no token, then we aren't authenticated
    if (!token) {
      console.log("User does not have an access token");
      setIsAuthenticated(false);
      return;
    }

    // If there is a token, check if it's expired
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // If the token is expired, use the refresh token to get a new access token
    if (decodedToken.exp < currentTime) {
      console.log("User access token is expired. Refreshing token...");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.log("User does not have a refresh token. Not authenticated.");
        setIsAuthenticated(false);
        // Clear the access token from local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return;
      }

      fetch("/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token && data.refresh_token) {
            console.log("Token refreshed successfully");
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            setIsAuthenticated(true);
          } else {
            // Refreshing failed, so clear the tokens and set the user as not authenticated
            console.log("Token refresh failed. User is not authenticated.");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setIsAuthenticated(false);
          }
        });
    }

    // If the token is not expired, we are authenticated
    console.log("User has a non-expired access token");
    setIsAuthenticated(true);
  }, []);

  const login = (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
