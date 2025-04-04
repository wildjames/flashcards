"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error: string;
}

export default function DeleteGroupDialog({
  open,
  onClose,
  onConfirm,
  error,
}: DeleteGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Group</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this group? This action cannot be
          undone.
        </Typography>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
