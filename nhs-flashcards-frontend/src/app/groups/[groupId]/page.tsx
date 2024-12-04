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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { AuthContext } from "@/context/AuthContext";
import LogoutButton from "@/app/components/LogoutButton";
import DashboardButton from "@/app/components/DashboardButton";

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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // For editing cards
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editCard, setEditCard] = useState<CardData | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [updatingCard, setUpdatingCard] = useState(false);
  const [updateCardError, setUpdateCardError] = useState("");

  // For deleting cards
  const [deletingCard, setDeletingCard] = useState(false);
  const [deleteCardError, setDeleteCardError] = useState("");

  // For bulk import of card data
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [bulkImportFormat, setBulkImportFormat] = useState("");

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
      if (openCreateDialog) {
        if (!newQuestion.trim()) {
          document.getElementById("dialog-question")?.focus();
        } else if (!newCorrectAnswer.trim()) {
          document.getElementById("dialog-correct_answer")?.focus();
        }
      } else {
        if (!newQuestion.trim()) {
          document.getElementById("table-question")?.focus();
        } else if (!newCorrectAnswer.trim()) {
          document.getElementById("table-correct_answer")?.focus();
        }
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
    setOpenCreateDialog(false);

    // focus the create card question input from the table
    document.getElementById("table-question")?.focus();
  };

  const handleOpenBulkDialog = () => setOpenBulkDialog(true);
  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    setBulkData("");
  };

  const handleCreateBulkCards = (
    cards: Array<{ question: string; correct_answer: string }>
  ) => {
    console.log("Creating bulk cards", cards);
    // TODO: Implement bulk card creation (need a new backend endpoint)
  };

  const parseCSV = (data: string) => {
    // Parse the incoming data based on the selected input format
    let rows: string[][] = [];

    if (bulkImportFormat === "json") {
      const parsedData = JSON.parse(data);
      // Check that this data is an array, and each element is an object with question and correct_answer keys
      if (!Array.isArray(parsedData)) {
        throw new Error("JSON data must be an array");
      }
      if (
        !parsedData.every(
          (el) =>
            typeof el === "object" && "question" in el && "correct_answer" in el
        )
      ) {
        throw new Error(
          "JSON data must be an array of objects with question and correct_answer keys"
        );
      }
      return JSON.parse(data);
    }

    switch (bulkImportFormat) {
      case "csv":
        rows = data.split("\n").map((row) => row.split(","));
        break;
      case "confluence":
        console.log("Confluence format not supported yet");
        break;
      case "tabbed":
        rows = data.split("\n").map((row) => row.split("\t"));
        break;
      default:
        throw new Error(`Unsupported format: ${bulkImportFormat}`);
    }

    return rows.map(([question, correct_answer]) => ({
      question: question.trim(),
      correct_answer: correct_answer.trim(),
    }));
  };

  const handleBulkSubmit = () => {
    console.log("Bulk submit", bulkData);
    try {
      // Parse the incoming data, based on the selected input format
      const parsedCards = parseCSV(bulkData);
      // Pass the parsed data to the handleCreateBulkCards function
      handleCreateBulkCards(parsedCards);
      handleCloseBulkDialog();
    } catch (error) {
      console.error("Failed to parse CSV data:", error);
    }
  };

  // Clicking on a card row opens the edit dialog (there is also a button)
  const handleCardClick = (card: CardData) => {
    setEditCard(card);
    setEditQuestion(card.question);
    setEditCorrectAnswer(card.correct_answer);
    setOpenEditDialog(true);
  };

  // Update a card. Simple dialog.
  const handleUpdateCard = () => {
    if (!editCard) return;
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
      fetch(`/api/cards/${editCard.card_id}`, {
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
          fetchCards();
          setEditQuestion("");
          setEditCorrectAnswer("");
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

  const handleCreateEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateCard();
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

        {/* <Fab
          // FIXME: Should be round for small screens and extended for larger screens
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 20, right: 30 }}
          variant="extended"
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          Create Card
        </Fab> */}

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
          onClick={() => handleDeleteGroup()}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Group
        </Fab>

        {/* Cards table */}
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
        {/* FIXME: This dialog needs to expand to fill more of the screen, and the text should scroll if needed. */}
        {/*
          Submission should open a new dialog, which contains a table that has the newly imported cards.
          Then the user should be able to review them before creation.
        */}
        <Dialog open={openBulkDialog} onClose={handleCloseBulkDialog} fullWidth>
          <DialogTitle>Bulk Add Cards</DialogTitle>
          <DialogContent>
            {/* Dropdown box with import format in it */}
            <InputLabel id="bulk-import-format">Import Format</InputLabel>
            <Select
              labelId="bulk-import-format"
              id="bulk-import-format-select"
              value={bulkImportFormat}
              label="Import Format"
              sx={{ width: "10em", margin: "0 0 1em 0" }}
              onChange={(e) => setBulkImportFormat(e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="tabbed">Tabbed</MenuItem>
              <MenuItem value="confluence">Confluence</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
            <TextField
              id="bulk-input"
              label="Paste CSV Data"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              placeholder="Question,Correct Answer&#10;What is 2+2?,4"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBulkDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleBulkSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Card Creation Dialog */}
        {/* <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="dialog-question"
              label="Question"
              type="text"
              fullWidth
              variant="standard"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={handleCreateEnter}
            />
            <TextField
              margin="dense"
              id="dialog-correct_answer"
              label="Correct Answer"
              type="text"
              fullWidth
              variant="standard"
              value={newCorrectAnswer}
              onChange={(e) => setNewCorrectAnswer(e.target.value)}
              onKeyDown={handleCreateEnter}
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
              id="dialog-create_button"
              onClick={handleCreateCard}
              disabled={creatingCard}
            >
              {creatingCard ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog> */}

        {/* Card Edit Dialog */}
        {/* FIXME: This needs to be larger, and have word wrapping for cards with long fields. */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
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
