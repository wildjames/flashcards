import { useEffect, useState } from "react";
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
import { fetchUserDetails, searchGroupData } from "../helpers/utils";

interface GroupSearchProps {
    searchString: string;
}

export default function GroupSearch({ searchString }: GroupSearchProps) {
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
            // Delay to smooth out the UI
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };

        runSearch();
    }, [searchString]);

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

    const handleJoinGroup = (groupId: string, subscribed: boolean) => () => {
        if (subscribed) {
            console.log("Leaving group", groupId);
        } else {
            console.log("Joining group", groupId);
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
                                        <TableRow key={group.group_id}>
                                            <TableCell>{group.group_name}</TableCell>
                                            <TableCell>
                                                {userDataMapping
                                                    ? userDataMapping[group.creator_id]?.username
                                                    : "Unknown"}
                                            </TableCell>
                                            <TableCell>{group.group_id}</TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={handleJoinGroup(group.group_id, group.subscribed)}
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
