"use client";

// FIXME: This needs to be broken down into smaller components!!!
// I think:
// - GroupDetails
// - GroupCardsTable
// - EditCardDialog
// - DeleteGroupDialog (ask the user for confirmation!!)
// - BulkImportDialog
// - BulkImportReviewTable
// - BulkImportReviewDialog

// There are also a lot of repeated code snippets that can be extracted into functions.
// Not my best work, but it's a start!

import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CircularProgress,
  Button,
  TextField,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { AuthContext } from "@/context/AuthContext";
import LogoutButton from "@/app/components/LogoutButton";
import DashboardButton from "@/app/components/DashboardButton";
import CardEditDialog from "@/app/components/CardEditDialog";
import { CardEditDialogProps } from "@/app/components/CardEditDialog";
import BulkImportDialog from "@/app/components/BulkImportDialog";

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
  const [displayLoadingCards, setDisplayLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);

  // For creating new cards
  const [newQuestion, setNewQuestion] = useState("");
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [creatingCard, setCreatingCard] = useState(false);

  // For editing cards
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editCard, setEditCard] = useState<CardData | null>(null);

  // For bulk import of card data
  const [openBulkDialog, setOpenBulkDialog] = useState(false);

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
          return fetch("/api/user/details", {
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
          setCreator(data[0]);
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

  // If loadingCards is true for more than 1 second, display the loading spinner
  // This is to prevent the spinner from flashing on the screen for very short loading times
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayLoadingCards(loadingCards);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [loadingCards]);

  // Delete group
  const handleDeleteGroup = () => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            router.push("/dashboard");
          } else {
            throw new Error("Failed to delete group");
          }
        })
        .catch((err) => {
          console.error(err);
          setGroupError(err.message);
        });
    } else {
      setGroupError("Authentication Error");
    }
  };

  // Fetch cards for the group
  // Make this a callback function so that it can be called from places other than useEffect
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

  // Fetch cards when the group ID changes (this should only happen on page load)
  useEffect(() => {
    fetchCards();
  }, [fetchCards, groupId, authContext]);

  // Create a new card.
  // When the creation is done, focus the question input in the table
  // If the user has not filled in one of the things, focus that input
  const handleCreateCard = () => {
    setCreatingCard(true);
    const accessToken = localStorage.getItem("access_token");

    // Focus the first empty input
    if (!newQuestion.trim() || !newCorrectAnswer.trim()) {
      if (!newQuestion.trim()) {
        document.getElementById("table-question")?.focus();
      } else if (!newCorrectAnswer.trim()) {
        document.getElementById("table-correct_answer")?.focus();
      }
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
        })
        .catch((err) => {
          console.error(err);
          setCreatingCard(false);
        });
    } else {
      console.error("Authentication Error");
    }

    console.log("Card created");
    setCreatingCard(false);

    // refocus the question input
    document.getElementById("table-question")?.focus();
  };

  const handleOpenBulkDialog = () => setOpenBulkDialog(true);
  const handleCloseBulkDialog = () => setOpenBulkDialog(false);

  const handleCreateBulkCards = (
    cards: Array<{ question: string; correct_answer: string }>
  ) => {
    // TODO: Implement bulk card creation (need a new backend endpoint)
    console.log("Creating bulk cards", cards);
    // After successful creation, re-fetchCards
    fetchCards();
  };

  // Clicking on a card row opens the edit dialog
  const handleCardClick = (card: CardData) => {
    setEditCard(card);
    setOpenEditDialog(true);
  };

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
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
          >
            Group Management
          </Typography>
          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            <DashboardButton />
            <LogoutButton />
          </Box>
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
                {creator ? "Created by " + creator.username : "Loading..."} on{" "}
                {new Date(group.time_created).toLocaleString()}
              </Typography>
            </>
          ) : null}
        </Box>

        <Fab
          color="primary"
          aria-label="Add Bulk"
          sx={{ position: "fixed", bottom: 20, right: 30 }}
          variant="extended"
          onClick={handleOpenBulkDialog}
        >
          <AddIcon sx={{ mr: 1 }} />
          Bulk Import
        </Fab>

        <Fab
          // FIXME: Should be round for small screens and extended for larger screens
          variant="extended"
          color="secondary"
          aria-label="delete"
          sx={{ position: "fixed", bottom: 20, left: 30 }}
          onClick={handleDeleteGroup}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Group
        </Fab>

        {/* Cards Table */}
        <Box
          sx={{
            mt: 4,
            // FIXME: This breaks the layout on small screens, when the group name and creator name are long.
            // They wrap around, and push the table down!
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
                      <Button
                        onClick={handleCreateCard}
                        disabled={creatingCard}
                      >
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
                        <Button onClick={() => handleCardClick(card)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Bulk Import Dialog */}
        <BulkImportDialog
          open={openBulkDialog}
          onClose={handleCloseBulkDialog}
          onSubmit={handleCreateBulkCards}
        />

        {/* Card Edit Dialog */}
        <CardEditDialog {...cardEditProps} />
      </Container>
    </>
  );
}
