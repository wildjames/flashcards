"use client";

import React, { useContext } from "react";
import Button from "@mui/material/Button";
import { AuthContext } from "@/context/AuthContext";

export default function LogoutButton() {
  const authContext = useContext(AuthContext);

  // Every 30 seconds, check if the user is still logged in
  setInterval(() => {
    authContext?.checkAuth();
  }, 30000);

  const handleLogout = () => {
    authContext?.logout();
  };

  return (
    <Button color="inherit" onClick={handleLogout}>
      Logout
    </Button>
  );
}
