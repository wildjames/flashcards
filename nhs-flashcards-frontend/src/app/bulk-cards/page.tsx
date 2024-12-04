"use-client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Fab,
} from "@mui/material";

type CardData = {
  card_id: string;
  question: string;
  correct_answer: string;
  group_id: string;
  creator_id: string;
  time_created: string;
  time_updated: string;
  updated_by_id: string;
};


export default function BulkCardsPage() {


    return (
        <div>
            <h1>Bulk Cards Page</h1>
        </div>
    );
}
