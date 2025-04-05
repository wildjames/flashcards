import { useEffect, useState, useContext } from "react";
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

import GroupDetails from "../components/GroupDetails";
import GroupCardsTable from "../components/GroupCardsTable";
import BulkImportDialog from "../components/BulkImportDialog";
import DeleteGroupDialog from "../components/DeleteGroupDialog";

export default function GroupInfo() {
    const { groupId } = useParams<{ groupId: string }>();
    const authContext = useContext(AuthContext);
    const nav = useNavigate();

    // Local state only for controlling dialogs
    const [openBulkDialog, setOpenBulkDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authContext?.isAuthenticated && !authContext?.loading) {
            nav("/login");
        }
    }, [authContext, nav]);

    // Redirect if groupId is missing
    if (!groupId) {
        nav("/dashboard");
        return null;
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
                    sx={{ position: "fixed", bottom: 20, right: 30 }}
                    variant="extended"
                    onClick={() => setOpenBulkDialog(true)}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Bulk Import
                </Fab>

                <Fab
                    variant="extended"
                    color="secondary"
                    aria-label="delete"
                    sx={{ position: "fixed", bottom: 20, left: 30 }}
                    onClick={() => setOpenDeleteDialog(true)}
                >
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete Group
                </Fab>

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
            </Container>
        </>
    );
}
