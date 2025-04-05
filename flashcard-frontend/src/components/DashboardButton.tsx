import Button from "@mui/material/Button";

import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const nav = useNavigate();

    return (
        <Button color="inherit" onClick={() => nav("/dashboard")}>
            Dashboard
        </Button>
    );
}
