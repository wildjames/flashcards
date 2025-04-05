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

import axiosInstance from "../helpers/axiosInstance";
import { CardData, GroupData, UserData, UserIdMapping } from "../helpers/types";

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

    const fetchCards = useCallback(() => {
        setLoadingCards(true);
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            setCardsError("Authentication Error");
            setLoadingCards(false);
            return;
        }

        axiosInstance.get(`/groups/${groupId}/cards`)
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

    //
    // USE EFFECTS
    //

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authContext?.isAuthenticated && !authContext?.loading) {
            console.error("Not authenticated, redirecting to login");
            nav("/login");
        }
    }, [authContext, nav]);

    useEffect(() => {
        fetchGroupAndCreator();
    }, [groupId]);


    // Delay the display of the card loading spinner to avoid brief flickers
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayLoadingCards(loadingCards);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [loadingCards]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards, groupId, authContext]);

    //
    // FUNCTIONS
    //

    const fetchGroupData = async (groupId: string) => {
        const response = await axiosInstance.get(`/groups/${groupId}`);
        if (response.status !== 200) {
            throw new Error("Failed to fetch group");
        }
        return response.data;
    };

    const fetchUserDetails = async (userIds: string[]): Promise<UserIdMapping> => {
        const response = await axiosInstance.post("/user/details", { user_ids: userIds });
        if (response.status !== 200) {
            throw new Error("Failed to fetch user details");
        }
        return response.data;
    };

    const fetchGroupAndCreator = async () => {
        try {
            // Fetch group details and update state
            // This is definitely not undefined, but TypeScript doesn't know that
            if (!groupId) {
                throw new Error("Group ID is undefined");
            }
            const groupData = await fetchGroupData(groupId);
            setGroup(groupData);

            // Extract creator_id from groupData and fetch creator details
            const creatorId = groupData.creator_id;
            const userDetails = await fetchUserDetails([creatorId]);
            console.debug("Creator data:", userDetails);

            setCreator(userDetails[creatorId]);
        } catch (err: any) {
            console.error(err);
            setGroupError(err.message);
        } finally {
            setLoadingGroup(false);
        }
    };

    //
    // HANDLERS
    //

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

        axiosInstance.post("/cards", {
            question: newQuestion,
            correct_answer: newCorrectAnswer,
            group_id: groupId,

        })
            .then((response) => {
                if (response.status) return response.data;
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

    const handleConfirmDeleteGroup = () => {
        axiosInstance.delete(`/groups/${groupId}`)
            .then((response) => {
                if (response.status === 200) {
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

    if (!groupId) {
        nav("/dashboard");
    }

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
                    onConfirm={handleConfirmDeleteGroup}
                    error={deleteError}
                />
            </Container>
        </>
    );
}
