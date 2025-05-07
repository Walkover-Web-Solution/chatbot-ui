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
import LinkIcon from "@mui/icons-material/Link";
import {
    Alert,
    Dialog,
    DialogContent,
    LinearProgress,
    Snackbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { ArrowLeft, CircleX, Edit, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
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
    const [showListPage, setShowListPage] = React.useState<boolean>(configuration?.listPage || false);
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
                    window?.parent?.postMessage({ type: "rag_embed", name: response?.data?.name, description: response?.data?.description}, "*");
                    setKnowledgeBases((prevKnowledgeBases) =>
                        prevKnowledgeBases.map((kb) =>
                            kb._id === editingKnowledgeBase._id ? response?.data : kb
                        )
                    );
                }
            } catch (error: any) {
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
                event.currentTarget.reset();
            }
        } else {
            // Check if either file or URL is provided
            if (!file && !formData.get("url")) {
                setAlert({
                    show: true,
                    message: "Please upload a file or provide a URL",
                    severity: "error",
                });
                setIsLoading(false);
                return;
            }

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
                    setFile(null);
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
            } catch (error: any) {
                console.error("Error saving:", error);
                setAlert({
                    show: true,
                    message:
                        error?.response?.data?.message ||
                        "Failed to upload document. Please try again.",
                    severity: "error",
                });
                return;
            } finally {
                setIsLoading(false);
                setFile(null);
                event.target.reset();
            }
        }
    };

    const handleEdit = (kb: KnowledgeBaseType) => {
        setEditingKnowledgeBase(kb);
        setShowListPage(false);
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
        setShowListPage(true)
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
        configuration?.listPage && setShowListPage(true);
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
                sx={{
                    '& .MuiDialog-paper': {
                        height: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                    }
                }}
                className="relative"
            >
                {isLoading && <LinearProgress color="success" />}
                <div className="flex justify-between items-center font-bold text-xl px-4 pt-4" id="alert-dialog-title">
                    {showListPage
                        ? "Knowledge Base List"
                        : editingKnowledgeBase
                            ? "Edit Knowledge Base"
                            : <div className="flex gap-3 items-center">{configuration?.listPage && !showListPage && <ArrowLeft className="cursor-pointer" onClick={() => { setShowListPage(true) }} />} Knowledge Base Configuration</div>}
                    {showListPage && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowListPage(false)}
                        >
                            Add New Document
                        </button>
                    )}
                </div>

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
                                paddingY: 2,
                                gap: 1,
                            }}
                        >
                            {!showListPage &&
                                <>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Document Name <span className="text-error">*</span></span>
                                        </label>
                                        <input
                                            name="name"
                                            type="text"
                                            className="input input-bordered w-1/2"
                                            placeholder="Enter document name"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Document Description / Purpose <span className="text-error">*</span></span>
                                        </label>
                                        <textarea
                                            name="description"
                                            className="textarea textarea-bordered"
                                            placeholder="Enter document description / purpose"
                                            rows={3}
                                            required
                                        ></textarea>
                                    </div>

                                    {!editingKnowledgeBase && (
                                        <div className="form-control">
                                            <div className="flex gap-4">
                                                <label className="label cursor-pointer gap-2">
                                                    <input
                                                        type="radio"
                                                        name="input-type"
                                                        className="radio"
                                                        value="url"
                                                        checked={fileType === "url"}
                                                        onChange={(e) => setFileType(e.target.value as "url" | "file" | "private")}
                                                    />
                                                    <span className="label-text">URL (Publicly available)</span>
                                                </label>
                                                <label className="label cursor-pointer gap-2">
                                                    <input
                                                        type="radio"
                                                        name="input-type"
                                                        className="radio"
                                                        value="file"
                                                        checked={fileType === "file"}
                                                        onChange={(e) => setFileType(e.target.value as "url" | "file" | "private")}
                                                    />
                                                    <span className="label-text">Upload File</span>
                                                </label>
                                            </div>

                                            {fileType === "url" && (
                                                <input
                                                    name="url"
                                                    type="url"
                                                    className="input input-bordered w-full mt-2"
                                                    placeholder="https://example.com/documentation"
                                                    disabled={!!editingKnowledgeBase}
                                                    required={!file}
                                                />
                                            )}

                                            {fileType === "file" && (
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-4 mt-2 text-center ${file ? 'border-black' : 'border-base-300 hover:border-black cursor-pointer'
                                                        } ${editingKnowledgeBase ? 'opacity-50 pointer-events-none' : ''}`}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        if (!file && e.dataTransfer.files.length > 0) {
                                                            const droppedFile = e.dataTransfer.files[0];
                                                            handleFileChange({ target: { files: [droppedFile] } });
                                                        }
                                                    }}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        if (!file) {
                                                            const input = document.createElement("input");
                                                            input.type = "file";
                                                            input.accept = ".pdf,.doc,.docx,.csv";
                                                            input.required = true;
                                                            input.onchange = handleFileChange;
                                                            input.click();
                                                        }
                                                    }}
                                                >
                                                    <p className={file ? 'text-success' : 'text-base-content'}>
                                                        {file ? "File selected" : "Drag and drop a file here, or click to select a file"}
                                                    </p>
                                                    {file ? (
                                                        <div className="mt-2 flex justify-center">
                                                            <div className="rounded-full px-2 py-1 bg-black text-white">
                                                                <div className="flex items-center gap-2 justify-between w-full">
                                                                <span>{file.name}</span>
                                                                <button
                                                                    className="rounded text-white"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFile(null);
                                                                    }}
                                                                >
                                                                    <CircleX size={18} />
                                                                </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline mt-2"
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const input = document.createElement("input");
                                                                input.type = "file";
                                                                input.accept = ".pdf,.doc,.docx,.csv";
                                                                input.required = true;
                                                                input.onchange = handleFileChange;
                                                                input.click();
                                                            }}
                                                        >
                                                            <Upload />
                                                            Upload file
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!editingKnowledgeBase && !(configuration?.hideConfig === "true" || configuration?.hideConfig === true) && (
                                        <div className="mt-4 flex flex-col md:flex-row gap-4">
                                            <div className={`flex-1 ${chunkingType === "semantic" || chunkingType === "auto" ? 'md:w-1/3' : 'w-full'}`}>
                                                <label className="label">
                                                    <span className="label-text">Chunking Type</span>
                                                </label>
                                                <select
                                                    name="chunking_type"
                                                    className={`select select-bordered ${chunkingType === "semantic" || chunkingType === "auto" ? 'w-1/3' : 'w-full'}`}
                                                    required
                                                    disabled={isLoading}
                                                    value={chunkingType}
                                                    onChange={(e) => setChunkingType(e.target.value)}
                                                >
                                                    <option value="" disabled>Select chunking type</option>
                                                    {KNOWLEDGE_BASE_CUSTOM_SECTION?.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {chunkingType !== "semantic" && chunkingType !== "auto" && (
                                                <div className="flex-1 flex gap-4">
                                                    <div className="form-control flex-1">
                                                        <label className="label">
                                                            <span className="label-text">Chunk Size</span>
                                                        </label>
                                                        <input
                                                            name="chunk_size"
                                                            type="number"
                                                            className="input input-bordered"
                                                            defaultValue={512}
                                                            min="100"
                                                            disabled={isLoading}
                                                        />
                                                    </div>

                                                    <div className="form-control flex-1">
                                                        <label className="label">
                                                            <span className="label-text">Chunk Overlap</span>
                                                        </label>
                                                        <input
                                                            name="chunk_overlap"
                                                            type="number"
                                                            className="input input-bordered"
                                                            defaultValue={50}
                                                            min="0"
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            }
                            {!configuration?.listpage && !showListPage && <div className="divider my-1"></div>}
                            {(configuration?.listPage ? showListPage : true) && (
                                <div className="card bg-base-200 shadow-sm my-1">
                                    <div className="card-body p-0">
                                        <div className="collapse collapse-arrow">
                                            <input type="checkbox" defaultChecked />
                                            <div className="collapse-title text-sm font-medium flex items-center gap-2 px-4 py-3 bg-base-200">
                                                <Image src={DocLogo} alt="DOC" width={20} height={20} className="opacity-80" />
                                                <span className="text-base-content/80">Existing Knowledge Bases</span>
                                            </div>
                                            <div className="collapse-content px-0">
                                                {KnowledgeBases.length === 0 ? (
                                                    <div className="text-center text-error p-4 bg-base-100 rounded-lg m-2">
                                                        No existing knowledge bases
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-2 h-auto overflow-y-auto px-2">
                                                        {KnowledgeBases.map((kb: KnowledgeBaseType) => (
                                                            <div
                                                                key={kb._id || kb.id}
                                                                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg transition-all duration-200 ${editingKnowledgeBase?._id === kb._id
                                                                    ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                                                    : 'bg-base-100 hover:bg-base-200'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                                                                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                                                        {(() => {
                                                                            switch (
                                                                            kb?.source?.fileFormat?.toUpperCase() ||
                                                                            kb?.type?.toUpperCase()
                                                                            ) {
                                                                                case "PDF":
                                                                                    return <Image src={PdfLogo} alt="PDF" width={20} height={20} className="opacity-80" />;
                                                                                case "DOC":
                                                                                    return <Image src={DocLogo} alt="DOC" width={20} height={20} className="opacity-80" />;
                                                                                case "CSV":
                                                                                    return <Image src={CsvLogo} alt="CSV" width={20} height={20} className="opacity-80" />;
                                                                                case "URL":
                                                                                    return <LinkIcon className="w-5 h-5 opacity-80" />;
                                                                                default:
                                                                                    return <LinkIcon className="w-5 h-5 opacity-80" />;
                                                                            }
                                                                        })()}
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                                                        <span className="text-sm font-medium text-base-content truncate w-full max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">{kb?.name}</span>
                                                                        <span className="text-xs text-base-content/60 truncate w-full max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">{kb?.description}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-row sm:flex-row gap-2 flex-shrink-0 mt-2 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                                                                    <button
                                                                        className={`btn btn-sm gap-1 transition-all duration-200 w-1/2 sm:w-auto ${editingKnowledgeBase?._id === kb._id
                                                                            ? 'btn-primary shadow-md'
                                                                            : 'btn-outline btn-primary hover:bg-primary/10 hover:shadow-sm'
                                                                            }`}
                                                                        onClick={() => handleEdit(kb)}
                                                                    >
                                                                        <span className="flex gap-1 items-center font-medium"> <Edit className="w-4 h-4" /> {editingKnowledgeBase?._id === kb._id ? 'Editing...' : 'Edit'}</span>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline btn-error gap-1 hover:bg-error/10 hover:shadow-sm transition-all duration-200 w-1/2 sm:w-auto"
                                                                        onClick={() => handleDeleteKnowledgeBase(kb?._id)}
                                                                    >
                                                                        <span className="flex gap-1 items-center font-medium"> <Trash2 className="w-4 h-4" />Delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                        {!showListPage &&
                            <div className="sticky bottom-0 bg-base-100 border-t border-base-300 p-4 flex justify-end gap-2">
                                <button
                                    className="btn btn-outline gap-2"
                                    onClick={() =>editingKnowledgeBase ? handleReset() : handleClose()}
                                >
                                    <X className="w-4 h-4" />
                                {editingKnowledgeBase ? "Cancel" : "Close"}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : editingKnowledgeBase ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Create
                                        </>
                                    )}
                                </button>
                            </div>}
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