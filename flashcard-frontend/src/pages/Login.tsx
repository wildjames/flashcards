import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from '@mui/material/Grid'
import Box from "@mui/material/Box";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Typography from "@mui/material/Typography";

import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../helpers/axiosInstance";


export default function LoginPage() {
    const nav = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");

    const authContext = useContext(AuthContext);

    // Check if the user has some tokens already
    useEffect(() => {
        console.log("AuthContext: ", authContext);
        if (authContext?.isAuthenticated && !authContext?.loading) {
            console.log("User is already authenticated. Redirecting to dashboard...");
            nav("/dashboard");
        }
    }, [authContext, nav]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // Using the axiosInstance with interceptors
            const response = await axiosInstance.post("/login", formData);

            // Axios automatically parses the JSON response
            const data = response.data;

            // Login successful, update AuthContext
            authContext?.login({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            });
            setError("");

            // Redirect to a protected page or dashboard
            nav("/dashboard");
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        }
    };

    return (
        <Box
            sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOpenIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                    mt: 1, maxWidth: 500, width: "75%"
                }}
            >
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username or Email"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={formData.username}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                />
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </Button>
                <Grid container>
                    {/* TODO: Implement account recovery */}
                    {/* <Grid size="grow">
                                <Link href="/forgot-password" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid> */}
                    <Grid>
                        <Link href="/register" variant="body2">
                            Don't have an account? Sign Up
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
