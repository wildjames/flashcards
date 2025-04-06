import { useState } from "react"

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
    CircularProgress
} from "@mui/material";

import DashboardButton from "../components/DashboardButton";
import LogoutButton from "../components/LogoutButton";


export default function GroupSearchPage() {
    const [groupName, setGroupName] = useState<string>("")
    const [groups, setGroups] = useState<Array<string>>([])
    const [loading, setLoading] = useState<boolean>(false)

    const handleSearchGroup = () => {
        setTimeout(() => {
            console.log("Searching for group", groupName)
            if (groupName.length) {
                setGroups([groupName])
            } else {
                console.log("Unsetting groups")
                setGroups([])
            }
            setLoading(false)
        }, 2000)
        setLoading(true)
    }

    // Allow Enter key to create a card
    const handleSearchEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearchGroup();
        }
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

            <Container sx={{ mt: 2 }}>
                {/* Search form here - think about how to lay it out*/}
                <TextField
                    margin="dense"
                    id="table-question"
                    label="Search for a group"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
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

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            Group Name
                                        </TableCell>
                                        <TableCell>
                                            Group Creator
                                        </TableCell>
                                        <TableCell>
                                            Group ID
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
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
