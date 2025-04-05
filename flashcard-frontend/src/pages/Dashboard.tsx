import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import Grid from "@mui/material/Grid";

import { AuthContext } from "../context/AuthContext";

import axiosInstance from "../helpers/axiosInstance";
import { GroupData, UserIdMapping } from "../helpers/types";

import LogoutButton from "../components/LogoutButton";
import GroupCreationDialog from "../components/GroupCreationDialog";


export default function Dashboard() {
    const authContext = useContext(AuthContext);
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // For displaying user groups
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [userIdMapping, setUserIdMapping] = useState<UserIdMapping>({});
    // For creating new groups
    const [openDialog, setOpenDialog] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authContext?.isAuthenticated && !authContext?.loading) {
            console.log("Dashboard not authenticated, redirecting to login");
            nav("/login");
        }
    }, [authContext, nav]);

    // Fetch user groups
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
                    setUserIdMapping(response.data);
                    console.log("Got user details:", response.data);
                } catch (err) {
                    console.error("Failed to fetch user details:", err);
                }
            }
        };

        fetchUserDetails();
    }, [groups]);

    const handleCardClick = (groupId: string) => {
        nav(`/groups/${groupId}`);
    };

    // Called after group creation to refetch group list
    const handleGroupCreated = async () => {
        await fetchGroups();
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

                {/* Create Group FAB */}
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

                {/* Flashcard FAB */}
                <Fab
                    variant="extended"
                    color="primary"
                    aria-label="flashcard"
                    sx={{ position: "fixed", bottom: 16, right: "50%" }}
                    onClick={() => nav("/flashcard")}
                >
                    <BoltIcon sx={{ mr: 1 }} />
                    Flashcard
                </Fab>
            </Container>

            {/* Dialog for creating a new group */}
            <GroupCreationDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onGroupCreated={handleGroupCreated}
            />
        </>
    );
}
