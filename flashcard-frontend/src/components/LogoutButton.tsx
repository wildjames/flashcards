import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";

import { AuthContext } from "@contexts/AuthContext";

export default function LogoutButton() {
    const authContext = useContext(AuthContext);
    const nav = useNavigate();

    useEffect(() => {
        // Set up the interval when the component mounts
        const interval = setInterval(async () => {
            await authContext?.checkAuth();
            if (!authContext?.isAuthenticated) {
                nav("/login");
            }
        }, 30000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, [authContext, nav]);

    const handleLogout = () => {
        authContext?.logout();
    };

    return (
        <Button color="inherit" onClick={handleLogout}>
            Logout
        </Button>
    );
}
