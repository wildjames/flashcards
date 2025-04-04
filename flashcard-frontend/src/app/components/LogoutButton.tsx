"use client";

import React, { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Set up the interval when the component mounts
    const interval = setInterval(async () => {
      await authContext?.checkAuth();
      if (!authContext?.isAuthenticated) {
        router.push("/login");
      }
    }, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [authContext, router]);

  const handleLogout = () => {
    authContext?.logout();
  };

  return (
    <Button color="inherit" onClick={handleLogout}>
      Logout
    </Button>
  );
}
