import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import { GroupData, UserData } from "@common/types";

type UserIdMapping = {
    [key: string]: UserData;
};

interface GroupsListProps {
    groups: GroupData[];
    userIdMapping: UserIdMapping;
    onGroupClick: (groupId: string) => void;
}

export default function GroupsList({
    groups,
    userIdMapping,
    onGroupClick,
}: GroupsListProps) {
    // If no groups exist, display a simple message.
    if (groups.length === 0) {
        return (
            <Typography variant="body1">
                You are not subscribed to any groups.
            </Typography>
        );
    }

    return (
        <Grid container spacing={3}>
            {groups.map((group) => (
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 3,
                    }}
                    key={group.group_id}
                >
                    <Card>
                        <CardActionArea onClick={() => onGroupClick(group.group_id)}>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    {group.group_name}
                                </Typography>
                                {userIdMapping[group.creator_id] && (
                                    <Typography variant="body2" color="textSecondary">
                                        Created by {userIdMapping[group.creator_id].username}
                                    </Typography>
                                )}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
