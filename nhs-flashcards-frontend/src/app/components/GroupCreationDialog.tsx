"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
} from "@mui/material";

import axiosInstance from "@/axios/axiosInstance";

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

  const handleCreateGroup = async () => {
    setCreatingGroup(true);
    setCreateError("");

    if (!newGroupName.trim()) {
      setCreateError("Group name cannot be empty");
      setCreatingGroup(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/groups", {
        group_name: newGroupName,
      });
      console.log("Created group:", response.data);
      onClose();
      // Clear input
      setNewGroupName("");
      // Notify parent so it can refresh group list
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
