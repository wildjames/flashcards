import { useState } from "react";
import { AppBar, Button, Toolbar, Typography, Box, Container, TextField } from "@mui/material";
import DashboardButton from "../components/DashboardButton";
import LogoutButton from "../components/LogoutButton";
import GroupSearch from "../components/GroupSearch";

export default function GroupSearchPage() {
    const [searchForGroupName, setSearchForGroupName] = useState<string>("");
    const [searchString, setSearchString] = useState<string>("")

    const handleSearchEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            // Triggering a re-render with the updated search string will cause GroupSearch to run its search
            setSearchForGroupName(searchString);
        }
    };

    const handleSubmitSearch = () => {
        setSearchForGroupName(searchString);
    };

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

            {/* Search form */}
            <Container sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                <TextField
                    margin="dense"
                    id="table-question"
                    label="Search for a group"
                    type="text"
                    sx={{ maxWidth: "200ch", width: "80%" }}
                    // fullWidth
                    variant="standard"
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    onKeyDown={handleSearchEnter}
                />
                <Button
                    onClick={handleSubmitSearch}
                    variant="text"
                >
                    Search
                </Button>
            </Container >

            <GroupSearch searchString={searchForGroupName} />
        </>
    );
}
