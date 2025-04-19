'use client';

import { AiIcon, UserAssistant } from "@/assests/assestsIndex";
import { errorToast } from "@/components/customToast";
import { uploadImage } from "@/config/api";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { isColorLight } from "@/utils/themeUtility";
import { TextField, useTheme } from "@mui/material";
import { ChevronDown, Send, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MessageContext } from "./InterfaceChatbot";
import { uploadAttachmentToHello } from "@/config/helloApi";

interface ChatbotTextFieldProps {
  className?: string;
}

const MAX_IMAGES = 4;

const ChatbotTextField: React.FC<ChatbotTextFieldProps> = ({ className }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const isLight = isColorLight(theme.palette.primary.main);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { IsHuman, mode, inbox_id } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman,
    mode: state.Hello?.mode || [],
    inbox_id: state.Hello?.widgetInfo?.inbox_id,
  }));

  const reduxIsVision = useCustomSelector(
    (state: $ReduxCoreType) => state.Interface?.isVision || ""
  );

  const {
    sendMessage,
    sendMessageToHello,
    loading,
    messageRef,
    disabled,
    options,
    images,
    setImages,
    isTyping
  } = useContext(MessageContext);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !loading && !isUploading) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = (messageObj: { message?: string } = {}) => {
    IsHuman ? sendMessageToHello?.() : sendMessage(messageObj);
  }

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
    if (!event.target.files) return;

    const filesArray = Array.from(event.target.files);
    if (filesArray.length + images.length > MAX_IMAGES) {
      errorToast(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = filesArray.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        if (IsHuman) {
          const response = await uploadAttachmentToHello(file, inbox_id);
          return response?.data?.[0]
        }
        else {
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
  }, [images, setImages]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }, [images, setImages]);

  const focusTextField = useCallback(() => {
    messageRef?.current?.focus();
  }, [messageRef]);

  const isVisionEnabled = useMemo(() =>
    (reduxIsVision?.vision || mode?.includes("vision")) || IsHuman,
    [reduxIsVision, mode, IsHuman]
  );

  const buttonDisabled = useMemo(() =>
    loading || isUploading || (!message?.trim() && images?.length === 0),
    [loading, isUploading, message, images]
  );

  return (
    <div className={`relative w-full rounded-lg shadow-sm ${className}`}>
      {options && options.length > 0 && (
        <div className="relative scrollbar-hide">
          <div className="flex overflow-x-auto sm:flex-wrap gap-2 p-2 animate-fadeIn whitespace-nowrap no-scrollbar overflow-hidden">
            {options?.slice(0, 3).map((option, index) => (
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
              onClick={(e) => {
                e.stopPropagation();
                const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                if (container) {
                  container.scrollBy({ left: 150, behavior: 'smooth' });
                }
              }}
            >
              <ChevronDown className="w-5 h-5" style={{ transform: 'rotate(-90deg)' }} />
            </button>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 my-4 px-4">
          {images.map((image, index) => {
            return (
              <div key={index} className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                  <Image
                    src={IsHuman ? image?.path : image}
                    alt={`Uploaded Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={128}
                    height={128}
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
            )
          })}
        </div>
      )}


      <div className="w-full h-full cursor-text" onClick={focusTextField}>
        <div
          className="relative flex-col h-full items-center justify-between gap-2 p-2 bg-white rounded-xl border border-gray-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-0"
          style={{ outlineColor: theme.palette.primary.main }}
        >
          <TextField
            inputRef={messageRef}
            onChange={(e) => {
              setMessage(e.target.value);
              if (messageRef.current) {
                messageRef.current.value = e.target.value;
              }
            }}
            multiline
            fullWidth
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant..."
            disabled={disabled}
            className="p-1 h-full min-h-[40px] max-h-[400px] bg-transparent focus:outline-none disabled:cursor-not-allowed"
            maxRows={6}
            sx={{
              '& .MuiOutlinedInput-root': {
                padding: '8px',
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
            }}
          />

          <div className="flex flex-row justify-between gap-2 h-full self-end mr-2">
            <div className="flex items-center gap-2">
              {!IsHuman && <div className="relative w-7 h-7 z-[2]">
                <Image
                  src={IsHuman ? UserAssistant : AiIcon}
                  width={28}
                  height={28}
                  alt="AI"
                  className={`absolute transition-opacity duration-200 ${!IsHuman ? 'filter drop-shadow-pink' : ''}`}
                />
              </div>}
              {isVisionEnabled && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="upload-image"
                    multiple
                    ref={fileInputRef}
                  />
                  <label htmlFor="upload-image" className="cursor-pointer">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-100 transition-all duration-200 group">
                      {isUploading ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-[10px] font-medium text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-[10px] font-medium text-gray-700">Upload Img</span>
                        </div>
                      )}
                    </div>
                  </label>
                </>
              )}
              {IsHuman && isTyping && (
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-800 mr-2">Agent is typing</span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => !buttonDisabled && handleSendMessage()}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200"
              disabled={buttonDisabled}
              style={{
                backgroundColor: buttonDisabled ? '#d1d5db' : theme.palette.primary.main
              }}
            >
              <Send className={`w-3 h-3 md:w-4 md:h-4 ${isLight ? 'text-black' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatbotTextField);