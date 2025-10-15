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
import { ChevronDown, Paperclip, Send, Smile, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useChatActions, useSendMessage } from "../Chatbot/hooks/useChatActions";
import { useSendMessageToHello } from "../Chatbot/hooks/useHelloIntegration";
import CallButton from "./CallButton";
import EmojiSelector from "./EmojiSelector";
import { MessageContext } from "./InterfaceChatbot";
import ImageWithFallback from "./Messages/ImageWithFallback";
import { linkify } from "@/utils/utilities";
import { useColor } from "../Chatbot/hooks/useColor";

interface ChatbotTextFieldProps {
  className?: string;
  chatSessionId: string
  tabSessionId: string
  subThreadId: string;
  currentTeamId: string
  currentChannelId: string
  replyMessage?: any
  onClearReply?: () => void
}

const MAX_IMAGES = 4;
const ReplyPreview = ({ replyMessage, onClose }: { replyMessage: any, onClose: () => void }) => {
  const { textColor, backgroundColor } = useColor();
  if (!replyMessage) return null;
  return (
    <div
      className="border-l-4 px-3 pt-1 pb-3 mx-4 mb-2 rounded"
      style={{
        borderLeftColor: backgroundColor
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-medium mb-1"
            style={{ color: backgroundColor }}
          >
            Replying to {replyMessage.from_name || (replyMessage.role === 'user' ? 'You' : 'Bot')}
          </div>
          <div
            className="text-sm max-h-16 overflow-y-auto overflow-x-hidden whitespace-nowrap"
            style={{
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: linkify(replyMessage.content) }}
          />
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-gray-200 rounded flex-shrink-0"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>
    </div >
  );
};
const ChatbotTextField: React.FC<ChatbotTextFieldProps> = ({ className, chatSessionId, tabSessionId, subThreadId, currentTeamId = "", currentChannelId = "", replyMessage, onClearReply }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();
  const isLight = isColorLight(theme.palette.primary.main);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emitTypingStatus = useTypingStatus({ chatSessionId, tabSessionId });

  const { isHelloUser, mode, inbox_id, show_send_button, assigned_type } = useCustomSelector((state) => ({
    isHelloUser: state.draftData?.isHelloUser || false,
    mode: state.Hello?.[chatSessionId]?.mode || [],
    inbox_id: state.Hello?.[chatSessionId]?.widgetInfo?.inbox_id,
    show_send_button: typeof state.Hello?.[chatSessionId]?.helloConfig?.show_send_button === 'boolean' ? state.Hello?.[chatSessionId]?.helloConfig?.show_send_button : true,
    assigned_type: (() => {
      const foundType = state.Hello?.[chatSessionId]?.channelListData?.channels?.find((channel: any) => channel?.channel === currentChannelId)?.assigned_type;
      return foundType === undefined ? 'bot' : foundType;
    })(),
  }));

  const { messageRef } = useContext(MessageContext);
  const sendMessageToHello = useSendMessageToHello({ messageRef, replyMessage, onSuccess: onClearReply });

  const { setImages } = useChatActions();
  const sendMessage = useSendMessage({});

  const { images = [], options = [], loading } = useCustomSelector((state) => ({
    images: state.Chat.images || [],
    loading: state.Chat.loading,
    options: state.Chat.options || [],
  }))

  const buttonDisabled = useMemo(() => {
    if (isHelloUser) {
      return ((isHelloUser && (assigned_type !== 'bot' && assigned_type !== 'workflow')) ? false : loading) || isUploading || (!inputValue.trim() && images.length === 0)
    } else {
      return loading || isUploading || (!inputValue.trim() && images.length === 0) ||
        (images.some((imageUrl) => imageUrl?.toLowerCase()?.includes('.pdf')) && !inputValue.trim());
    }
  }, [loading, isUploading, inputValue, images, assigned_type, isHelloUser]);

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
      sendMessage(messageObj);
    }
  }, [isHelloUser, sendMessage, sendMessageToHello]);

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
    const totalImagesAfterUpload = filesArray.length + images.length;

    if (totalImagesAfterUpload > MAX_IMAGES) {
      errorToast(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesArray.map(async (file) => {
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
  }, [images, setImages, isHelloUser, inbox_id]);

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

  const optionButtons = useMemo(() => {
    if (!options || options.length === 0) return null;

    return (
      <div className="relative scrollbar-hide">
        <div className="flex overflow-x-auto sm:flex-wrap gap-2 p-2 animate-fadeIn whitespace-nowrap no-scrollbar overflow-hidden">
          {options.slice(0, 3).map((option, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage({ message: option })}
              className="flex-shrink-0 px-4 py-2 text-sm rounded-lg shadow-sm bg-white hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
            >
              {option}
            </button>
          ))}
        </div>
        {options.length > 1 && (
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/100 rounded-full p-1 shadow-md sm:hidden"
            onClick={scrollOptions}
          >
            <ChevronDown className="w-5 h-5" style={{ transform: 'rotate(-90deg)' }} />
          </button>
        )}
      </div>
    );
  }, [options, handleSendMessage, scrollOptions]);

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
  }), []);

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
      if (!mode?.includes("vision") && !mode?.includes("files")) return null;
    }

    return (
      <>
        <input
          type="file"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={handleImageUpload}
          className="hidden"
          id="upload-image"
          multiple
          ref={fileInputRef}
        />
        <label htmlFor="upload-image" className="cursor-pointer">
          <div className="flex px-2 py-1.5 w-8 h-8 items-center group">
            {isUploading ? (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                <span className="text-[10px] font-medium text-gray-600">Uploading...</span>
              </div>
            ) : (
              <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 text-gray-600" />
            )}
          </div>
        </label>
      </>
    );
  }, [mode, isUploading, handleImageUpload, subThreadId]);

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
    <div className="w-full">
      <ReplyPreview replyMessage={replyMessage} onClose={onClearReply || (() => { })} />

      <div className={`relative w-full shadow-sm ${className}`}>
        {optionButtons}
        {imagePreviewsSection}

        <div className="w-full h-full cursor-text relative" onClick={focusTextField}>
          <EmojiSelector
            isVisible={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            onClose={() => { setShowEmojiPicker(false); focusTextField(); }}
          />
          <div
            className="relative flex-col h-full items-center justify-between gap-2 p-2 bg-white rounded-xl border border-gray-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-0"
            style={{ outlineColor: theme.palette.primary.main }}
          >
            <TextField
              key={subThreadId || currentTeamId}
              inputRef={messageRef}
              onChange={handleInputChange}
              multiline
              fullWidth
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant..."
              className="h-full min-h-[10px] max-h-[400px] bg-transparent focus:outline-none disabled:cursor-not-allowed"
              maxRows={6}
              sx={textFieldStyles}
              autoFocus
              inputMode="text"
              type="text"
            />

            <div className="flex justify-between items-center w-full">
              {/* Left section: Upload, Emoji and AI icon */}
              <div className="flex items-center">
                {aiIconElement}
                <div
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowEmojiPicker(!showEmojiPicker) }}
                  className="group flex items-center justify-center w-8 h-8 cursor-pointer"
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 text-gray-600" />
                </div>
                {uploadButton}
              </div>

              {/* Right section: Call + Send button side by side */}
              <div className="flex items-center gap-2">
                <CallButton />
                {show_send_button && (
                  <button
                    onClick={() => !buttonDisabled && handleSendMessage()}
                    className="rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200"
                    disabled={buttonDisabled}
                    style={{
                      backgroundColor: buttonDisabled ? '#d1d5db' : theme.palette.primary.main
                    }}
                    aria-label="Send message"
                  >
                    <Send className={`w-3 h-3 md:w-4 md:h-4 ${isLight ? 'text-black' : 'text-white'}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(addUrlDataHoc(ChatbotTextField, [ParamsEnums.subThreadId, ParamsEnums.currentTeamId, ParamsEnums.currentChannelId]));
