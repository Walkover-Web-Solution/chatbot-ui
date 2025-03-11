'use client';
import { CsvLogo, DocLogo, PdfLogo } from "@/assests/assestsIndex";
import {
    createKnowledgeBaseEntry,
    deleteKnowBaseData,
    getAllKnowBaseData,
    updateKnowBaseData,
} from "@/config/ragApi";
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { KNOWLEDGE_BASE_CUSTOM_SECTION } from "@/utils/enums";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    LinearProgress,
    MenuItem,
    Radio,
    RadioGroup,
    Snackbar,
    TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import * as React from "react";

interface KnowledgeBaseType {
    _id: string;
    name: string;
    description: string;
    doc_id: string;
    org_id: string;
    chunks_id_array: string[];
    user_id: string | null;
    type: string;
}

function RagCompoonent() {
    const searchParams = useSearchParams();
    const { token, configuration } = JSON.parse(
        searchParams.get("ragDetails") || "{}"
    );
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [KnowledgeBases, setKnowledgeBases] = React.useState<
        KnowledgeBaseType[]
    >([]);
    const [chunkingType, setChunkingType] = React.useState<
        keyof typeof KNOWLEDGE_BASE_CUSTOM_SECTION | ""
    >(configuration?.chunkingType || "auto");
    const [open] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [file, setFile] = React.useState<File | null>(null); // State to hold the uploaded file
    const [alert, setAlert] = React.useState<{
        show: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        show: false,
        message: "",
        severity: "success",
    });
    const [editingKnowledgeBase, setEditingKnowledgeBase] =
        React.useState<KnowledgeBaseType | null>(null);
    const [fileType, setFileType] = React.useState<"url" | "file" | "private">(
        "url"
    );

    const fetchAllKnowledgeBase = async () => {
        const result = await getAllKnowBaseData();
        if (result.success) {
            setKnowledgeBases(result?.data || []);
        }
    };

    React.useEffect(() => {
        if (token) {
            SetSessionStorage("ragToken", token);
            window?.parent?.postMessage({ type: "ragLoaded" }, "*");
            setIsInitialized(true);
            fetchAllKnowledgeBase();
        }
    }, [token]);

    const handleSave = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.target);

        // Create payload object
        const payload = {
            name: formData.get("name"),
            description: formData.get("description"),
            chunking_type:
                configuration?.chunkingType || formData.get("chunking_type"),
            chunk_size:
                Number(configuration?.chunkSize) ||
                Number(formData.get("chunk_size")) ||
                null,
            chunk_overlap:
                Number(configuration?.chunkOverlap) ||
                Number(formData.get("chunk_overlap")) ||
                null,
        };

        if (editingKnowledgeBase) {
            // Handle update logic here
            try {
                // You'll need to implement the updateKnowledgeBaseEntry API
                const response = await updateKnowBaseData({
                    id: editingKnowledgeBase._id,
                    data: payload,
                });
                if (response?.success) {
                    setAlert({
                        show: true,
                        message: "Document updated successfully!",
                        severity: "success",
                    });
                    setKnowledgeBases((prevKnowledgeBases) =>
                        prevKnowledgeBases.map((kb) =>
                            kb._id === editingKnowledgeBase._id ? response.data : kb
                        )
                    );
                }
            } catch (error) {
                setAlert({
                    show: true,
                    message:
                        error?.response?.data?.message || "Failed to update knowledge base",
                    severity: "error",
                });
            } finally {
                setEditingKnowledgeBase(null);
                setIsLoading(false);
                setFile(null);
                event.target.reset();
            }
        } else {
            // Existing create logic
            // Convert payload to FormData
            const payloadFormData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== null) {
                    payloadFormData.append(key, value);
                }
            });

            // Add file to FormData if present
            if (file) {
                payloadFormData.append("file", file);
            } else {
                const url = formData.get("url");
                if (url) {
                    payloadFormData.append("url", url.toString());
                }
            }

            try {
                const response = await createKnowledgeBaseEntry(payloadFormData);
                if (response?.data) {
                    setAlert({
                        show: true,
                        message: "Document will be uploaded soon.",
                        severity: "success",
                    });
                    setFile(null); // Reset file state after submission
                    window.parent.postMessage(
                        { type: "rag", status: "create", data: response.data },
                        "*"
                    );
                    setKnowledgeBases((prevKnowledgeBase) => [
                        ...prevKnowledgeBase,
                        response.data,
                    ]);
                } else {
                    throw new Error("Failed to upload document");
                }
            } catch (error) {
                console.error("Error saving:", error);
                setAlert({
                    show: true,
                    message:
                        error?.response?.data?.message ||
                        "Failed to upload document. Please try again.",
                    severity: "error",
                });
                return; // Exit early on error
            } finally {
                setIsLoading(false);
                setFile(null);
                event.target.reset();
            }
        }
    };

    const handleEdit = (kb: KnowledgeBaseType) => {
        setEditingKnowledgeBase(kb);
        // Pre-fill the form fields
        setTimeout(() => {
            const form = document.querySelector("form");
            if (form) {
                const nameInput = form.elements.namedItem("name") as HTMLInputElement;
                nameInput.value = kb.name;
                nameInput.focus();

                (form.elements.namedItem("description") as HTMLInputElement).value =
                    kb.description;
                if (kb.type?.toLowerCase() === "url") {
                    (form.elements.namedItem("url") as HTMLInputElement).value =
                        kb.doc_id;
                }
            }
            // Close the accordion
            const accordion = document.querySelector(".MuiAccordion-root");
            if (accordion) {
                const expanded = accordion.classList.contains("Mui-expanded");
                if (expanded) {
                    (
                        accordion.querySelector(".MuiAccordionSummary-root") as HTMLElement
                    )?.click();
                }
            }
        }, 0);
    };

    const handleReset = () => {
        setEditingKnowledgeBase(null);
        setFile(null);
        // Reset form fields
        const form = document.querySelector("form");
        if (form) {
            form.reset();
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        const validFileTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/csv",
        ];

        if (selectedFile && validFileTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
        } else {
            setAlert({
                show: true,
                message: "Please upload a valid file (PDF, Word, or CSV).",
                severity: "error",
            });
            setFile(null);
        }
    };

    const handleClose = () => {
        window.parent.postMessage({ type: "closeRag" }, "*");
    };

    const handleDeleteKnowledgeBase = async (id: string) => {
        const result = await deleteKnowBaseData({ id });
        if (result.success) {
            setKnowledgeBases((prevKnowledgeBase) =>
                prevKnowledgeBase.filter((item: any) => (item.id || item?._id) !== id)
            );
            window.parent.postMessage(
                { type: "rag", status: "delete", data: result?.data || {} },
                "*"
            );
            setAlert({
                show: true,
                message: "Knowledge base deleted successfully",
                severity: "success",
            });
        }
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={() => {
                    window.parent.postMessage({ type: "closeRag" }, "*");
                }}
                TransitionComponent={Fade}
                maxWidth="md"
                fullWidth
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {isLoading && <LinearProgress color="success" />}
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: "bold",
                    }}
                    id="alert-dialog-title"
                >
                    {editingKnowledgeBase
                        ? "Edit Knowledge Base"
                        : "Knowledge Base Configuration"}
                    {editingKnowledgeBase && (
                        <Button variant="outlined" color="error" onClick={handleReset}>
                            Reset
                        </Button>
                    )}
                </DialogTitle>

                {isInitialized ? (
                    <form
                        onSubmit={handleSave}
                        style={{ display: "flex", flexDirection: "column", height: "100%" }}
                    >
                        <DialogContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                                overflow: "auto",
                                paddingY: 1,
                                gap: 1,
                            }}
                        >
                            <div>
                                <Typography variant="subtitle1">
                                    Document Name <span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    name="name"
                                    required
                                    placeholder="Enter document name"
                                    variant="outlined"
                                    sx={{ width: "50%" }}
                                />
                            </div>

                            <div>
                                <Typography variant="subtitle1">
                                    Document Description / Purpose{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    name="description"
                                    fullWidth
                                    id="outlined-multiline-flexible"
                                    required
                                    placeholder="Enter document description / purpose"
                                    variant="outlined"
                                    InputProps={{
                                        rows: 3,
                                        minRows: 3,
                                        maxRows: 4,
                                        multiline: true,
                                        inputComponent: "textarea",
                                    }}
                                />
                            </div>
                            <div style={{ display: editingKnowledgeBase ? "none" : "block" }}>
                                <RadioGroup
                                    row
                                    defaultValue={fileType}
                                    color="primary"
                                    name="input-type"
                                    onChange={(e) =>
                                        setFileType(e.target.value as "url" | "file" | "private")
                                    }
                                >
                                    <FormControlLabel
                                        value="url"
                                        control={
                                            <Radio
                                                sx={{ color: "black" }}
                                                checked={fileType === "url"}
                                            />
                                        }
                                        label="URL (Publicly available)"
                                    />
                                    <FormControlLabel
                                        value="file"
                                        control={
                                            <Radio
                                                sx={{ color: "black" }}
                                                checked={fileType === "file"}
                                            />
                                        }
                                        label="Upload File"
                                    />
                                </RadioGroup>
                                {fileType === "url" && (
                                    <Box>
                                        <TextField
                                            name="url"
                                            type="url"
                                            fullWidth
                                            placeholder="https://example.com/documentation"
                                            variant="outlined"
                                            disabled={!!editingKnowledgeBase}
                                            required={!file}
                                        />
                                    </Box>
                                )}
                                {fileType === "file" && (
                                    <Box
                                        sx={{
                                            border: "2px dashed #ccc",
                                            borderRadius: "4px",
                                            p: 3,
                                            textAlign: "center",
                                            cursor: editingKnowledgeBase
                                                ? "not-allowed"
                                                : file
                                                    ? "default"
                                                    : "pointer",
                                            opacity: editingKnowledgeBase ? 0.5 : 1,
                                            pointerEvents: editingKnowledgeBase ? "none" : "auto",
                                            "&:hover": {
                                                borderColor: file ? "#ccc" : "primary.main",
                                                backgroundColor: file
                                                    ? "transparent"
                                                    : "rgba(0, 0, 0, 0.04)",
                                            },
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (!file) {
                                                const droppedFile = e.dataTransfer.files[0];
                                                handleFileChange({ target: { files: [droppedFile] } });
                                            }
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                        }}
                                        onClick={() => {
                                            if (!file) {
                                                const input = document.createElement("input");
                                                input.type = "file";
                                                input.accept = ".pdf,.doc,.docx,.csv";
                                                input.onchange = handleFileChange;
                                                input.click();
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            color={file ? "success.main" : "text.primary"}
                                        >
                                            {file
                                                ? "File selected"
                                                : "Drag and drop a file here, or click to select a file"}
                                        </Typography>
                                        {file ? (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Chip
                                                    label={`Selected file: ${file.name}`}
                                                    color="primary"
                                                    onDelete={(e) => {
                                                        e.stopPropagation();
                                                        setFile(null);
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Button
                                                component="label"
                                                role={undefined}
                                                variant="outlined"
                                                tabIndex={-1}
                                                startIcon={<CloudUploadIcon />}
                                                className="mt-2"
                                            >
                                                Upload file
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </div>
                            <div style={{ display: editingKnowledgeBase ? "none" : "block" }}>
                                {!(
                                    configuration?.hideConfig === "true" ||
                                    configuration?.hideConfig === true
                                ) && (
                                        <Box
                                            sx={{
                                                mt: 1,
                                                display: "flex",
                                                flexDirection: { xs: "column", md: "row" },
                                                gap: 2,
                                                opacity: editingKnowledgeBase ? 0.5 : 1,
                                                pointerEvents: editingKnowledgeBase ? "none" : "auto",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    flex:
                                                        chunkingType === "semantic" || chunkingType === "auto"
                                                            ? 0.35
                                                            : 1,
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    Chunking Type
                                                </Typography>
                                                <TextField
                                                    name="chunking_type"
                                                    select
                                                    size="small"
                                                    fullWidth
                                                    required
                                                    disabled={isLoading}
                                                    defaultValue={chunkingType || ""}
                                                    onChange={(e) => setChunkingType(e.target.value)}
                                                >
                                                    <MenuItem value="" disabled>
                                                        Select strategy
                                                    </MenuItem>
                                                    {KNOWLEDGE_BASE_CUSTOM_SECTION?.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Box>

                                            {chunkingType !== "semantic" && chunkingType !== "auto" && (
                                                <>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            Chunk Size
                                                        </Typography>
                                                        <TextField
                                                            name="chunk_size"
                                                            type="number"
                                                            fullWidth
                                                            size="small"
                                                            defaultValue={512}
                                                            inputProps={{ min: "100" }}
                                                            disabled={isLoading}
                                                        />
                                                    </Box>

                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            Chunk Overlap
                                                        </Typography>
                                                        <TextField
                                                            name="chunk_overlap"
                                                            type="number"
                                                            fullWidth
                                                            size="small"
                                                            defaultValue={50}
                                                            inputProps={{ min: "0" }}
                                                            disabled={isLoading}
                                                        />
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    )}
                            </div>
                            <Divider sx={{ my: 2 }} />
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <Image src={DocLogo} alt="DOC" width={20} height={20} />
                                        Existing Knowledge Bases
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box
                                        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                                    >
                                        {KnowledgeBases.length === 0 ? (
                                            <Typography color="error" sx={{ textAlign: "center" }}>
                                                No existing knowledge bases
                                            </Typography>
                                        ) : (
                                            KnowledgeBases.map((kb: any) => (
                                                <Box
                                                    key={kb._id || kb.id}
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        gap: 2,
                                                        justifyContent: "space-between",
                                                        p: 1,
                                                        bgcolor:
                                                            editingKnowledgeBase?._id === kb._id
                                                                ? "rgba(0, 0, 0, 0.04)"
                                                                : "transparent",
                                                        border:
                                                            editingKnowledgeBase?._id === kb._id
                                                                ? "1px solid"
                                                                : "none",
                                                        borderColor: "primary.main",
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 1,
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        {(() => {
                                                            switch (
                                                            kb?.source?.fileFormat?.toUpperCase() ||
                                                            kb?.type?.toUpperCase()
                                                            ) {
                                                                case "PDF":
                                                                    return (
                                                                        <Image
                                                                            src={PdfLogo}
                                                                            alt="PDF"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    );
                                                                case "DOC":
                                                                    return (
                                                                        <Image
                                                                            src={DocLogo}
                                                                            alt="DOC"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    );
                                                                case "CSV":
                                                                    return (
                                                                        <Image
                                                                            src={CsvLogo}
                                                                            alt="CSV"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    );
                                                                case "URL":
                                                                    return (
                                                                        <LinkIcon sx={{ width: 20, height: 20 }} />
                                                                    );
                                                                default:
                                                                    return (
                                                                        <LinkIcon sx={{ width: 20, height: 20 }} />
                                                                    );
                                                            }
                                                        })()}
                                                        <Typography>{kb?.name}</Typography>
                                                        <Typography
                                                            sx={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                        >
                                                            - {kb?.description}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Button
                                                            color="primary"
                                                            size="small"
                                                            variant={
                                                                editingKnowledgeBase?._id === kb._id
                                                                    ? "contained"
                                                                    : "outlined"
                                                            }
                                                            onClick={() => handleEdit(kb)}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            {editingKnowledgeBase?._id === kb._id
                                                                ? "Editing..."
                                                                : "Edit"}
                                                        </Button>
                                                        <Button
                                                            color="error"
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => handleDeleteKnowledgeBase(kb?._id)}
                                                            sx={{ alignSelf: "flex-end" }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </DialogContent>
                        <DialogActions
                            sx={{
                                position: "sticky",
                                bottom: 0,
                                bgcolor: "background.paper",
                                borderTop: "1px solid",
                                borderColor: "divider",
                                p: 2,
                            }}
                        >
                            <Button variant="outlined" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={isLoading}>
                                {isLoading
                                    ? "Saving..."
                                    : editingKnowledgeBase
                                        ? "Update"
                                        : "Create"}
                            </Button>
                        </DialogActions>
                    </form>
                ) : (
                    <Box sx={{ width: "100%" }}>
                        <LinearProgress color="success" />
                    </Box>
                )}
            </Dialog>

            <Snackbar
                open={alert.show}
                autoHideDuration={6000}
                onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
            >
                <Alert
                    onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
                    severity={alert.severity}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default RagCompoonent;