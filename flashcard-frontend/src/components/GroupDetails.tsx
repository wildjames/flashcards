import { useState, useEffect } from "react";

import { Box, CircularProgress, Typography } from "@mui/material";

import { GroupData, UserData } from "../helpers/types";
import { fetchGroupData, fetchUserDetails } from "../helpers/utils";

interface GroupDetailsProps {
    groupId: string;
}

export default function GroupDetails({ groupId }: GroupDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<GroupData | null>(null);
    const [creator, setCreator] = useState<UserData | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!groupId) {
                    throw new Error("Group ID is undefined");
                }
                const groupData = await fetchGroupData(groupId);
                setGroup(groupData);

                const creatorId = groupData.creator_id;
                const userDetails = await fetchUserDetails([creatorId]);
                setCreator(userDetails[creatorId]);
            } catch (err) {
                console.error(err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body1">
                {error}
            </Typography>
        );
    }

    if (!group) {
        return null;
    }

    return (
        <>
            <Typography variant="h4" component="div">
                {group.group_name}
            </Typography>
            <Typography variant="body1">
                {creator ? "Created by " + creator.username : "Loading..."} on{" "}
                {new Date(group.time_created).toLocaleString()}
            </Typography>
        </>
    );
}
