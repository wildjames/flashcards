"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { AuthContext } from "@/context/AuthContext";
import LogoutButton from "@/app/components/LogoutButton";
import DashboardButton from "@/app/components/DashboardButton";

interface FlipCardProps {
  isflipped: string;
  correct: string;
}

const FlipCard = styled(Box)<FlipCardProps>(
  ({ theme, isflipped, correct }) => ({
    // perspective: "1000px", // Doesn't really have much effect
    position: "relative",
    width: "100%",
    minWidth: "20em",
    minHeight: "10em",
    margin: theme.spacing(5),
    cursor: "pointer",
    transformStyle: "preserve-3d",
    transform: isflipped === "true" ? "rotateY(180deg)" : "none",
    transition: "transform 0.6s",

    "& .front, & .back": {
      position: "absolute",
      backfaceVisibility: "hidden",
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "4px",
      boxShadow: theme.shadows[3],
    },

    "& .front": {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },

    "& .back": {
      transform: "rotateY(180deg)",
      background:
        correct === "true"
          ? theme.palette.success.main
          : theme.palette.error.main,
      color: theme.palette.common.white,
    },
  })
);

type CardData = {
  card_id: string;
  question: string;
  correct_answer: string;
  incorrect_answer: string;
  group_id: string;
  creator_id: string;
  time_created: string;
  time_updated: string;
  updated_by_id: string;
};

export default function FlashcardPage() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardData | null>(null);
  const [error, setError] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!authContext?.isAuthenticated && !authContext?.loading) {
      router.push("/login");
    }
  }, [authContext, router]);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch("/api/cards/flashcard", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to fetch flashcard");
        })
        .then((data: CardData) => {
          setCard(data);
          const answers = [data.correct_answer, data.incorrect_answer];
          const correctIndex = Math.floor(Math.random() * 2);
          [answers[0], answers[correctIndex]] = [
            answers[correctIndex],
            answers[0],
          ];
          setOptions(answers);
          setCorrectAnswerIndex(correctIndex);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      console.error("Access token not found");
    }
  }, [router]);

  const handleAnswerClick = (index: number) => {
    setFlippedCard(index);
  };

  const handleNext = () => {
    setLoading(true);
    setCard(null);
    setError("");
    setOptions([]);
    setFlippedCard(null);
    setCorrectAnswerIndex(null);

    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch("/api/cards/flashcard", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to fetch flashcard");
        })
        .then((data: CardData) => {
          setCard(data);
          const answers = [data.correct_answer, data.incorrect_answer];
          const correctIndex = Math.floor(Math.random() * 2);
          [answers[0], answers[correctIndex]] = [
            answers[correctIndex],
            answers[0],
          ];
          setOptions(answers);
          setCorrectAnswerIndex(correctIndex);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      console.error("Access token not found");
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcard Quiz
          </Typography>
          <DashboardButton />
          <LogoutButton />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1" sx={{ mt: 4 }}>
            {error}
          </Typography>
        ) : card ? (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Card sx={{ mb: 4, padding: 2 }}>
              <CardContent>
                <Typography variant="h5">{card.question}</Typography>
              </CardContent>
            </Card>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {options.map((option, index) => (
                <FlipCard
                  key={index}
                  isflipped={(flippedCard === index).toString()}
                  correct={(index === correctAnswerIndex).toString()}
                  onClick={() => handleAnswerClick(index)}
                >
                  <Box className="front">
                    <Typography>{option}</Typography>
                  </Box>
                  <Box className="back">
                    <Typography>
                      {index === correctAnswerIndex ? "Correct!" : "Incorrect"}
                    </Typography>
                  </Box>
                </FlipCard>
              ))}
            </Box>
            {flippedCard !== null && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ mt: 4 }}
              >
                Next Question
              </Button>
            )}
          </Box>
        ) : null}
      </Container>
    </>
  );
}
