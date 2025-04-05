import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

import axiosInstance from "../helpers/axiosInstance";

interface DeleteGroupDialogProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
}

export default function DeleteGroupDialog({
    open,
    onClose,
    groupId,
}: DeleteGroupDialogProps) {
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleDelete = () => {
        setError("");
        axiosInstance
            .delete(`/groups/${groupId}`)
            .then((response) => {
                if (response.status === 200) {
                    onClose();
                    nav("/dashboard");
                } else {
                    throw new Error("Failed to delete group");
                }
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete this group? This action cannot be undone.
                </Typography>
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="error" onClick={handleDelete}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
