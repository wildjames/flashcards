import { useEffect, useState } from "react";
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
import EjectIcon from '@mui/icons-material/Eject';

import LogoutButton from "../components/LogoutButton";
import DashboardButton from "../components/DashboardButton";

import GroupDetails from "../components/GroupDetails";
import GroupCardsTable from "../components/GroupCardsTable";
import BulkImportDialog from "../components/BulkImportDialog";
import DeleteGroupDialog from "../components/DeleteGroupDialog";
import { fetchGroupData, joinGroup, leaveGroup } from "../helpers/utils";

export default function GroupInfo() {
    const { groupId } = useParams<{ groupId: string }>();
    const nav = useNavigate();

    // Local state only for controlling dialogs
    const [openBulkDialog, setOpenBulkDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // And FAB
    const [isSubbed, setIsSubbed] = useState(false)

    // TODO: Really, this is not ideal since we're fetching the group data twice.
    // I should move the fetch out into a context, but for now I'll just hit the backend
    // slightly more than necessary.
    useEffect(() => {
        const runUpdate = async () => {
            const groupData = await fetchGroupData(groupId!)
            setIsSubbed(groupData.subscribed)
        }
        runUpdate()
    }, [groupId, isSubbed])

    // Redirect if groupId is missing
    if (!groupId) {
        nav("/dashboard");
        return null;
    }

    const handleLeaveGroup = async () => {
        await leaveGroup(groupId);
        // Trigger a reload
        setIsSubbed(!isSubbed)
    }

    const handleJoinGroup = async () => {
        await joinGroup(groupId);
        // Trigger a reload
        setIsSubbed(!isSubbed)
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
                    <GroupDetails groupId={groupId} />
                </Box>

                <Fab
                    color="primary"
                    aria-label="Add Bulk"
                    sx={{ position: "fixed", bottom: 16, right: 16 }}
                    variant="extended"
                    onClick={() => setOpenBulkDialog(true)}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Bulk Import
                </Fab>

                <Container sx={{
                    position: "fixed",
                    bottom: 16,
                    left: 16,
                    align: "left",
                    display: "flex",
                    flexDirection: "column",
                    width: "fit-content",
                    gap: 2,
                    padding: 0
                }}>
                    {isSubbed ? (
                        <Fab
                            variant="extended"
                            color="secondary"
                            aria-label="leave"
                            onClick={() => handleLeaveGroup()}
                        >
                            <EjectIcon sx={{ mr: 1 }} />
                            Leave Group
                        </Fab>
                    ) : (
                        <Fab
                            variant="extended"
                            color="secondary"
                            aria-label="leave"
                            onClick={() => handleJoinGroup()}
                        >
                            <EjectIcon sx={{ mr: 1 }} />
                            Join Group
                        </Fab>
                    )}

                    < Fab
                        variant="extended"
                        color="secondary"
                        aria-label="delete"

                        onClick={() => setOpenDeleteDialog(true)}
                    >
                        <DeleteIcon sx={{ mr: 1 }} />
                        Delete Group
                    </Fab>
                </Container>

                <GroupCardsTable groupId={groupId} />

                <BulkImportDialog
                    open={openBulkDialog}
                    onClose={() => setOpenBulkDialog(false)}
                    groupId={groupId}
                />

                <DeleteGroupDialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                    groupId={groupId}
                />
            </Container >
        </>
    );
}
