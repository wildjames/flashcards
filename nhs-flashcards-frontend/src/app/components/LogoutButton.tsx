"use client";

import React, { useContext } from "react";
import Button from "@mui/material/Button";
import { AuthContext } from "@/context/AuthContext";

export default function LogoutButton() {
  const authContext = useContext(AuthContext);

  const handleLogout = () => {
    authContext?.logout();
  };

  return (
    <Button color="inherit" onClick={handleLogout}>
      Logout
    </Button>
  );
}
