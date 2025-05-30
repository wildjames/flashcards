import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Container,
    Box,
    Typography,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    CircularProgress,
} from "@mui/material";

import { GroupSearchData, UserIdMapping } from "../helpers/types";
import { fetchUserDetails, joinGroup, leaveGroup, searchGroupData } from "../helpers/utils";


interface GroupSearchProps {
    searchString: string;
    refreshData: boolean;
}

export default function GroupSearch({ searchString, refreshData }: GroupSearchProps) {
    const nav = useNavigate();

    const [groups, setGroups] = useState<Array<GroupSearchData>>([]);
    const [userDataMapping, setUserDataMapping] = useState<UserIdMapping>();
    const [loading, setLoading] = useState<boolean>(false);

    // Run the search whenever the search string updates
    useEffect(() => {
        const runSearch = async () => {
            setLoading(true);
            if (searchString && searchString.length > 0) {
                try {
                    console.log("Searching for group", searchString);
                    const groupData = await searchGroupData(searchString);
                    setGroups(groupData);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setGroups([]);
            }
            // delay to smooth out the UI - the usernames take a second request to fetch.
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };

        runSearch();
    }, [searchString, refreshData]);

    // Update the user data mapping when group results change
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
            } else {
                setUserDataMapping(undefined);
            }
        };

        fetchUserMapping();
    }, [groups]);

    const handleGroupInclusionButton = (groupId: string, subscribed: boolean) => async () => {
        if (subscribed) {
            console.log("Leaving group", groupId);
            const message = await leaveGroup(groupId)
            console.log(message)
        } else {
            console.log("Joining group", groupId);
            const message = await joinGroup(groupId)
            console.log(message)
        }

        // Refresh the group table - dont set a loading spinner
        try {
            console.log("Searching for group", searchString);
            const groupData = await searchGroupData(searchString);
            setGroups(groupData);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {groups.length > 0 && !loading && (
                <Container>
                    <Box sx={{ mt: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{ display: "flex", justifyContent: "left", mb: 4 }}
                        >
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
                                        <TableRow
                                            key={group.group_id}
                                            hover
                                        // This winds up being a bit tricky on mobile, and also the button appears below it.
                                        // onClick={() => { nav(`/groups/${group.group_id}`) }}
                                        // sx={{ cursor: "pointer" }}
                                        >
                                            <TableCell
                                                onClick={() => { nav(`/groups/${group.group_id}`) }}
                                                sx={{ cursor: "pointer" }}
                                            >
                                                {group.group_name}
                                            </TableCell>
                                            <TableCell
                                                onClick={() => { nav(`/groups/${group.group_id}`) }}
                                                sx={{ cursor: "pointer" }}
                                            >
                                                {userDataMapping
                                                    ? userDataMapping[group.creator_id]?.username
                                                    : "Unknown"}
                                            </TableCell>
                                            <TableCell
                                                onClick={() => { nav(`/groups/${group.group_id}`) }}
                                                sx={{ cursor: "pointer" }}
                                            >{group.group_id}</TableCell>
                                            <TableCell>
                                                <Button
                                                    sx={{}}
                                                    fullWidth
                                                    onClick={handleGroupInclusionButton(group.group_id, group.subscribed)}
                                                >
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
        </>
    );
}
