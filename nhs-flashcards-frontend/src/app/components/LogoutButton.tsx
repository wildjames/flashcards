"use client";

import React, { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { AuthContext } from "@/context/AuthContext";

export default function LogoutButton() {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    // Set up the interval when the component mounts
    const interval = setInterval(() => {
      authContext?.checkAuth();
    }, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [authContext]);

  const handleLogout = () => {
    authContext?.logout();
  };

  return (
    <Button color="inherit" onClick={handleLogout}>
      Logout
    </Button>
  );
}
