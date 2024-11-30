"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LogoutButton from "@/app/components/LogoutButton";

type GroupData = {
  group_id: string;
  group_name: string;
  creator_id: string;
  time_created: string;
  time_updated: string;
};

type UserData = {
  user_id: string;
  username: string;
  email: string;
};

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

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();

  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [groupError, setGroupError] = useState("");
  const [group, setGroup] = useState<GroupData | null>(null);
  const [creator, setCreator] = useState<UserData | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  // For creating new cards
  const [newQuestion, setNewQuestion] = useState("");
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [newIncorrectAnswer, setNewIncorrectAnswer] = useState("");
  const [creatingCard, setCreatingCard] = useState(false);
  const [createCardError, setCreateCardError] = useState("");

  // For editing cards
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editCard, setEditCard] = useState<CardData | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editIncorrectAnswer, setEditIncorrectAnswer] = useState("");
  const [updatingCard, setUpdatingCard] = useState(false);
  const [updateCardError, setUpdateCardError] = useState("");

  // For deleting cards
  const [deletingCard, setDeletingCard] = useState(false);
  const [deleteCardError, setDeleteCardError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authContext?.isAuthenticated && !authContext?.loading) {
      console.error("Not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [authContext, router]);

  // Fetch group data
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch(`/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to fetch group");
        })
        .then((data) => {
          setGroup(data);
          setLoadingGroup(false);
          // Fetch creator details
          return fetch("/api/user-details", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ user_ids: [data.creator_id] }),
          });
        })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to fetch user details");
        })
        .then((data) => {
          setCreator(data[0]); // Assuming data is an array
        })
        .catch((err) => {
          console.error(err);
          setGroupError(err.message);
          setLoadingGroup(false);
        });
    } else {
      setGroupError("Authentication Error");
      setLoadingGroup(false);
    }
  }, [groupId]);

  // Fetch cards for the group
  const fetchCards = useCallback(() => {
    setLoadingCards(true);
    console.log("Fetching cards for group", groupId);
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch(`/api/groups/${groupId}/cards`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) return response.json();
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
    } else {
      setCardsError("Authentication Error");
      setLoadingCards(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards, groupId]);

  const handleCreateCard = () => {
    setCreatingCard(true);
    setCreateCardError("");
    const accessToken = localStorage.getItem("access_token");
    if (
      !newQuestion.trim() ||
      !newCorrectAnswer.trim() ||
      !newIncorrectAnswer.trim()
    ) {
      setCreateCardError("All fields are required");
      setCreatingCard(false);
      return;
    }
    if (accessToken) {
      fetch("/api/cards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: newQuestion,
          correct_answer: newCorrectAnswer,
          incorrect_answer: newIncorrectAnswer,
          group_id: groupId,
        }),
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to create card");
        })
        .then(() => {
          fetchCards();
          setNewQuestion("");
          setNewCorrectAnswer("");
          setNewIncorrectAnswer("");
        })
        .catch((err) => {
          console.error(err);
          setCreateCardError(err.message);
          setCreatingCard(false);
        });
    } else {
      console.error("Authentication Error");
    }
    console.log("Card created");
    setCreatingCard(false);
    setOpenDialog(false);
  };

  const handleCardClick = (card: CardData) => {
    setEditCard(card);
    setEditQuestion(card.question);
    setEditCorrectAnswer(card.correct_answer);
    setEditIncorrectAnswer(card.incorrect_answer);
    setOpenEditDialog(true);
  };

  const handleUpdateCard = () => {
    if (!editCard) return;
    setUpdatingCard(true);
    setUpdateCardError("");
    const accessToken = localStorage.getItem("access_token");
    if (
      !editQuestion.trim() ||
      !editCorrectAnswer.trim() ||
      !editIncorrectAnswer.trim()
    ) {
      setUpdateCardError("All fields are required");
      setUpdatingCard(false);
      return;
    }
    if (accessToken) {
      fetch(`/api/cards/${editCard.card_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: editQuestion,
          correct_answer: editCorrectAnswer,
          incorrect_answer: editIncorrectAnswer,
        }),
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error("Failed to update card");
        })
        .then(() => {
          fetchCards();
          setEditQuestion("");
          setEditCorrectAnswer("");
          setEditIncorrectAnswer("");
          setUpdatingCard(false);
          setOpenEditDialog(false);
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
    if (!editCard) return;
    setDeletingCard(true);
    setDeleteCardError("");
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch(`/api/cards/${editCard.card_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            fetchCards();
            setDeletingCard(false);
            setOpenEditDialog(false);
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Group Management
          </Typography>
          <Button color="inherit" onClick={() => setOpenDialog(true)}>
            Create Card
          </Button>
          <LogoutButton />
        </Toolbar>
      </AppBar>

      {/* Group Details */}
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {loadingGroup ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : groupError ? (
            <Typography color="error" variant="body1">
              {groupError}
            </Typography>
          ) : group ? (
            <>
              <Typography variant="h4" component="div">
                {group.group_name}
              </Typography>
              <Typography variant="body1">
                Created by {creator ? creator.username : "Loading..."} on{" "}
                {new Date(group.time_created).toLocaleString()}
              </Typography>
            </>
          ) : null}
        </Box>

        {/* Cards */}
        <Box sx={{ mt: 4 }}>
          {loadingCards ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : cardsError ? (
            <Typography color="error" variant="body1">
              {cardsError}
            </Typography>
          ) : cards.length > 0 ? (
            <Grid container spacing={3}>
              {cards.map((card: CardData) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.card_id}>
                  <Card>
                    <CardActionArea onClick={() => handleCardClick(card)}>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {card.question}
                        </Typography>
                        {/* Additional card details can be added here */}
                        {/* FIXME: The clickable area doesn't grow with the card */}
                        {/* Could have the answer, but that's spoilers I guess */}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">No cards in this group.</Typography>
          )}
        </Box>

        {/* Card Creation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="question"
              label="Question"
              type="text"
              fullWidth
              variant="standard"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <TextField
              margin="dense"
              id="correct_answer"
              label="Correct Answer"
              type="text"
              fullWidth
              variant="standard"
              value={newCorrectAnswer}
              onChange={(e) => setNewCorrectAnswer(e.target.value)}
            />
            <TextField
              margin="dense"
              id="incorrect_answer"
              label="Incorrect Answer"
              type="text"
              fullWidth
              variant="standard"
              value={newIncorrectAnswer}
              onChange={(e) => setNewIncorrectAnswer(e.target.value)}
            />
            {createCardError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {createCardError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={creatingCard}
            >
              Cancel
            </Button>
            <Button
              id="create_button"
              onClick={handleCreateCard}
              disabled={creatingCard}
            >
              {creatingCard ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Card Edit Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="edit_question"
              label="Question"
              type="text"
              fullWidth
              variant="standard"
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
            />
            <TextField
              margin="dense"
              id="edit_correct_answer"
              label="Correct Answer"
              type="text"
              fullWidth
              variant="standard"
              value={editCorrectAnswer}
              onChange={(e) => setEditCorrectAnswer(e.target.value)}
            />
            <TextField
              margin="dense"
              id="edit_incorrect_answer"
              label="Incorrect Answer"
              type="text"
              fullWidth
              variant="standard"
              value={editIncorrectAnswer}
              onChange={(e) => setEditIncorrectAnswer(e.target.value)}
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

          {/* FIXME: Delete button should be left-aligned */}
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
              onClick={() => setOpenEditDialog(false)}
              disabled={updatingCard}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCard} disabled={updatingCard}>
              {updatingCard ? "Updating..." : "Update"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
