import { useState } from "react";
import { AppBar, Button, Toolbar, Typography, Box, TextField, FormControl, Container } from "@mui/material";
import DashboardButton from "../components/DashboardButton";
import LogoutButton from "../components/LogoutButton";
import GroupSearch from "../components/GroupSearch";

export default function GroupSearchPage() {
    const [searchForGroupName, setSearchForGroupName] = useState<string>("");
    const [searchString, setSearchString] = useState<string>("")
    const [refreshData, setRefreshData] = useState<boolean>(false)

    const handleSearchEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            // Triggering a re-render with the updated search string will cause GroupSearch to run its search
            setSearchForGroupName(searchString);
            setRefreshData(!refreshData)
        }
    };

    const handleSubmitSearch = () => {
        setSearchForGroupName(searchString);
        setRefreshData(!refreshData)
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
            <Container sx={{ maxWidth: "lg", flexDirection: "column", alignItems: "center" }}>
                <FormControl sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "left", gap: 2 }}>
                    <TextField
                        margin="dense"
                        id="group-search-string"
                        label="Search for a group"
                        type="text"
                        sx={{ maxWidth: "40ch", width: "90%" }}
                        variant="standard"
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        onKeyDown={handleSearchEnter}
                    />
                    <Button
                        sx={{ width: "fit-content" }}
                        onClick={handleSubmitSearch}
                        variant="text"
                    >
                        Search
                    </Button>
                </FormControl >
            </Container >

            <GroupSearch searchString={searchForGroupName} refreshData={refreshData} />
        </>
    );
}
