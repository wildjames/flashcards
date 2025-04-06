import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { attemptTokenRefresh } from "../helpers/axiosInstance";

interface AuthContextType {
    loading: boolean;
    isAuthenticated: boolean;
    login: (tokens: { access_token: string; refresh_token: string }) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const nav = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

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
            // Check if access token is expired
            const accessTokenExpiration = JSON.parse(
                atob(accessToken!.split(".")[1])
            ).exp;
            if (accessTokenExpiration * 1000 < Date.now()) {
                console.log("Access token is expired. Refreshing...");
                attemptTokenRefresh();
            }
            // If we're still in date (or successfully refreshed), user is authenticated
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
        // On mount, check authentication state
        checkAuth();
    }, []);

    const login = (tokens: { access_token: string; refresh_token: string }) => {
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        setIsAuthenticated(true);
        setLoading(false);
        nav("/dashboard");
    };

    // Log the user out and clear tokens
    const logout = () => {
        console.log("Logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        setLoading(false);
        console.log("Logged out successfully. Redirecting to login page.");
        nav("/login");
    };

    return (
        <AuthContext.Provider
            value={{ loading, isAuthenticated, login, logout, checkAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
};
