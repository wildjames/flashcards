import React from "react";
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

import { CardData } from "../helpers/types";

interface GroupCardsTableProps {
    cards: CardData[];
    newQuestion: string;
    setNewQuestion: (val: string) => void;
    newCorrectAnswer: string;
    setNewCorrectAnswer: (val: string) => void;
    creatingCard: boolean;
    handleCreateCard: () => void;
    handleCardClick: (card: CardData) => void;
    displayLoadingCards: boolean;
    cardsError: string;
    handleCreateEnter: (e: React.KeyboardEvent) => void;
}

export default function GroupCardsTable({
    cards,
    newQuestion,
    setNewQuestion,
    newCorrectAnswer,
    setNewCorrectAnswer,
    creatingCard,
    handleCreateCard,
    handleCardClick,
    displayLoadingCards,
    cardsError,
    handleCreateEnter,
}: GroupCardsTableProps) {
    return (
        <Box
            sx={{
                mt: 4,
                maxHeight: "calc(100vh - 300px)",
                overflow: "auto",
            }}
        >
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
        </Box>
    );
}
