import { useState, useEffect } from "react";

import { Box, CircularProgress, Typography } from "@mui/material";

import axiosInstance from "../helpers/axiosInstance";
import { GroupData, UserData, UserIdMapping } from "../helpers/types";

interface GroupDetailsProps {
    groupId: string;
}

export default function GroupDetails({ groupId }: GroupDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<GroupData | null>(null);
    const [creator, setCreator] = useState<UserData | null>(null);
    const [error, setError] = useState("");

    const fetchGroupData = async (groupId: string) => {
        const response = await axiosInstance.get(`/groups/${groupId}`);
        if (response.status !== 200) {
            throw new Error("Failed to fetch group");
        }
        return response.data;
    };

    const fetchUserDetails = async (userIds: string[]): Promise<UserIdMapping> => {
        const response = await axiosInstance.post("/user/details", { user_ids: userIds });
        if (response.status !== 200) {
            throw new Error("Failed to fetch user details");
        }
        return response.data;
    };

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
            } catch (err: any) {
                console.error(err);
                setError(err.message);
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
