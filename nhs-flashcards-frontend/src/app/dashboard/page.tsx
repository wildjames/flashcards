"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import Grid from "@mui/material/Grid2";

import { AuthContext } from "@/context/AuthContext";
import LogoutButton from "@components/LogoutButton";
import axiosInstance from "@/axios/axiosInstance";

type GroupData = {
  group_id: string;
  group_name: string;
  creator_id: string;
  time_created: Date;
  time_updated: Date;
};

type UserData = {
  user_id: string;
  username: string;
  email: string;
};

type UserIdMapping = {
  [key: string]: UserData;
};

export default function DashboardPage() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // For displaying user groups
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [userIdMapping, setUserIdMapping] = useState<UserIdMapping>({});
  // For creating new groups
  const [openDialog, setOpenDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createError, setCreateError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authContext?.isAuthenticated && !authContext?.loading) {
      console.log("Dashboard not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [authContext, router]);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get("/user/groups");
      setGroups(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, authContext]);

  // When the groups are loaded, fetch the user details corresponding to the creator_id
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (groups.length > 0) {
        const creatorIds = groups.map((group: GroupData) => group.creator_id);

        // Remove duplicates
        const uniqueCreatorIds = Array.from(new Set(creatorIds));

        try {
          const response = await axiosInstance.post("/user/details", {
            user_ids: uniqueCreatorIds,
          });
          const data = response.data;
          const mapping: UserIdMapping = {};
          data.forEach((user: UserData) => {
            mapping[user.user_id] = user;
          });
          setUserIdMapping(mapping);
          console.log("Got user details:", data);
        } catch (err) {
          console.error("Failed to fetch user details:", err);
        }
      }
    };

    fetchUserDetails();
  }, [groups]);

  const handleCardClick = (groupId: string) => {
    router.push(`/groups/${groupId}`);
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
      const response = await axiosInstance.post("/groups", {
        group_name: newGroupName,
      });
      console.log("Created group:", response.data);
      setOpenDialog(false);
      setNewGroupName("");
    } catch (err: unknown) {
      setCreateError("Failed to create group");
      console.log(err);
    } finally {
      setCreatingGroup(false);
      // Re-fetch the groups list
      await fetchGroups();
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
            Dashboard
          </Typography>

          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            <LogoutButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" variant="body1">
              {error}
            </Typography>
          ) : groups.length > 0 ? (
            <Grid container spacing={3}>
              {groups.map((group: GroupData) => (
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                    lg: 3,
                  }}
                  key={group.group_id}
                >
                  <Card>
                    <CardActionArea
                      onClick={() => handleCardClick(group.group_id)}
                    >
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {group.group_name}
                        </Typography>
                        {userIdMapping[group.creator_id] && (
                          <Typography variant="body2" color="textSecondary">
                            Created by{" "}
                            {userIdMapping[group.creator_id].username}
                          </Typography>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">
              You are not subscribed to any groups.
            </Typography>
          )}
        </Box>

        <Fab
          variant="extended"
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          Create Group
        </Fab>

        <Fab
          variant="extended"
          color="primary"
          aria-label="flashcard"
          sx={{ position: "fixed", bottom: 16, right: "50%" }}
          onClick={() => router.push("/flashcard")}
        >
          <BoltIcon sx={{ mr: 1 }} />
          Flashcard
        </Fab>

        {/* Group Creation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={creatingGroup}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={creatingGroup}>
              {creatingGroup ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
