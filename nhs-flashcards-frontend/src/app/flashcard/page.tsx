"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import LogoutButton from "@/app/components/LogoutButton";

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
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authContext?.isAuthenticated && !authContext?.loading) {
      router.push("/login");
    }
  }, [authContext, router]);

  // Fetch a random flashcard
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
          // Prepare and shuffle options
          const answers = [data.correct_answer, data.incorrect_answer];
          for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
          }
          setOptions(answers);
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

  const handleSubmit = () => {
    setSubmitted(true);
    if (selectedAnswer === card?.correct_answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    // Reset state and fetch a new card
    setLoading(true);
    setCard(null);
    setError("");
    setOptions([]);
    setSelectedAnswer("");
    setSubmitted(false);
    setIsCorrect(null);

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
          // Prepare and shuffle options
          const answers = [data.correct_answer, data.incorrect_answer];
          for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
          }
          setOptions(answers);
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
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5">{card.question}</Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                name="answers"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              >
                {options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio disabled={submitted} />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {!submitted ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                sx={{ mt: 2 }}
              >
                Submit
              </Button>
            ) : (
              <>
                {isCorrect ? (
                  <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                    Correct!
                  </Typography>
                ) : (
                  <Typography variant="h6" color="error.main" sx={{ mt: 2 }}>
                    Incorrect. The correct answer was: {card.correct_answer}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ mt: 2 }}
                >
                  Next Question
                </Button>
              </>
            )}
          </Box>
        ) : null}
      </Container>
    </>
  );
}
