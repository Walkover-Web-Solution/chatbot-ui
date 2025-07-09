'use client';
import {
    createKnowledgeBaseEntry,
    deleteKnowBaseData,
    updateKnowBaseData,
} from "@/config/ragApi";
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { KNOWLEDGE_BASE_CUSTOM_SECTION } from "@/utils/enums";
import { CircleX, Loader2, Sparkles, Upload, X } from "lucide-react";
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
    source?: {
        type: string;
        data: {
            url?: string;
        };
    };
}

interface Configuration {
    token?: string;
    theme?: 'dark' | 'light';
    chunkingType?: keyof typeof KNOWLEDGE_BASE_CUSTOM_SECTION;
    chunkSize?: number;
    chunkOverlap?: number;
    hideConfig?: string;
}

interface AlertState {
    show: boolean;
    message: string;
    severity: "success" | "error";
}

const VALID_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
] as const;

function RagComponent() {
    
    // State management
    const [configuration, setConfiguration] = React.useState<Configuration>({});
    const [aiGenerationEnabled, setAiGenerationEnabled] = React.useState(false);
    const [chunkingType, setChunkingType] = React.useState<keyof typeof KNOWLEDGE_BASE_CUSTOM_SECTION | "">("auto");
    const [isLoading, setIsLoading] = React.useState(false);
    const [file, setFile] = React.useState<File | null>(null);
    const [editingKnowledgeBase, setEditingKnowledgeBase] = React.useState<KnowledgeBaseType | null>(null);
    const [fileType, setFileType] = React.useState<"url" | "file">("url");

    // Form refs for better form handling
    const formRef = React.useRef<HTMLFormElement>(null);
    const nameInputRef = React.useRef<HTMLInputElement>(null);
    const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
    const urlInputRef = React.useRef<HTMLInputElement>(null);

    // Computed values
    const theme = configuration?.theme || "light";
    const isDarkTheme = theme === 'dark';

    const resetForm = React.useCallback(() => {
        setEditingKnowledgeBase(null);
        setFile(null);
        setFileType("url");
        formRef.current?.reset();
    }, []);

    const handleDeleteKnowledgeBase = React.useCallback(async (id: string) => {
        try {
            const result = await deleteKnowBaseData({ id });
            if (result.success) {
                window.parent.postMessage(
                    { type: "rag", status: "delete", data: result?.data || { id } },
                    "*"
                );
                handleClose();
            }
        } catch (error: any) {
            window.parent.postMessage(
                { type: "iframe-message-rag", status: "delete", error: error?.response?.data || { id } },
                "*"
            );
        }
    }, []);

    const populateFormForEdit = React.useCallback((document: KnowledgeBaseType) => {
        // Use setTimeout to ensure form is rendered
        setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.value = document.name;
            }
            if (descriptionInputRef.current) {
                descriptionInputRef.current.value = document.description;
            }
            if (document?.source?.type?.toLowerCase() === "url" && urlInputRef.current) {
                urlInputRef.current.value = document?.source?.data?.url || "";
            }
        }, 0);
    }, []);

    // Message handler
    const handleMessage = React.useCallback((event: MessageEvent) => {
        const { type, data } = event.data || {};      
        switch (type) {
            case "INITIAL_CONFIG":
                setConfiguration(data);
                break;
                
            case "OPEN_ADD_DOCUMENT":
                if (data?.action === 'add') {
                    setEditingKnowledgeBase(null);
                    resetForm();
                }
                break;
                
            case "EDIT_DOCUMENT":
                const document = data?.document;
                if (document) {
                    setEditingKnowledgeBase(document);
                    populateFormForEdit(document);
                }
                break;
                
            case "DELETE_DOCUMENT":
                if (data?.document?._id) {
                    handleDeleteKnowledgeBase(data?.document?._id);
                }
                break;
        }
    }, [resetForm, populateFormForEdit, handleDeleteKnowledgeBase]);

    // Effects
    React.useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    React.useEffect(() => {
        if (configuration?.token) {
            SetSessionStorage("ragToken", configuration.token);
            
        }
    }, [configuration?.token]);

    React.useEffect(() => {
        setChunkingType(configuration?.chunkingType || "auto");
    }, [configuration?.chunkingType]);

    // Handlers
    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        
        try {
            const formData = new FormData(event.currentTarget);
            const payload = {
                name: formData.get("name"),
                description: formData.get("description"),
                chunking_type: configuration?.chunkingType || formData.get("chunking_type"),
                chunk_size: Number(configuration?.chunkSize) || Number(formData.get("chunk_size")) || null,
                chunk_overlap: Number(configuration?.chunkOverlap) || Number(formData.get("chunk_overlap")) || null,
            };

            if (editingKnowledgeBase) {
                const response = await updateKnowBaseData({
                    id: editingKnowledgeBase._id,
                    data: payload,
                });
                
                if (response?.success) {
                    window?.parent?.postMessage({ 
                        type: "rag", 
                        status: "update", 
                        data: {
                            name: response?.data?.name, 
                            description: response?.data?.description, 
                            id: response?.data?._id
                        }
                    }, "*");
                    handleClose();
                }
            } else {
                if (!file && !formData.get("url")) {
                    window.parent.postMessage(
                        { type: "iframe-message-rag", status: "update", error: "Please upload a file or provide a URL" },
                        "*"
                    );
                    return;
                }

                const payloadFormData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    if (value !== null) {
                        payloadFormData.append(key, String(value));
                    }
                });

                if (file) {
                    payloadFormData.append("file", file);
                } else {
                    const url = formData.get("url");
                    if (url) {
                        payloadFormData.append("url", url.toString());
                    }
                }

                const response = await createKnowledgeBaseEntry(payloadFormData);
                if (response?.data) {
                    window.parent.postMessage(
                        { type: "rag", status: "create", data: response.data },
                        "*"
                    );
                    handleClose();
                } else {
                    throw new Error("Failed to upload document");
                }
            }
        } catch (error: any) {
            console.error("Error saving:", error);
            window.parent.postMessage(
                { type: "iframe-message-rag", status: "create", error: error?.response?.data || { id } },
                "*"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        
        if (selectedFile && VALID_FILE_TYPES.includes(selectedFile.type as any)) {
            setFile(selectedFile);
        } else {
            window.parent.postMessage(
                { type: "iframe-message-rag", status: "update", error: "Please upload a valid file (PDF, Word, or CSV)." },
                "*"
            );
            setFile(null);
        }
    }, []);

    const handleClose = React.useCallback(() => {
        resetForm();
        window.parent.postMessage({ type: "closeRag" }, "*");
    }, [resetForm]);

    const handleFileDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!file && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            handleFileChange({ target: { files: [droppedFile] } } as any);
        }
    }, [file, handleFileChange]);

    const triggerFileInput = React.useCallback(() => {
        if (!file) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".pdf,.doc,.docx,.csv";
            input.onchange = handleFileChange as any;
            input.click();
        }
    }, [file, handleFileChange]);

    // Style classes
    const getInputClassName = (disabled = false) => `
        w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
            disabled
                ? (isDarkTheme ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-400')
                : (isDarkTheme 
                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500')
        }
    `;

    const getButtonClassName = (variant: 'primary' | 'secondary' = 'secondary') => `
        px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            variant === 'primary'
                ? (isDarkTheme ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                : (isDarkTheme ? 'border border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400')
        }
    `;


    React.useEffect(() => {
        setTimeout(() => {
            window?.parent?.postMessage({ type: "ragLoaded" }, "*");
        }, 0);
    }, []);

    return (
        <div className={`flex flex-col ${isDarkTheme ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'} transition-all duration-200 min-h-screen w-screen p-4`}>
            
            <div className={`flex justify-between items-center font-bold text-xl px-4 pt-4 w-full ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {editingKnowledgeBase ? "Edit Knowledge Base" : "Create Knowledge Base"}
            </div>

            <form ref={formRef} onSubmit={handleSave} className="flex flex-col h-full">
                <div className={`flex flex-col flex-grow overflow-auto p-4 gap-4 scrollbar-hide`}>
                    {/* Name Field */}
                    <div className="form-control">
                    <div className="flex items-center justify-between gap-3">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Knowledge Base Name <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>*</span>
                                </label>
                                   {/* {!editingKnowledgeBase && <label className={`flex items-center gap-2 text-sm font-medium mt-[-24px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <input
                                            type="checkbox"
                                            className={`toggle toggle-sm ${theme === 'dark' ? 'toggle-primary' : 'toggle-success'}`}
                                            checked={aiGenerationEnabled}
                                            onChange={(e) => setAiGenerationEnabled(e.target.checked)}
                                        />
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="w-4 h-4" />
                                            Generate name and decription using AI
                                        </span>
                                    </label>} */}
                                </div>
                        <input
                            ref={nameInputRef}
                            name="name"
                            type="text"
                            className={getInputClassName(aiGenerationEnabled)}
                            placeholder="Enter document name"
                            required
                            disabled={aiGenerationEnabled}
                        />
                    </div>

                    {/* Description Field */}
                    <div className="form-control">
                        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                            Description / Purpose <span className={`${isDarkTheme ? 'text-red-400' : 'text-red-500'}`}>*</span>
                        </label>
                        <textarea
                            ref={descriptionInputRef}
                            name="description"
                            className={getInputClassName(aiGenerationEnabled)}
                            placeholder="Enter document description / purpose"
                            rows={3}
                            required
                            disabled={aiGenerationEnabled}
                        />
                    </div>

                    {/* File/URL Input */}
                    <div className="form-control">
                        {editingKnowledgeBase && (
                            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                URL
                            </label>
                        )}
                        
                        {!editingKnowledgeBase && (
                            <div className="flex gap-4 mb-4">
                                <label className={`flex items-center gap-2 cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="input-type"
                                        className={`w-4 h-4 radio ${isDarkTheme ? 'text-blue-400 border-white' : 'text-blue-500'}`}
                                        value="url"
                                        checked={fileType === "url"}
                                        onChange={(e) => setFileType(e.target.value as "url" | "file")}
                                    />
                                    <span>URL (Publicly available)</span>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="input-type"
                                        className={`w-4 h-4 radio ${isDarkTheme ? 'text-blue-400 border-white' : 'text-blue-500'}`}
                                        value="file"
                                        checked={fileType === "file"}
                                        onChange={(e) => setFileType(e.target.value as "url" | "file")}
                                    />
                                    <span>Upload File</span>
                                </label>
                            </div>
                        )}

                        {(fileType === "url" || editingKnowledgeBase) && (
                            <input
                                ref={urlInputRef}
                                name="url"
                                type="url"
                                className={getInputClassName(!!editingKnowledgeBase)}
                                placeholder="https://example.com/documentation"
                                disabled={!!editingKnowledgeBase}
                                required={!file}
                            />
                        )}

                        {fileType === "file" && !editingKnowledgeBase && (
                            <div
                                className={`border-2 flex items-center justify-center gap-4 flex-col border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                                    file 
                                        ? `${isDarkTheme ? 'border-green-400 bg-green-900/20' : 'border-green-500 bg-green-50'}`
                                        : `${isDarkTheme ? 'border-gray-600 hover:border-gray-400 bg-gray-800/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'} cursor-pointer`
                                }`}
                                onDrop={handleFileDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={triggerFileInput}
                            >
                                <p className={`${file ? (isDarkTheme ? 'text-green-400' : 'text-green-600') : (isDarkTheme ? 'text-gray-300' : 'text-gray-600')}`}>
                                    {file ? "File selected" : "Drag and drop a file here, or click to select a file"}
                                </p>
                                {file ? (
                                    <div className="mt-2 flex justify-center">
                                        <div className={`rounded-full px-3 py-1 ${isDarkTheme ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                                            <div className="flex items-center gap-2 justify-between">
                                                <span>{file.name}</span>
                                                <button
                                                    type="button"
                                                    className={`rounded ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-200 hover:text-white'}`}
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
                                        type="button"
                                        className={getButtonClassName()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerFileInput();
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                        <Upload />
                                        <span>Upload file</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chunking Configuration */}
                    {!editingKnowledgeBase && configuration?.hideConfig !== "true" && (
                        <div className="mt-4 flex flex-col md:flex-row gap-4">
                            <div className={`flex-1 ${chunkingType === "semantic" || chunkingType === "auto" ? 'md:w-1/3' : 'w-full'}`}>
                                <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Chunking Type
                                </label>
                                <select
                                    name="chunking_type"
                                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                        chunkingType === "semantic" || chunkingType === "auto" ? 'w-1/3' : 'w-full'
                                    } ${getInputClassName().replace('w-full', '')}`}
                                    required
                                    disabled={isLoading}
                                    value={chunkingType}
                                    onChange={(e) => setChunkingType(e.target.value as any)}
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
                                        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Chunk Size
                                        </label>
                                        <input
                                            name="chunk_size"
                                            type="number"
                                            className={getInputClassName()}
                                            defaultValue={512}
                                            min="100"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="form-control flex-1">
                                        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Chunk Overlap
                                        </label>
                                        <input
                                            name="chunk_overlap"
                                            type="number"
                                            className={getInputClassName()}
                                            defaultValue={50}
                                            min="0"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Form Actions */}
                <div className={`sticky bottom-0 border-t p-4 flex justify-end gap-2 ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <button
                        type="button"
                        className={getButtonClassName()}
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`${getButtonClassName('primary')} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : editingKnowledgeBase ? (
                            "Update"
                        ) : (
                            "Create"
                        )}
                    </button>
                </div>
            </form>

            {/* Alert notification */}
            {/* {alert.show && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 z-50 ${
                    alert.severity === 'error' 
                        ? (isDarkTheme ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-100 text-red-800 border border-red-300')
                        : alert.severity === 'success'
                        ? (isDarkTheme ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-300')
                        : (isDarkTheme ? 'bg-blue-900 text-blue-200 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-300')
                }`}>
                    <div className="flex justify-between items-start">
                        <span>{alert.message}</span>
                        <button
                            onClick={hideAlert}
                            className={`ml-2 ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default RagComponent;