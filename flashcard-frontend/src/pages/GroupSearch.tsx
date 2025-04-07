import { useEffect, useState } from "react"

import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    TextField,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    TableBody,
    Paper,
    Button
} from "@mui/material";

import DashboardButton from "../components/DashboardButton";
import LogoutButton from "../components/LogoutButton";

import { GroupSearchData, UserIdMapping } from "../helpers/types";
import { fetchUserDetails, searchGroupData } from "../helpers/utils";


export default function GroupSearchPage() {
    const [searchForGroupName, setSearchForGroupName] = useState<string>("")
    const [groups, setGroups] = useState<Array<GroupSearchData>>([])
    const [userDataMapping, setUserDataMapping] = useState<UserIdMapping>()
    const [loading, setLoading] = useState<boolean>(false)

    const handleSearchGroup = async () => {
        setLoading(true);

        try {
            console.log("Searching for group", searchForGroupName);
            if (searchForGroupName.length) {
                const groupData = await searchGroupData(searchForGroupName);
                setGroups(groupData);
            } else {
                console.log("Unsetting groups");
                setGroups([]);
            }
        } catch (err) {
            console.error(err);
        }

        // I add a short delay here to give the user mapping a chance to catch up, without making the screen flicker
        setTimeout(async () => {
            setLoading(false);
        }, 500);
    };

    // Update the userDataMapping
    useEffect(() => {
        const fetchUserMapping = async () => {
            if (groups.length > 0) {
                const userIds = new Set(groups.map((group) => group.creator_id));
                try {
                    console.log("Getting user data");
                    const userData = await fetchUserDetails(userIds);
                    setUserDataMapping(userData);
                } catch (err) {
                    console.error(err);
                }
            }
        };

        fetchUserMapping();
    }, [groups]);

    // Allow Enter key to create a card
    const handleSearchEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearchGroup();
        }
    };

    function handleJoinGroup(groupId: string, subscribed: boolean) {
        return () => {
            if (subscribed) {
                console.log("Leaving group", groupId)
            } else {
                console.log("Joining group", groupId)
            }
        }
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
                    >
                        Search for a group
                    </Typography>
                    <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                        <DashboardButton />
                        <LogoutButton />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 2 }}>
                {/* Search form here - think about how to lay it out*/}
                <TextField
                    margin="dense"
                    id="table-question"
                    label="Search for a group"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={searchForGroupName}
                    onChange={(e) => setSearchForGroupName(e.target.value)}
                    onKeyDown={handleSearchEnter}
                />
            </Container>

            {(!!groups.length && !loading) && (
                // TODO: This should be a separate component. For now I'm just deciding on general layouts
                <Container>
                    <Box sx={{ mt: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{ display: "flex", justifyContent: "left", mb: 4 }} >
                            Search Results
                        </Typography>

                        <TableContainer component={Paper} sx={{ maxWidth: "lg" }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            Group Name
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            Group Creator
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            Group ID
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map((group) => (
                                        <TableRow>
                                            <TableCell>
                                                {group.group_name}
                                            </TableCell>
                                            <TableCell>
                                                {userDataMapping ? userDataMapping[group.creator_id].username : "Unknown"}
                                            </TableCell>
                                            <TableCell>
                                                {group.group_id}
                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={handleJoinGroup(group.group_id, group.subscribed)}>
                                                    {group.subscribed ? "Leave" : "Join"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Container>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}
        </>
    )
}
