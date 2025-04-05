import React, { useEffect, useState } from "react";
import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
} from "@mui/material";

import { CardData } from "../helpers/types";

export type CardEditDialogProps = {
    openEditDialog: boolean;
    setOpenEditDialog: React.Dispatch<React.SetStateAction<boolean>>;
    editCard: CardData | null;
    fetchCards: () => void;
};

export default function CardEditDialog(props: CardEditDialogProps) {
    // For editing cards
    const [editQuestion, setEditQuestion] = useState("");
    const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
    const [updatingCard, setUpdatingCard] = useState(false);
    const [updateCardError, setUpdateCardError] = useState("");

    // For deleting cards
    const [deletingCard, setDeletingCard] = useState(false);
    const [deleteCardError, setDeleteCardError] = useState("");

    // When the component loads, set the editQuestion and editCorrectAnswer to the given card
    useEffect(() => {
        if (!props.editCard) {
            setEditQuestion("");
            setEditCorrectAnswer("");
            return;
        }

        setEditQuestion(props.editCard.question);
        setEditCorrectAnswer(props.editCard?.correct_answer);
    }, [props.editCard]);

    // Update a card. Simple dialog.
    const handleUpdateCard = () => {
        if (!props.editCard) return;
        setUpdatingCard(true);
        setUpdateCardError("");
        const accessToken = localStorage.getItem("access_token");

        if (!editQuestion.trim() || !editCorrectAnswer.trim()) {
            setUpdateCardError("All fields are required");
            setUpdatingCard(false);
            return;
        }

        if (!editQuestion.trim()) {
            document.getElementById("dialog-question")?.focus();
        } else if (!editCorrectAnswer.trim()) {
            document.getElementById("dialog-correct_answer")?.focus();
        }

        if (accessToken) {
            fetch(`/api/cards/${props.editCard.card_id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: editQuestion,
                    correct_answer: editCorrectAnswer,
                }),
            })
                .then((response) => {
                    if (response.ok) return response.json();
                    else throw new Error("Failed to update card");
                })
                .then(() => {
                    props.fetchCards();
                    setEditQuestion("");
                    setEditCorrectAnswer("");
                    setUpdatingCard(false);
                    props.setOpenEditDialog(false);
                })
                .catch((err) => {
                    console.error(err);
                    setUpdateCardError(err.message);
                    setUpdatingCard(false);
                });
        } else {
            setUpdateCardError("Authentication Error");
            setUpdatingCard(false);
        }
    };

    const handleDeleteCard = () => {
        if (!props.editCard) return;
        setDeletingCard(true);
        setDeleteCardError("");
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            fetch(`/api/cards/${props.editCard.card_id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        props.fetchCards();
                        setDeletingCard(false);
                        props.setOpenEditDialog(false);
                    } else {
                        throw new Error("Failed to delete card");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setDeleteCardError(err.message);
                    setDeletingCard(false);
                });
        } else {
            setDeleteCardError("Authentication Error");
            setDeletingCard(false);
        }
    };

    const handleEditEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleUpdateCard();
        }
    };

    return (
        <>
            {/* FIXME: This needs to be larger, and have word wrapping for cards with long fields. */}
            <Dialog
                open={props.openEditDialog}
                onClose={() => props.setOpenEditDialog(false)}
                disableRestoreFocus
            >
                <DialogTitle>Edit Card</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="dialog-edit_question"
                        label="Question"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        onKeyDown={handleEditEnter}
                    />
                    <TextField
                        margin="dense"
                        id="dialog-edit_correct_answer"
                        label="Correct Answer"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editCorrectAnswer}
                        onChange={(e) => setEditCorrectAnswer(e.target.value)}
                        onKeyDown={handleEditEnter}
                    />
                    {updateCardError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {updateCardError}
                        </Typography>
                    )}
                    {deleteCardError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {deleteCardError}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions sx={{ align: "left" }}>
                    <Button
                        onClick={handleDeleteCard}
                        disabled={deletingCard}
                        color="error"
                    >
                        {deletingCard ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
                <DialogActions>
                    <Button
                        onClick={() => props.setOpenEditDialog(false)}
                        disabled={updatingCard}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateCard} disabled={updatingCard}>
                        {updatingCard ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
