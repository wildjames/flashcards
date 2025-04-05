import { useEffect, useState } from "react";
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

import { CardData } from "../helpers/types";
import LogoutButton from "../components/LogoutButton";
import DashboardButton from "../components/DashboardButton";

import "../assets/flashcard.css";

export default function Flashcard() {
    const [loading, setLoading] = useState(true);
    const [card, setCard] = useState<CardData | null>(null);
    const [error, setError] = useState("");
    const [options, setOptions] = useState<string[]>([]);
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);

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
                    const answers = [
                        data.correct_answer || "ERROR: NO DATA",
                        data.incorrect_answer || "ERROR: NO DATA",
                    ];
                    const correctIndex = Math.floor(Math.random() * 2);
                    [answers[0], answers[correctIndex]] = [answers[correctIndex], answers[0]];
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
    }, []);

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
                    const answers = [
                        data.correct_answer || "ERROR: NO DATA",
                        data.incorrect_answer || "ERROR: NO DATA",
                    ];
                    const correctIndex = Math.floor(Math.random() * 2);
                    [answers[0], answers[correctIndex]] = [answers[correctIndex], answers[0]];
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
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
                    >
                        Flashcard Quiz
                    </Typography>
                    <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                        <DashboardButton />
                        <LogoutButton />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth={false}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <CircularProgress />
                    </Box >
                ) : error ? (
                    <Typography color="error" variant="body1" sx={{ mt: 4 }}>
                        {error}
                    </Typography>
                ) : card ? (
                    <Box sx={{
                        mt: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <Card sx={{ mb: 4, padding: 2, minWidth: "40%", maxWidth: "75%" }}>
                            <CardContent>
                                <Typography variant="h5">{card.question}</Typography>
                            </CardContent>
                        </Card>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "stretch",
                                gap: 2,
                            }}
                        >
                            {options.map((option, index) => {
                                // Determine classes based on flipped state and correctness
                                const flipCardClasses = [
                                    "flip-card",
                                    flippedCard === index ? "flipped" : "",
                                    index === correctAnswerIndex ? "correct" : "incorrect",
                                ].join(" ");

                                return (
                                    <Box
                                        key={index}
                                        className={flipCardClasses}
                                        onClick={() => handleAnswerClick(index)}
                                        style={{ flex: 1 }}
                                    >
                                        <Box className="front">
                                            <Typography sx={{ textAlign: "center" }}>
                                                {option}
                                            </Typography>
                                        </Box>
                                        <Box className="back">
                                            <Typography sx={{ textAlign: "center" }}>
                                                {index === correctAnswerIndex ? "Correct!" : "Incorrect"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
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
                ) : null
                }
            </Container >
        </>
    );
}
