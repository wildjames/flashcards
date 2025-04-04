import { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
    Checkbox,
    FormControlLabel,
} from "@mui/material";

import axiosInstance from "@helpers/axiosInstance";

interface GroupCreationDialogProps {
    open: boolean;
    onClose: () => void;
    // callback used by parent to re-fetch or update group list
    onGroupCreated: () => void;
}

export default function GroupCreationDialog({
    open,
    onClose,
    onGroupCreated,
}: GroupCreationDialogProps) {
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [createError, setCreateError] = useState("");
    const [newGroupName, setNewGroupName] = useState("");

    // For linking to Google Sheets
    const [useGoogleSheets, setUseGoogleSheets] = useState(false);
    const [googleSheetId, setGoogleSheetId] = useState("");
    const [googleSheetRange, setGoogleSheetRange] = useState("");

    // Placeholder function
    const handleCreateGroupWithGoogleSheets = async () => {
        try {
            // Example logging — replace with your real logic or API calls
            console.log(
                "Creating group linked to Google Sheets with the following data:"
            );
            console.log("Sheet ID (or URL):", googleSheetId);
            console.log("Sheet Range:", googleSheetRange);

            // The following API call is just a placeholder, and is intended to fail!
            const response = await axiosInstance.post("/groups/create_with_sheet", {
                group_name: newGroupName,
                sheet_id: googleSheetId,
                sheet_range: googleSheetRange,
            });

            console.log("Group with Google Sheets created:", response.data);
        } catch (err) {
            console.error("Failed to create a group with Google Sheets:", err);
            throw err; // re-throw so caller can catch it
        }
    };

    const handleCreateGroup = async () => {
        setCreatingGroup(true);
        setCreateError("");

        if (!newGroupName.trim()) {
            setCreateError("Group name cannot be empty");
            setCreatingGroup(false);
            return;
        }

        try {
            if (useGoogleSheets) {
                await handleCreateGroupWithGoogleSheets();
            } else {
                const response = await axiosInstance.post("/groups", {
                    group_name: newGroupName,
                });
                console.log("Created group:", response.data);
            }

            // Close the dialog and clear all inputs
            onClose();
            setNewGroupName("");
            setGoogleSheetId("");
            setGoogleSheetRange("");
            setUseGoogleSheets(false);

            // Notify the parent so it can refresh the group list
            onGroupCreated();
        } catch (err) {
            setCreateError("Failed to create group");
            console.error(err);
        } finally {
            setCreatingGroup(false);
        }
    };

    const handleClose = () => {
        if (!creatingGroup) {
            onClose();
            setCreateError("");
            setNewGroupName("");
            setUseGoogleSheets(false);
            setGoogleSheetId("");
            setGoogleSheetRange("");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="group_name"
                    label="Group Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />

                <FormControlLabel
                    sx={{ mt: 2 }}
                    control={
                        <Checkbox
                            checked={useGoogleSheets}
                            onChange={(e) => setUseGoogleSheets(e.target.checked)}
                        />
                    }
                    label="Link to Google Sheets?"
                />

                {/* If "link to google sheets" is checked, show additional inputs */}
                {useGoogleSheets && (
                    <>
                        <TextField
                            margin="dense"
                            id="google_sheet_id"
                            label="Google Sheet ID or URL"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={googleSheetId}
                            onChange={(e) => setGoogleSheetId(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            id="google_sheet_range"
                            label="Sheet Range (e.g., A1:Z100)"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={googleSheetRange}
                            onChange={(e) => setGoogleSheetRange(e.target.value)}
                        />
                    </>
                )}

                {createError && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {createError}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={creatingGroup}>
                    Cancel
                </Button>
                <Button onClick={handleCreateGroup} disabled={creatingGroup}>
                    {creatingGroup ? "Creating..." : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
