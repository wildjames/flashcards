import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { AuthContext } from "../context/AuthContext";

import LogoutButton from "../components/LogoutButton";
import DashboardButton from "../components/DashboardButton";

import CardEditDialog, { CardEditDialogProps } from "../components/CardEditDialog";

import BulkImportDialog from "../components/BulkImportDialog";

import GroupDetails from "../components/GroupDetails";
import GroupCardsTable from "../components/GroupCardsTable";
import DeleteGroupDialog from "../components/DeleteGroupDialog";

import { CardData, GroupData, UserData } from "../helpers/types";

export default function GroupInfo() {
    const { groupId } = useParams<{ groupId: string }>();
    const authContext = useContext(AuthContext);
    const nav = useNavigate();

    const [loadingGroup, setLoadingGroup] = useState(true);
    const [groupError, setGroupError] = useState("");
    const [group, setGroup] = useState<GroupData | null>(null);
    const [creator, setCreator] = useState<UserData | null>(null);

    const [loadingCards, setLoadingCards] = useState(true);
    const [displayLoadingCards, setDisplayLoadingCards] = useState(true);
    const [cardsError, setCardsError] = useState("");
    const [cards, setCards] = useState<CardData[]>([]);

    const [newQuestion, setNewQuestion] = useState("");
    const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editCard, setEditCard] = useState<CardData | null>(null);

    const [openBulkDialog, setOpenBulkDialog] = useState(false);

    // For deleting group
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authContext?.isAuthenticated && !authContext?.loading) {
            console.error("Not authenticated, redirecting to login");
            nav("/login");
        }
    }, [authContext, nav]);

    // Fetch group data
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            setGroupError("Authentication Error");
            setLoadingGroup(false);
            return;
        }

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
    }, [groupId]);

    // Delay the display of the card loading spinner to avoid brief flickers
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayLoadingCards(loadingCards);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [loadingCards]);

    const fetchCards = useCallback(() => {
        setLoadingCards(true);
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            setCardsError("Authentication Error");
            setLoadingCards(false);
            return;
        }

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
    }, [groupId]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards, groupId, authContext]);

    const handleCreateCard = () => {
        setCreatingCard(true);
        const accessToken = localStorage.getItem("access_token");

        if (!newQuestion.trim() || !newCorrectAnswer.trim()) {
            if (!newQuestion.trim()) {
                document.getElementById("table-question")?.focus();
            } else if (!newCorrectAnswer.trim()) {
                document.getElementById("table-correct_answer")?.focus();
            }
            setCreatingCard(false);
            return;
        }

        if (!accessToken) {
            console.error("Authentication Error");
            setCreatingCard(false);
            return;
        }

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
                setCreatingCard(false);
                document.getElementById("table-question")?.focus();
            })
            .catch((err) => {
                console.error(err);
                setCreatingCard(false);
            });
    };

    const handleOpenBulkDialog = () => setOpenBulkDialog(true);
    const handleCloseBulkDialog = () => setOpenBulkDialog(false);

    const handleCreateBulkCards = (
        cards: Array<{ question: string; correct_answer: string }>
    ) => {
        // TODO: Implement bulk card creation (need a new backend endpoint)
        console.log("Creating bulk cards", cards);
        fetchCards();
    };

    const handleCardClick = (card: CardData) => {
        setEditCard(card);
        setOpenEditDialog(true);
    };

    const handleCreateEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreateCard();
        }
    };

    const handleDeleteGroup = () => {
        setDeleteError("");
        setOpenDeleteDialog(true);
    };

    const confirmDeleteGroup = () => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            setDeleteError("Authentication Error");
            return;
        }

        fetch(`/api/groups/${groupId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    nav("/dashboard");
                } else {
                    throw new Error("Failed to delete group");
                }
            })
            .catch((err) => {
                console.error(err);
                setDeleteError(err.message);
            });
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

            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <GroupDetails
                        loadingGroup={loadingGroup}
                        groupError={groupError}
                        group={group}
                        creator={creator}
                    />
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
                    variant="extended"
                    color="secondary"
                    aria-label="delete"
                    sx={{ position: "fixed", bottom: 20, left: 30 }}
                    onClick={handleDeleteGroup}
                >
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete Group
                </Fab>

                <GroupCardsTable
                    cards={cards}
                    newQuestion={newQuestion}
                    setNewQuestion={setNewQuestion}
                    newCorrectAnswer={newCorrectAnswer}
                    setNewCorrectAnswer={setNewCorrectAnswer}
                    creatingCard={creatingCard}
                    handleCreateCard={handleCreateCard}
                    handleCardClick={handleCardClick}
                    displayLoadingCards={displayLoadingCards}
                    cardsError={cardsError}
                    handleCreateEnter={handleCreateEnter}
                />

                <BulkImportDialog
                    open={openBulkDialog}
                    onClose={handleCloseBulkDialog}
                    onSubmit={handleCreateBulkCards}
                />

                <CardEditDialog {...cardEditProps} />

                <DeleteGroupDialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                    onConfirm={confirmDeleteGroup}
                    error={deleteError}
                />
            </Container>
        </>
    );
}
