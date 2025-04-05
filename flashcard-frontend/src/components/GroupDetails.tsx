import { Box, CircularProgress, Typography } from "@mui/material";

import { GroupData, UserData } from "../helpers/types";

interface GroupDetailsProps {
    loadingGroup: boolean;
    groupError: string;
    group: GroupData | null;
    creator: UserData | null;
}

export default function GroupDetails({
    loadingGroup,
    groupError,
    group,
    creator,
}: GroupDetailsProps) {
    if (loadingGroup) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (groupError) {
        return (
            <Typography color="error" variant="body1">
                {groupError}
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
