'use client';

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ChevronDown, ChevronUp, Send, Upload, X } from "lucide-react";
import { Popover, TextField, useTheme } from "@mui/material";
import { AiIcon, UserAssistant } from "@/assests/assestsIndex";
import { errorToast } from "@/components/customToast";
import { setHuman } from "@/store/hello/helloSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { isColorLight } from "@/utils/themeUtility";
import { uploadImage } from "@/config/api";
import { MessageContext } from "./InterfaceChatbot";
import Image from "next/image";
import { SendMessagePayloadType } from "../Chatbot/hooks/chatTypes";

interface ChatbotTextFieldType {
  onSend?: (data: SendMessagePayloadType) => void;
  loading?: boolean;
  messageRef?: any;
  disabled?: boolean;
  options?: any[];
  setChatsLoading?: any;
  images?: String[];
  setImages?: React.Dispatch<React.SetStateAction<string[]>>;
}

function ChatbotTextField({
  onSend = () => { },
  loading,
  messageRef,
  disabled = false,
  options = [],
  setChatsLoading = () => { },
  images = [],
  setImages = () => { },
}: ChatbotTextFieldType) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isLight = isColorLight(theme.palette.primary.main);
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);

  const { IsHuman, mode } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman,
    mode: state.Hello?.mode || [],
  }));

  const isHelloAssistantEnabled = mode?.length > 0 && mode?.includes("human");
  const reduxIsVision = useCustomSelector(
    (state: $ReduxCoreType) => state.Interface?.isVision || ""
  );
  const { sendMessage } = useContext(MessageContext);


  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !loading && !isUploading) {
      event.preventDefault();
      onSend({ message, images: images });
    }
  };

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event?.data?.type === "open") {
      messageRef?.current?.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const EnableHumanAgent = async () => {
    setChatsLoading(true);
    dispatch(setHuman({}));
    setChatsLoading(false);
  };

  const EnableAI = async () => {
    setChatsLoading(true);
    dispatch(setHuman({ isHuman: false }));
    setChatsLoading(false);
  };

  const color = theme.palette.primary.main;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setIsUploading(true);
      try {
        for (const file of filesArray) {
          if (images.length > 4) {
            errorToast.warn("You have uploaded more than 4 images.");
          }
          const formData = new FormData();
          formData.append("image", file);
          const response = await uploadImage({ formData });
          if (response.success) {
            setImages((prev) => [...prev, response.image_url]);
          }
        }
        if (filesArray.length > 4) {
          errorToast.warn("You have uploaded more than 4 images.");
        }
      } catch (error) {
        console.error("Error uploading images:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const focusTextField = () => {
    if (messageRef.current) {
      messageRef.current.focus();
    }
  };

  return (
    <div className="relative w-full rounded-lg shadow-sm ">
      {options && options.length > 0 && (
        <div className="relative scrollbar-hide">
          <div className="flex overflow-x-auto sm:flex-wrap gap-2 p-2 animate-fadeIn whitespace-nowrap no-scrollbar overflow-hidden">
            {options?.slice(0, 3).map((option, index) => (
              <button
                key={index}
                onClick={() => sendMessage({ message: option })}
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
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                <Image
                  src={image as string}
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
          ))}
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
              <div className=" z-[2]">
                <div
                  className="relative w-7 h-7 cursor-pointer"
                  onClick={isHelloAssistantEnabled ? () => handlePopoverOpen : undefined}
                >
                  <Image
                    src={IsHuman ? UserAssistant : AiIcon}
                    width={28}
                    height={28}
                    alt="AI"
                    className={`absolute transition-opacity duration-200 ${!IsHuman ? 'filter drop-shadow-pink' : ''}`}
                  />
                  {isHelloAssistantEnabled && (
                    <ChevronUp className="absolute w-7 h-7 opacity-0 hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
              {((reduxIsVision?.vision && mode?.includes("human")) ||
                (reduxIsVision?.vision && !mode?.includes("human"))) && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload-image"
                      multiple
                    />
                    <label htmlFor="upload-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-100 transition-all duration-200 group">
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-xs font-medium text-gray-600">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-xs font-medium text-gray-700">Upload Image</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </>
                )}
            </div>

            <button
              onClick={() => !loading && !isUploading ? onSend({ Message: message, images: images }) : null}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200"
              disabled={loading || isUploading || !message.trim()}
              style={{
                backgroundColor: (loading || isUploading || !message.trim()) ? '#d1d5db' : theme.palette.primary.main
              }}
            >
              <Send className={`w-3 h-3 md:w-4 md:h-4 ${isLight ? 'text-black' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>

      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        className="mt-2"
      >
        <div className="flex flex-col p-2 min-w-[200px] md:min-w-[180px] rounded-lg shadow-lg">
          <button
            onClick={() => {
              EnableAI();
              handlePopoverClose();
            }}
            className="btn btn-ghost justify-start normal-case md:btn-sm hover:bg-gray-100"
          >
            <Image
              src={AiIcon}
              width={30}
              height={30}
              alt="AI Icon"
              className="mr-3 filter drop-shadow-pink md:w-6 md:h-6"
            />
            <span>AI</span>
          </button>

          <button
            onClick={() => {
              EnableHumanAgent();
              handlePopoverClose();
            }}
            className="btn btn-ghost justify-start normal-case md:btn-sm hover:bg-gray-100"
          >
            <Image
              src={UserAssistant}
              width={30}
              height={30}
              alt="Human Agent"
              className="mr-3 md:w-6 md:h-6"
            />
            <span>Human Agent</span>
          </button>
        </div>
      </Popover>
    </div>
  );
}

export default ChatbotTextField;
