'use client';
import { AiIcon } from "@/assests/assestsIndex";
import { errorToast } from "@/components/customToast";
import { uploadImage } from "@/config/api";
import { uploadAttachmentToHello } from "@/config/helloApi";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { useTypingStatus } from "@/hooks/socketEventEmitter";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ParamsEnums } from "@/utils/enums";
import { isColorLight } from "@/utils/themeUtility";
import { TextField, useTheme } from "@mui/material";
import debounce from "lodash.debounce";
import { ChevronDown, ChevronUp, Loader2, Paperclip, Send, Smile, X, Zap, BrainCircuit } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useChatActions, useSendMessage } from "../Chatbot/hooks/useChatActions";
import { useSendMessageToHello } from "../Chatbot/hooks/useHelloIntegration";
import CallButton from "./CallButton";
import EmojiSelector from "./EmojiSelector";
import { MessageContext } from "./InterfaceChatbot";
import ImageWithFallback from "./Messages/ImageWithFallback";

interface ChatbotTextFieldProps {
  className?: string;
  chatSessionId: string
  tabSessionId: string
  subThreadId: string;
  currentTeamId: string
  currentChannelId: string
}

const MAX_IMAGES = 4;
const MAX_UPLOAD_SIZE_MB = 10;

const ChatbotTextField: React.FC<ChatbotTextFieldProps> = ({ className, chatSessionId, tabSessionId, subThreadId, currentTeamId = "", currentChannelId = "" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversationMode, setConversationMode] = useState<"planning" | "fast">(() => {
    const saved = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("conversationMode") : null;
    return (saved === "planning" || saved === "fast") ? saved : "fast";
  });
  const [showModeMenu, setShowModeMenu] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isLight = isColorLight(theme.palette.primary.main);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emitTypingStatus = useTypingStatus({ chatSessionId, tabSessionId });

  const { isHelloUser, mode, inbox_id, show_send_button, assigned_type, isStream, showModeDropdown } = useCustomSelector((state) => ({
    isHelloUser: state.draftData?.isHelloUser || false,
    mode: state.Hello?.[chatSessionId]?.mode || [],
    inbox_id: state.Hello?.[chatSessionId]?.widgetInfo?.inbox_id,
    show_send_button: typeof state.Hello?.[chatSessionId]?.helloConfig?.show_send_button === 'boolean' ? state.Hello?.[chatSessionId]?.helloConfig?.show_send_button : true,
    assigned_type: state.Hello?.[chatSessionId]?.channelListData?.channels?.find(
      (channel: any) => channel?.channel === currentChannelId
    )?.assigned_type || '',
    isStream: (state.Hello?.[chatSessionId]?.mode || []).includes('stream'),
    showModeDropdown: state.appInfo?.[tabSessionId]?.mode === true,
  }));

  const canUploadImages = useMemo(() => (isHelloUser ? true : mode?.includes("vision")), [isHelloUser, mode]);
  const canUploadFiles = useMemo(() => (isHelloUser ? true : mode?.includes("files")), [isHelloUser, mode]);
  const fileInputAccept = useMemo(() => {
    if (canUploadImages && canUploadFiles) return "image/*,application/pdf";
    if (canUploadImages) return "image/*";
    if (canUploadFiles) return "application/pdf";
    return "";
  }, [canUploadImages, canUploadFiles]);

  const { messageRef } = useContext(MessageContext);
  const sendMessageToHello = useSendMessageToHello({ messageRef });

  const { setImages } = useChatActions();
  const sendMessage = useSendMessage({});

  const { images = [], options = [], loading, isPlanExecuting, isReviewActive } = useCustomSelector((state) => {
    const subThreadId = state.appInfo?.[tabSessionId]?.subThreadId;
    const lastMessageId = subThreadId ? state.Chat?.messageIds?.[subThreadId]?.[0] : null;
    const planningExecState = lastMessageId ? state.Chat?.msgIdAndDataMap?.[subThreadId]?.[lastMessageId]?.planning?.execution?.state : null;
    const reviewPhases = lastMessageId ? state.Chat?.msgIdAndDataMap?.[subThreadId]?.[lastMessageId]?.review_phases : null;
    return {
      images: state.Chat.images || [],
      loading: state.Chat.loading,
      options: state.Chat.options || [],
      isPlanExecuting: planningExecState === "executing" || planningExecState === "running" || planningExecState === "queued",
      isReviewActive: Array.isArray(reviewPhases) && reviewPhases.length > 0 && reviewPhases[reviewPhases.length - 1]?.isStreaming === true,
    };
  })

  const buttonDisabled = useMemo(() => {
    if (isHelloUser) {
      return ((isHelloUser && (assigned_type !== 'bot' && assigned_type !== 'workflow')) ? false : loading) || isUploading || (!inputValue.trim() && images.length === 0)
    } else {
      return isPlanExecuting || loading || isUploading || (!inputValue.trim() && images.length === 0) ||
        (images.some((imageUrl) => imageUrl?.toLowerCase()?.includes('.pdf')) && !inputValue.trim());
    }
  }, [loading, isUploading, inputValue, images, assigned_type, isHelloUser, isPlanExecuting]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !buttonDisabled) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = useCallback((messageObj: { message?: string } = {}) => {
    setInputValue('');
    if (isHelloUser) {
      sendMessageToHello?.();
      emitTypingStatus("not-typing");
    } else {
      const planningPayload = (showModeDropdown && isStream && conversationMode === "planning") ? { mode: "plan" } : {};
      sendMessage({ ...messageObj, ...planningPayload });
    }
  }, [isHelloUser, sendMessage, sendMessageToHello, conversationMode, showModeDropdown, isStream]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false);
      }
    };
    if (showModeMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModeMenu]);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event?.data?.type === "open") {
      messageRef?.current?.focus();
    }
  }, [messageRef]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const tooLargeFiles = filesArray.filter((file) => file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024);
    if (tooLargeFiles.length > 0) {
      errorToast(`Each file should be less than ${MAX_UPLOAD_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    const blockedMediaFiles = filesArray.filter((file) => file.type.startsWith("video/") || file.type.startsWith("audio/"));
    if (blockedMediaFiles.length > 0) {
      errorToast("Video and audio uploads are not supported for chatbot.");
      event.target.value = '';
      return;
    }

    const allowedFiles = filesArray.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      if (isImage) return canUploadImages;
      if (isPdf) return canUploadFiles;
      return false;
    });

    if (allowedFiles.length === 0) {
      if (canUploadImages && !canUploadFiles) {
        errorToast("Only image uploads are allowed for this chatbot.");
      } else if (!canUploadImages && canUploadFiles) {
        errorToast("Only PDF uploads are allowed for this chatbot.");
      } else {
        errorToast("File uploads are not enabled for this chatbot.");
      }
      event.target.value = '';
      return;
    }

    if (allowedFiles.length !== filesArray.length) {
      errorToast("Some files were skipped because they are not allowed by this chatbot mode.");
    }

    const newImageFiles = allowedFiles.filter((file) => file.type.startsWith("image/"));
    const existingImageCount = images.filter((imageUrl) => !imageUrl?.toLowerCase()?.includes('.pdf')).length;
    const totalImagesAfterUpload = existingImageCount + newImageFiles.length;

    if (totalImagesAfterUpload > MAX_IMAGES) {
      errorToast(`You can only upload up to ${MAX_IMAGES} images.`);
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = allowedFiles.map(async (file) => {
        if (isHelloUser) {
          const response = await uploadAttachmentToHello(file, inbox_id);
          if (!response) {
            errorToast("Failed to upload images. Please try again.");
            return null;
          }
          return response?.data?.[0];
        } else {
          const formData = new FormData();
          formData.append("image", file);
          const response = await uploadImage({ formData });
          return response.success ? response.image_url : null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      errorToast("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [images, setImages, isHelloUser, inbox_id, canUploadImages, canUploadFiles]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images, setImages]);

  const focusTextField = useCallback(() => {
    setTimeout(() => {
      messageRef?.current?.focus();
    }, 0);
  }, [messageRef]);

  const scrollOptions = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' });
    }
  }, []);

  const debouncedStopTyping = useMemo(
    () => debounce(() => emitTypingStatus("not-typing"), 2000),
    [emitTypingStatus]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (messageRef.current) {
      messageRef.current.value = value;
    }
    setInputValue(value);

    if (isHelloUser) {
      if (value.trim()) {
        emitTypingStatus("typing");
        debouncedStopTyping();
      } else {
        emitTypingStatus("not-typing");
        debouncedStopTyping.cancel();
      }
    }
  }, [messageRef, isHelloUser, emitTypingStatus, debouncedStopTyping]);

  useEffect(() => {
    return () => {
      debouncedStopTyping.cancel();
    };
  }, [debouncedStopTyping]);

  const suggestionButtonStyles = useMemo(() => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
    color: theme.palette.text.primary,
    borderColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e5e7eb',
  }), [theme]);

  const suggestionScrollButtonStyles = useMemo(() => ({
    backgroundColor: theme.palette.mode === 'dark' ? `${theme.palette.background.paper}cc` : 'rgba(255,255,255,0.8)',
    color: theme.palette.text.primary,
  }), [theme]);

  const optionButtons = useMemo(() => {
    if (!options || options.length === 0) return null;

    return (
      <div className="relative">
        <div className="flex overflow-x-auto sm:flex-wrap gap-2 p-2 animate-fadeIn whitespace-nowrap overflow-hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Scrollbar-hiding styles for WebKit browsers */}
          <style>{`
            ::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {options.slice(0, 3).map((option, index) => (
            <button
              key={index}
              data-testid={`chatbot-suggestion-option-${index}`}
              onClick={() => handleSendMessage({ message: option })}
              className="flex-shrink-0 px-4 py-2 text-sm rounded-lg shadow-sm border transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#242424]"
              style={suggestionButtonStyles}
            >
              {option}
            </button>
          ))}
        </div>
        {options.length > 1 && (
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-1 shadow-md sm:hidden transition-colors duration-200 hover:bg-gray-200/80 dark:hover:bg-[#242424]/80"
            style={suggestionScrollButtonStyles}
            onClick={scrollOptions}
          >
            <ChevronDown
              className="w-5 h-5"
              style={{ transform: 'rotate(-90deg)', color: suggestionScrollButtonStyles.color }}
            />
          </button>
        )}
      </div>
    );
  }, [options, handleSendMessage, scrollOptions, suggestionButtonStyles, suggestionScrollButtonStyles]);

  const imagePreviewsSection = useMemo(() => {
    if (images.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 my-4 px-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
              <ImageWithFallback
                src={isHelloUser ? image?.path : image}
                alt={`Uploaded Preview ${index + 1}`}
                style={{ width: 128, height: 128 }}
                canDownload={false}
                preview={true}
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              data-testid={`chatbot-remove-image-${index}`}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  }, [images, isHelloUser, handleRemoveImage]);

  const textFieldStyles = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      padding: '4px 8px',
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
      color: theme.palette.text.primary,
    },
    '& .MuiOutlinedInput-input': {
      color: theme.palette.text.primary,
    },
    '& .MuiOutlinedInput-input::placeholder': {
      color: theme.palette.text.primary,
      opacity: 0.6,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  }), [theme]);

  const containerStyles = useMemo(() => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
    borderColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e5e7eb',
    outlineColor: theme.palette.primary.main,
  }), [theme]);

  const aiIconElement = useMemo(() => {
    if (isHelloUser) return null;

    return (
      <div className="relative w-6 h-6 z-[2] ml-1">
        <Image
          src={AiIcon}
          // width={28}
          // height={28}
          alt="AI"
          className={`absolute transition-opacity duration-200 filter drop-shadow-pink`}
        />
      </div>
    );
  }, [isHelloUser]);

  const uploadButton = useMemo(() => {
    if (isHelloUser) {
      if (!subThreadId) return null;
    } else {
      if (!canUploadImages && !canUploadFiles) return null;
    }

    return (
      <>
        <input
          type="file"
          accept={fileInputAccept}
          onChange={handleImageUpload}
          className="hidden"
          id="upload-image"
          data-testid="chatbot-file-upload-input"
          multiple
          ref={fileInputRef}
        />
        <label htmlFor="upload-image" className="cursor-pointer" data-testid="chatbot-file-upload-label">
          <div className="flex px-2 py-1.5 w-8 h-8 items-center group">
            {isUploading ? (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                <span className="text-[10px] font-medium text-gray-600 dark:text-slate-300">Uploading...</span>
              </div>
            ) : (
              <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 text-gray-600 dark:text-slate-300" />
            )}
          </div>
        </label>
      </>
    );
  }, [isHelloUser, subThreadId, canUploadImages, canUploadFiles, fileInputAccept, isUploading, handleImageUpload]);

  const handleEmojiSelect = (data: { emoji: string }) => {
    if (messageRef?.current) {
      const currentValue = messageRef.current.value || '';
      const start = messageRef.current?.selectionStart || 0;
      const end = messageRef.current?.selectionEnd || 0;
      const newValue = currentValue?.substring(0, start) + (data?.emoji || '') + currentValue?.substring(end);
      messageRef.current.value = newValue;
      setInputValue(newValue);
      // Set the cursor position right after the inserted emoji
      messageRef.current?.setSelectionRange(start + (data?.emoji || '')?.length, start + (data?.emoji || '')?.length);
      // Trigger onChange event to sync with any other handlers
      const event = new Event('input', { bubbles: true });
      messageRef.current?.dispatchEvent(event);
    }
    setShowEmojiPicker(false);
    // Focus back on the input field
    setTimeout(() => {
      focusTextField();
    }, 50);
  }

  return (
    <div className={`relative w-full shadow-sm ${className}`} data-testid="chatbot-text-field">
      {optionButtons}
      {imagePreviewsSection}


      <div className="w-full h-full cursor-text relative" onClick={focusTextField}>
        <EmojiSelector
          isVisible={showEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          onClose={() => { setShowEmojiPicker(false); focusTextField(); }}
        />
        <div
          className="relative flex-col h-full items-center justify-between gap-2 p-2 rounded-xl border focus-within:outline focus-within:outline-2 focus-within:outline-offset-0"
          style={containerStyles}
          data-testid="chatbot-input-container"
        >
          <TextField
            key={subThreadId || currentTeamId}
            inputRef={messageRef}
            onChange={handleInputChange}
            multiline
            fullWidth
            onKeyDown={handleKeyDown}
            placeholder={isPlanExecuting ? "Plan is executing..." : "Message AI Assistant..."}
            disabled={isPlanExecuting}
            className="h-full min-h-[10px] max-h-[400px] bg-transparent focus:outline-none disabled:cursor-not-allowed"
            maxRows={6}
            sx={textFieldStyles}
            autoFocus
            inputMode="text"
            type="text"
            inputProps={{ 'data-testid': 'chatbot-message-input' }}
          />

          <div className="flex justify-between items-center w-full">
            {/* Left section: Upload, Emoji, mode picker */}
            <div className="flex items-center gap-1">
              {/* {aiIconElement} */}
              <div
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowEmojiPicker(!showEmojiPicker) }}
                className="group flex items-center justify-center w-8 h-8 cursor-pointer"
                aria-label="Add emoji"
                data-testid="chatbot-emoji-button"
              >
                <Smile className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 text-gray-600 dark:text-slate-300" />
              </div>
              {uploadButton}

              {!isHelloUser && isStream && showModeDropdown && (
                <div className="relative" ref={modeMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowModeMenu((v) => !v); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors hover:bg-base-200/60 text-gray-500 dark:text-slate-400"
                  >
                    {conversationMode === "planning"
                      ? <BrainCircuit className="w-3.5 h-3.5" />
                      : <Zap className="w-3.5 h-3.5" />}
                    <span>{conversationMode === "planning" ? "Planning" : "Fast"}</span>
                    {showModeMenu ? <ChevronUp className="w-3 h-3 opacity-60" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
                  </button>

                  {showModeMenu && (
                    <div
                      className="absolute bottom-full mb-2 left-0 z-50 w-64 rounded-xl border border-base-300 shadow-xl overflow-hidden"
                      style={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff' }}
                    >
                      <div className="px-3 py-2 border-b border-base-300">
                        <p className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Conversation mode</p>
                      </div>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2.5 transition-colors ${
                          conversationMode === "planning"
                            ? "bg-base-200/70"
                            : "hover:bg-base-200/40"
                        }`}
                        onClick={() => { setConversationMode("planning"); sessionStorage.setItem("conversationMode", "planning"); setShowModeMenu(false); }}
                      >
                        <p className="text-sm font-semibold" style={{ color: theme.palette.text.primary }}>Planning</p>
                        <p className="text-[11px] opacity-50 mt-0.5 leading-snug">Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work</p>
                      </button>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2.5 transition-colors ${
                          conversationMode === "fast"
                            ? "bg-base-200/70"
                            : "hover:bg-base-200/40"
                        }`}
                        onClick={() => { setConversationMode("fast"); sessionStorage.setItem("conversationMode", "fast"); setShowModeMenu(false); }}
                      >
                        <p className="text-sm font-semibold" style={{ color: theme.palette.text.primary }}>Fast</p>
                        <p className="text-[11px] opacity-50 mt-0.5 leading-snug">Agent will execute tasks directly. Use for simple tasks that can be completed faster</p>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right section: under-review indicator + Call + Send button side by side */}
            <div className="flex items-center gap-2">
              {isReviewActive && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border" style={{ background: "oklch(var(--p) / 0.06)", borderColor: "oklch(var(--p) / 0.2)" }}>
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" style={{ color: "oklch(var(--p) / 0.7)" }} />
                  <span className="text-[10px] font-medium" style={{ color: "oklch(var(--p) / 0.7)" }}>Under review…</span>
                </div>
              )}
              <CallButton />
              {show_send_button && (
                <button
                  onClick={() => !buttonDisabled && handleSendMessage()}
                  data-testid="chatbot-send-button"
                  className="rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200"
                  disabled={buttonDisabled}
                  style={{
                    backgroundColor: buttonDisabled ? '#d1d5db' : theme.palette.primary.main
                  }}
                  aria-label="Send message"
                >
                  <Send className={`w-3 h-3 md:w-4 md:h-4 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default React.memo(addUrlDataHoc(ChatbotTextField, [ParamsEnums.subThreadId, ParamsEnums.currentTeamId, ParamsEnums.currentChannelId]));
