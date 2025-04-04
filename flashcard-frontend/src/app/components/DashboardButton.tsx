"use client";

import React from "react";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <Button color="inherit" onClick={() => router.push("/dashboard")}>
      Dashboard
    </Button>
  );
}
