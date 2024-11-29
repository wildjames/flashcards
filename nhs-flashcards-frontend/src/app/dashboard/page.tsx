"use client";

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function DashboardPage() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authContext?.isAuthenticated) {
      router.push("/login");
    }
  }, [authContext?.isAuthenticated, router]);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      // If no token, redirect to login
      router.push("/login");
    } else {
      // Fetch protected data
      fetch("/api/protected", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Unauthorized");
        })
        .then((data) => {
          setMessage(data.message);
        })
        .catch((err) => {
          console.error(err);
          // Token might be invalid or expired, redirect to login
          router.push("/login");
        });
    }
  }, [router]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{message || "Loading..."}</p>
    </div>
  );
}
