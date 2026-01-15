'use client';
import { getEmebedToken, uploadImage } from "@/config/api";
import {
    createKnowledgeBaseEntry,
    deleteKnowBaseData,
    updateKnowBaseData,
} from "@/config/ragApi";
import { SetSessionStorage } from "@/utils/ChatbotUtility";
import { KNOWLEDGE_BASE_CUSTOM_SECTION } from "@/utils/enums";
import { CircleX, Loader2, Sparkles, Upload, X } from "lucide-react";
import * as React from "react";
import { successToast, errorToast } from "@/components/customToast";

interface KnowledgeBaseType {
    _id: string;
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
    settings?: {
        chunkingType?: string;
        chunkSize?: number;
        chunkOverlap?: number;
    };
    content?: string;
    url?: string;
    title?: string;
}

interface Configuration {
    token?: string;
    theme?: 'dark' | 'light';
    chunkingType?: string;
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
    "text/plain"
] as const;

function RagComponent() {
    
    // State management
    const [configuration, setConfiguration] = React.useState<Configuration>({});
    const [aiGenerationEnabled, setAiGenerationEnabled] = React.useState(false);
    const [isIntegrationsOpen, setIsIntegrationsOpen] = React.useState(false);
    const [chunkingType, setChunkingType] = React.useState<string>("auto");
    const [isLoading, setIsLoading] = React.useState(false);
    const [editingKnowledgeBase, setEditingKnowledgeBase] = React.useState<KnowledgeBaseType | null>(null);
    const [emebedToken, setEmebedToken] = React.useState<string>("");

    // New State for UI alignment
    const [inputType, setInputType] = React.useState<'url' | 'file' | 'content'>('url');
    const [uploadedFile, setUploadedFile] = React.useState<{ name: string; url: string; type: string; size: number } | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [showQuerySettings, setShowQuerySettings] = React.useState(false);

    // React.useEffect(() => {
    //     const fetchToken = async () => {
    //         const token = await getEmebedToken();
    //         if (token) {
    //             setEmebedToken(token);
    //         }
    //     };

    //     if (configuration?.token) {
    //         fetchToken();
    //     }
    // }, [configuration?.token]);

    React.useEffect(() => {
        if (editingKnowledgeBase?.settings?.chunkingType) {
            setChunkingType(editingKnowledgeBase.settings.chunkingType);
        } else {
            setChunkingType(configuration?.chunkingType || "recursive"); // Default to recursive/auto
        }

        // Detect input type based on existing resource data
        if (editingKnowledgeBase) {
            if (editingKnowledgeBase.source?.data?.url) {
                setInputType('url');
            } else if (editingKnowledgeBase.content && !editingKnowledgeBase.url) {
                setInputType('content');
            } else {
                setInputType('url'); // Default for edit mode
            }
        } else {
            setInputType('url'); // Default for create mode
        }
    }, [editingKnowledgeBase, configuration]);


    // Form refs for better form handling
    const formRef = React.useRef<HTMLFormElement>(null);
    const nameInputRef = React.useRef<HTMLInputElement>(null);
    const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
    const urlInputRef = React.useRef<HTMLInputElement>(null);
    const contentInputRef = React.useRef<HTMLTextAreaElement>(null);

    // Computed values
    const theme = configuration?.theme || "light";
    const isDarkTheme = theme === 'dark';

    const resetForm = React.useCallback(() => {
        setEditingKnowledgeBase(null);
        setUploadedFile(null);
        setInputType("url");
        setChunkingType("recursive");
        setShowQuerySettings(false);
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
                nameInputRef.current.value = document.name || document.title || "";
            }
            if (descriptionInputRef.current) {
                descriptionInputRef.current.value = document.description || "";
            }
            if ((document?.source?.type?.toLowerCase() === "url" || document.url) && urlInputRef.current) {
                urlInputRef.current.value = document?.source?.data?.url || document.url || "";
            }
            if (document.content && contentInputRef.current) {
                contentInputRef.current.value = document.content;
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
                if (data?.action === 'add' || data?.action === 'add_new') {
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

    // Handlers
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await uploadImage({ formData, isVedioOrPdf: true });
            // Adapt to response structure. KnowledgeBaseModal expects url or file_url or data.url
            const fileUrl = response.url || response.file_url || response.data?.url;

            if (fileUrl) {
                setUploadedFile({
                    name: file.name,
                    url: fileUrl,
                    type: file.type,
                    size: file.size
                });
                successToast(`Successfully uploaded ${file.name}`);
            } else {
                throw new Error("Failed to get file URL from response");
            }

        } catch (error: any) {
            errorToast(`Failed to upload ${file.name}: ${error.message}`);
        } finally {
            setIsUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
    };


    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        
        try {
            const formData = new FormData(event.currentTarget);

            // Get query access type from form
            const collection_details = formData.get("queryAccessType") || "fastest";

            let settings: any = {};
            let content = "";
            let resourceUrl = "";

            settings.strategy = chunkingType || configuration?.chunkingType || "recursive";
            if (formData?.get("chunk_size") || configuration?.chunkSize) {
                settings.chunkSize = Number(formData?.get("chunk_size")) || Number(configuration?.chunkSize);
            }
            if ((formData?.get("chunk_overlap") || configuration?.chunkOverlap) && (chunkingType === 'semantic' || settings.strategy === 'semantic')) {
                settings.chunkOverlap = Number(formData?.get("chunk_overlap")) || Number(configuration?.chunkOverlap);
            }

            if (inputType === 'file' && !editingKnowledgeBase) {
                if (uploadedFile) {
                    resourceUrl = uploadedFile.url;
                    content = uploadedFile.url;
                } else {
                    // Unlike frontend, we enforce upload first for consistency in this implementation
                    // unless we want to support direct file blob sending which is what the OLD page.tsx did.
                    // The requirement is "acc to the frontend", so we use the URL flow.
                    if (!formData.get("file") && !uploadedFile) {
                        errorToast("Please upload a file");
                        setIsLoading(false);
                        return;
                    }
                }
            } else if (inputType === 'content') {
                content = (formData.get("content") || "").toString().trim();
            } else {
                resourceUrl = (formData.get("url") || "").toString().trim();
                content = resourceUrl;
            }

            const payload: any = {
                title: (formData.get("name") || "").toString().trim(),
                description: (formData.get("description") || "").toString().trim(),
                settings: settings,
                collection_details: collection_details,
            };

            if (content && content !== resourceUrl && content.trim() !== "") {
                payload.content = content;
            } else {
                payload.url = resourceUrl;
            }


            if (editingKnowledgeBase) {
                // Update logic
                const updatePayload: any = {
                    name: payload.name,
                    title: payload.title,
                };
                if (payload.content) updatePayload.content = payload.content;

                const response = await updateKnowBaseData({
                    id: editingKnowledgeBase._id,
                    data: updatePayload,
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
                // Create logic
                // The existing createKnowledgeBaseEntry in chatbot-ui seemed to support FormData with 'file' blob.
                // Now we are sending JSON payload mostly, as we have a URL.
                // BUT current `createKnowledgeBaseEntry` in `ragApi.ts` takes `data` and sends it as BODY.
                // It does NOT enforce FormData.
                // However, the OLD page.tsx created FormData.
                // If we send JSON object, `axios.post` handles it as JSON.

                // Ensure `createKnowledgeBase ENTRY` can handle JSON.
                // `ragApi.ts`: `axios.post(..., data)` -> Yes.

                const response = await createKnowledgeBaseEntry(payload);
                if (response?.data) {
                    window.parent.postMessage(
                        { type: "rag", status: "create", data: response.data },
                        "*"
                    );
                    handleClose();
                } else {
                    throw new Error("Failed to create document");
                }
            }
        } catch (error: any) {
            console.error("Error saving:", error);
            window.parent.postMessage(
                { type: "iframe-message-rag", status: "create", error: error?.response?.data || { id: "error" } },
                "*"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = React.useCallback(() => {
        resetForm();
        window.parent.postMessage({ type: "closeRag" }, "*");
    }, [resetForm]);


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

    // React.useEffect(() => {
    //     if (!editingKnowledgeBase && emebedToken) {
    //         const script = document.createElement("script");
    //         script.id = "viasocket-embed-main-script";
    //         script.src = "https://embed.viasocket.com/prod-embedcomponent.js";
    //         script.setAttribute("parentId", "viasocketParentId");
    //         script.setAttribute("embedToken", emebedToken);
    //         document.body.appendChild(script);
    //     }
    // }, [emebedToken, editingKnowledgeBase]);

    // const handleOpenViasocket = (action: string) => {
    //     if (action === "Open") {
    //         window?.openViasocket(undefined, { templateId: 'scriSzZZKe6c' });
    //         if (document.getElementById("viasocketParentId")) {
    //             document.getElementById("viasocketParentId").classList.remove("hidden");
    //         }
    //         setIsIntegrationsOpen(true);
    //     } else {
    //         if (document.getElementById("viasocketParentId")) {
    //             document.getElementById("viasocketParentId").classList.add("hidden");
    //         }
    //         setIsIntegrationsOpen(false);
    //     }

    // };

    // React.useEffect(() => {
    //     window.addEventListener("message", async (event) => {
    //         if (event.origin === "https://embedfrontend.viasocket.com" && event.data.action === "published") {
    //             const payload = {
    //                 name: event.data.title,
    //                 description: event.data.description,
    //                 url: event.data.webhookurl,
    //                 title: event.data.title,
    //             };

    //             const response = await createKnowledgeBaseEntry(payload);
    //             if (response?.data) {
    //                 window.parent.postMessage(
    //                     { type: "iframe-message-rag", status: "create", data: response.data },
    //                     "*"
    //                 );
    //                 handleClose();
    //             } else {
    //                 throw new Error("Failed to upload document");
    //             }
    //         }
    //     });
    // }, []);

    const triggerFileInput = React.useCallback(() => {
        if (!uploadedFile) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".pdf,.doc,.docx,.txt,.csv";
            input.onchange = handleFileUpload as any;
            input.click();
        }
    }, [uploadedFile, handleFileUpload]);


    return (
        <div className={`flex flex-col ${isDarkTheme ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'} transition-all duration-200 min-h-screen w-screen p-4`}>
            
            <div className={`flex justify-between items-center font-bold text-xl px-4 pt-4 w-full ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {editingKnowledgeBase ? "Edit Knowledge Base" : "Create Knowledge Base"}
            </div>
            {/* {!editingKnowledgeBase &&
                <>
                    <div className="flex items-center justify-center flex-col mt-4 gap-4 font-bold text-xl w-full">
                        <h1 className="flex items-center gap-2"><DriveIcon height={24} width={24} /> <span>Connect Drive Documents</span></h1>
                        <button
                            className={`btn btn-sm gap-2 mb-2 self-center w-64 ${isIntegrationsOpen
                                ? 'btn'
                                : 'btn-primary'
                                }`}
                            onClick={() => handleOpenViasocket(isIntegrationsOpen ? "Close" : "Open")}
                        >
                            {isIntegrationsOpen ? (
                                <>
                                    <X className="w-4 h-4" />
                                    Close Drive Integration
                                </>
                            ) : (
                                <>
                                    <Settings className="w-4 h-4" />
                                    Open Drive Integration
                                </>
                            )}
                        </button>
                    </div>
                </>} */}
            {/* {!editingKnowledgeBase && <div id="viasocketParentId" className="h-[90vh] w-[90%] mx-auto p-8 hidden pb-4"></div>} */}

            {/* {!editingKnowledgeBase && <div className="flex items-center my-4 mt-4 ">
                <div className="flex-grow h-px bg-base-300"></div>
                <span className={`mx-4 text-sm text-base-content ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>OR</span>
                <div className="flex-grow h-px bg-base-300"></div>
            </div>} */}

            <form ref={formRef} onSubmit={handleSave} className="flex flex-col h-full">
                <div className={`flex flex-col flex-grow overflow-auto p-4 gap-4 scrollbar-hide`}>
                    {/* Name Field */}
                    <div className="form-control">
                    <div className="flex items-center justify-between gap-3">
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Knowledge Base Name <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>*</span>
                            </label>
                        </div>
                        <input
                            ref={nameInputRef}
                            name="name"
                            type="text"
                            className={getInputClassName(aiGenerationEnabled)}
                            placeholder="Enter document name"
                            defaultValue={editingKnowledgeBase?.name || ""}
                            required
                            disabled={aiGenerationEnabled}
                        />
                    </div>

                    {/* Description Field */}
                    <div className="form-control">
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            Description
                        </label>
                        <textarea
                            ref={descriptionInputRef}
                            name="description"
                            rows={3}
                            className={getInputClassName(aiGenerationEnabled)}
                            placeholder="Enter a description for this knowledge base entry"
                            defaultValue={editingKnowledgeBase?.description || ""}
                            disabled={aiGenerationEnabled}
                        />
                    </div>

                    {/* Input Type Selection */}
                    {!editingKnowledgeBase && (
                        <div className="flex gap-4 m-2">
                            <label className={`flex items-center gap-2 cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="inputType"
                                    className={`w-4 h-4 radio ${isDarkTheme ? 'text-blue-400 border-white' : 'text-blue-500'}`}
                                    checked={inputType === 'url'}
                                    onChange={() => setInputType('url')}
                                />
                                <span className="text-sm font-medium">URL</span>
                            </label>
                            <label className={`flex items-center gap-2 cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="inputType"
                                    className={`w-4 h-4 radio ${isDarkTheme ? 'text-blue-400 border-white' : 'text-blue-500'}`}
                                    checked={inputType === 'file'}
                                    onChange={() => setInputType('file')}
                                />
                                <span className="text-sm font-medium">Upload File</span>
                            </label>
                            <label className={`flex items-center gap-2 cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="inputType"
                                    className={`w-4 h-4 radio ${isDarkTheme ? 'text-blue-400 border-white' : 'text-blue-500'}`}
                                    checked={inputType === 'content'}
                                    onChange={() => setInputType('content')}
                                />
                                <span className="text-sm font-medium">Content</span>
                            </label>
                        </div>
                    )}

                    {/* File/URL/Content Input */}
                    <div className="form-control">

                        {inputType === 'file' && !editingKnowledgeBase ? (
                            <div className="form-control">
                                <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                    File <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>*</span>
                                </label>

                                {!uploadedFile ? (
                                    <div
                                        className={`border-2 flex items-center justify-center gap-4 flex-col border-dashed rounded-lg p-4 text-center transition-all duration-200 ${isDarkTheme ? 'border-gray-600 hover:border-gray-400 bg-gray-800/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                            }`}
                                        onClick={triggerFileInput}
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Uploading file...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <p className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'}>
                                                    Click to upload a file
                                                </p>
                                                <button
                                                    type="button"
                                                    className={getButtonClassName()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerFileInput();
                                                    }}
                                                    disabled={isUploading}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Upload />
                                                        <span>Upload file</span>
                                                    </div>
                                                </button>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                    accept=".pdf,.doc,.docx,.txt,.csv"
                                                />
                                            </>
                                        )}
                                        <span className="text-xs text-gray-400">Supported formats: .pdf, .doc, .docx, .txt</span>
                                    </div>
                                ) : ( // Display uploaded file
                                    <div className={`mt-1 flex items-center justify-between p-3 rounded text-sm ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className={`truncate font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{uploadedFile.name}</span>
                                            <span className="text-xs text-gray-500">
                                                ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeUploadedFile}
                                            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-500 hover:text-white"
                                            disabled={false}
                                            title="Remove file"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : inputType === 'content' && !editingKnowledgeBase ? (
                            <div className="form-control">
                                <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Content <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>*</span>
                                </label>
                                <textarea
                                    ref={contentInputRef}
                                    name="content"
                                    className={`${getInputClassName(false)} h-32`}
                                    placeholder="Enter content here..."
                                    required
                                />
                            </div>
                        ) : editingKnowledgeBase ? (
                            // Edit Mode
                            editingKnowledgeBase?.content && !editingKnowledgeBase?.url ? (
                                <div className="form-control">
                                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Content
                                    </label>
                                    <textarea
                                        ref={contentInputRef}
                                        name="content"
                                        className={`${getInputClassName(false)} h-32`}
                                        placeholder="Enter content here..."
                                        defaultValue={editingKnowledgeBase.content}
                                        required
                                    />
                                </div>
                            ) : (editingKnowledgeBase?.url || editingKnowledgeBase?.source?.data?.url) ? (
                                <div className="form-control">
                                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                        URL
                                    </label>
                                    <input
                                        type="url"
                                        name="url"
                                        className={getInputClassName(true)}
                                        placeholder="https://example.com/resource"
                                        disabled={true}
                                        defaultValue={editingKnowledgeBase.url || editingKnowledgeBase.source?.data?.url}
                                        readOnly
                                    />
                                    <span className="text-xs text-gray-400 mt-1">URL cannot be edited</span>
                                </div>
                            ) : null
                        ) : (
                            // Create URL Mode
                            <div className="form-control">
                                <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                    URL <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>*</span>
                                </label>
                                <input
                                    ref={urlInputRef}
                                    type="url"
                                    name="url"
                                    className={getInputClassName(false)}
                                    placeholder="https://example.com/resource"
                                    required={inputType === 'url'}
                                />
                            </div>
                        )}
                    </div>

                    {/* Chunking Configuration */}
                    {!editingKnowledgeBase && configuration?.hideConfig !== "true" && (
                        <div className="mt-4">
                            {chunkingType === 'custom' ? (
                                <div className="form-control">
                                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Chunking URL
                                    </label>
                                    <input
                                        type="url"
                                        name="chunkingUrl" // Assuming backend handles this if passed, frontend modal has it.
                                        className={getInputClassName()}
                                        placeholder="https://example.com/chunking-service"
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <div className="form-control flex-1">
                                        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Chunking Type
                                        </label>
                                        <select
                                            name="chunking_type"
                                            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 w-full ${getInputClassName().replace('w-full', '')}`}
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

                                    <div className="form-control flex-1">
                                        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Chunk Size
                                        </label>
                                        <input
                                            name="chunk_size"
                                            type="number"
                                            className={getInputClassName()}
                                            defaultValue={configuration?.chunkSize || 4000}
                                            min="1"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {(chunkingType === "semantic" || chunkingType === "auto") && (
                                        <div className="form-control flex-1">
                                            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Chunk Overlap
                                            </label>
                                            <input
                                                name="chunk_overlap"
                                                type="number"
                                                className={getInputClassName()}
                                                defaultValue={configuration?.chunkOverlap || 200}
                                                min="0"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Query Settings Accordion */}
                    {!editingKnowledgeBase && (
                        <div className={`collapse z-0 collapse-arrow border ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                            <input
                                type="checkbox"
                                checked={showQuerySettings}
                                onChange={(e) => setShowQuerySettings(e.target.checked)}
                            />
                            <div className={`collapse-title text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                                Advanced Settings
                            </div>
                            <div className="collapse-content">
                                <div>
                                    <div className="form-control">
                                        <label className={`label ${isDarkTheme ? 'text-gray-300' : ''}`}>
                                            <span className="label-text text-sm font-medium">Query Access Type</span>
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="queryAccessType"
                                                    value="fastest"
                                                    className={`radio radio-sm ${isDarkTheme ? 'border-gray-500' : 'radio-primary'}`}
                                                />
                                                <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : ''}`}>Fastest</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="queryAccessType"
                                                    value="moderate"
                                                    className={`radio radio-sm ${isDarkTheme ? 'border-gray-500' : 'radio-primary'}`}
                                                />
                                                <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : ''}`}>Moderate</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="queryAccessType"
                                                    value="high_accuracy"
                                                    defaultChecked
                                                    className={`radio radio-sm ${isDarkTheme ? 'border-gray-500' : 'radio-primary'}`}
                                                />
                                                <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : ''}`}>High Accuracy</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                
                {/* Form Actions */}
                <div className={`sticky bottom-0 border-t p-4 flex justify-end gap-2 ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <button
                        type="button"
                        className={getButtonClassName()}
                        onClick={(e)=> {e.preventDefault();handleClose()}}
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
        </div>
    );
}

export default RagComponent;