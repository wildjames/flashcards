import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    TextField,
    Button,
} from "@mui/material";
import axiosInstance from "../helpers/axiosInstance";
import { CardData } from "../helpers/types";
import CardEditDialog, { CardEditDialogProps } from "../components/CardEditDialog";

interface GroupCardsTableProps {
    groupId: string;
}

export default function GroupCardsTable({ groupId }: GroupCardsTableProps) {
    const [cards, setCards] = useState<CardData[]>([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);
    const [loadingCards, setLoadingCards] = useState(true);
    const [displayLoadingCards, setDisplayLoadingCards] = useState(true);
    const [cardsError, setCardsError] = useState("");

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editCard, setEditCard] = useState<CardData | null>(null);

    // Fetch cards for the group
    const fetchCards = useCallback(() => {
        setLoadingCards(true);
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            setCardsError("Authentication Error");
            setLoadingCards(false);
            return;
        }

        axiosInstance
            .get(`/groups/${groupId}/cards`)
            .then((response) => {
                if (response.status === 200) return response.data;
                else throw new Error("Failed to fetch cards");
            })
            .then((data) => {
                setCards(data);
                setLoadingCards(false);
            })
            .catch((err) => {
                console.error(err);
                setCardsError(err.message);
                setLoadingCards(false);
            });
    }, [groupId]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    // Delay loading spinner display to avoid flickers
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayLoadingCards(loadingCards);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [loadingCards]);

    // Handle creating a new card
    const handleCreateCard = () => {
        setCreatingCard(true);

        if (!newQuestion.trim() || !newCorrectAnswer.trim()) {
            if (!newQuestion.trim()) {
                document.getElementById("table-question")?.focus();
            } else if (!newCorrectAnswer.trim()) {
                document.getElementById("table-correct_answer")?.focus();
            }
            setCreatingCard(false);
            return;
        }

        axiosInstance
            .post("/cards", {
                question: newQuestion,
                correct_answer: newCorrectAnswer,
                group_id: groupId,
            })
            .then((response) => {
                if (response.status === 201) return response.data;
                else throw new Error("Failed to create card");
            })
            .then(() => {
                fetchCards();
                setNewQuestion("");
                setNewCorrectAnswer("");
                setCreatingCard(false);
                document.getElementById("table-question")?.focus();
            })
            .catch((err) => {
                console.error(err);
                setCreatingCard(false);
            });
    };

    // Open the card edit dialog
    const handleCardClick = (card: CardData) => {
        setEditCard(card);
        setOpenEditDialog(true);
    };

    // Allow Enter key to create a card
    const handleCreateEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreateCard();
        }
    };

    const cardEditProps: CardEditDialogProps = {
        openEditDialog,
        setOpenEditDialog,
        editCard,
        fetchCards,
    };

    return (
        <Box sx={{ mt: 4, maxHeight: "calc(100vh - 300px)", overflow: "auto" }}>
            {displayLoadingCards ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : cardsError ? (
                <Typography color="error" variant="body1">
                    {cardsError}
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="group cards table">
                        <TableHead>
                            <TableRow
                                key="new-card"
                                hover
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell>
                                    <TextField
                                        margin="dense"
                                        id="table-question"
                                        label="Question"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        onKeyDown={handleCreateEnter}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        margin="dense"
                                        id="table-correct_answer"
                                        label="Correct Answer"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        value={newCorrectAnswer}
                                        onChange={(e) => setNewCorrectAnswer(e.target.value)}
                                        onKeyDown={handleCreateEnter}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button onClick={handleCreateCard} disabled={creatingCard}>
                                        {creatingCard ? "Creating..." : "Create"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cards.map((card) => (
                                <TableRow
                                    key={card.card_id}
                                    hover
                                    sx={{
                                        "&:last-child td, &:last-child th": { border: 0 },
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleCardClick(card)}
                                >
                                    <TableCell>{card.question}</TableCell>
                                    <TableCell>{card.correct_answer}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleCardClick(card)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <CardEditDialog {...cardEditProps} />
        </Box>
    );
}
