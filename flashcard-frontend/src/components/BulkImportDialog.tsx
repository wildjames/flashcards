import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import axiosInstance from "../helpers/axiosInstance";

interface ImportedCard {
    question: string;
    correct_answer: string;
}

interface BulkImportDialogProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
}

export default function BulkImportDialog({
    open,
    onClose,
    groupId,
}: BulkImportDialogProps) {
    const [bulkData, setBulkData] = useState("");
    const [bulkImportFormat, setBulkImportFormat] = useState("");

    const parseData = (data: string, format: string): ImportedCard[] => {
        let rows: string[][] = [];

        if (format === "json") {
            const parsedData = JSON.parse(data);
            if (!Array.isArray(parsedData)) {
                throw new Error("JSON data must be an array");
            }
            if (
                !parsedData.every(
                    (el) =>
                        typeof el === "object" &&
                        "question" in el &&
                        "correct_answer" in el
                )
            ) {
                throw new Error(
                    "JSON data must be an array of objects with question and correct_answer keys"
                );
            }
            return parsedData as ImportedCard[];
        }

        switch (format) {
            case "csv":
                rows = data.trim().split("\n").map((row) => row.split(","));
                break;
            case "confluence":
                console.log("Confluence format not supported yet");
                rows = [];
                break;
            case "tabbed":
                rows = data.trim().split("\n").map((row) => row.split("\t"));
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        return rows.map(([question, correct_answer]) => ({
            question: question.trim(),
            correct_answer: correct_answer.trim(),
        }));
    };

    const handleBulkSubmit = () => {
        try {
            const parsedCards = parseData(bulkData, bulkImportFormat);
            axiosInstance
                .post("/cards/bulk", { group_id: groupId, cards: parsedCards })
                .then((response) => {
                    if (response.status === 200) {
                        onClose();
                        setBulkData("");
                    } else {
                        throw new Error("Failed to create bulk cards");
                    }
                })
                .catch((err) => {
                    console.error("Failed to create bulk cards:", err);
                });
        } catch (error) {
            console.error("Failed to parse data:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} disableRestoreFocus fullWidth>
            <DialogTitle>Bulk Add Cards</DialogTitle>
            <DialogContent>
                <InputLabel id="bulk-import-format">Import Format</InputLabel>
                <Select
                    labelId="bulk-import-format"
                    id="bulk-import-format-select"
                    value={bulkImportFormat}
                    label="Import Format"
                    sx={{ width: "10em", margin: "0 0 1em 0" }}
                    onChange={(e) => setBulkImportFormat(e.target.value)}
                >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="tabbed">Tabbed</MenuItem>
                    <MenuItem value="confluence">Confluence</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                </Select>
                <TextField
                    autoFocus={true}
                    id="bulk-input"
                    label="Paste Data"
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    placeholder={`For CSV:
Question,Correct Answer
What is 2+2?,4`}
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleBulkSubmit} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
