// components/Hello/CallTextField.tsx
import React, { useRef, useState } from 'react';
import { TextField } from '@mui/material';
import { Paperclip, Send, X } from 'lucide-react';
import { uploadAttachmentToHello } from '@/config/helloApi';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { errorToast } from '@/components/customToast';
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { useChatActions } from '../Chatbot/hooks/useChatActions';
import helloVoiceService from '../Chatbot/hooks/HelloVoiceService';
import ImageWithFallback from "../Interface-Chatbot/Messages/ImageWithFallback";

const CallTextField: React.FC<{ chatSessionId: string }> = ({ chatSessionId }) => {
    const [inputValue, setInputValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<Array<{ type: 'image'; content: string }>>([]);
    const { inbox_id } = useCustomSelector((state) => ({
        inbox_id: state.Hello?.[chatSessionId]?.widgetInfo?.inbox_id,
    }));
    const { addCallVoiceEntry } = useChatActions();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleFileClick = () => fileInputRef.current?.click();
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await uploadAttachmentToHello(file, inbox_id);
            if (!response) {
                errorToast("Failed to upload images. Please try again.");
                return;
            }
            const url = response?.data?.[0].path;
            if (url) {
                setImages(prev => [...prev, { type: 'image', content: url }]);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            errorToast("Failed to upload images. Please try again.");
        } finally {
            e.target.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    const handleSend = () => {
        const finalPayload = [];
        if (images.length > 0) {
            finalPayload.push(...images);
        }

        if (inputValue.trim()) {
            finalPayload.push({ type: 'text' as const, content: inputValue.trim() });
        }

        const state = helloVoiceService.getCallState();
        if ((state === 'connected' || state === 'rejoined') && finalPayload.length > 0) {
            const response = helloVoiceService.sendMessageOnCall(finalPayload, false);
            if (response) {
                addCallVoiceEntry({
                    from: 'user',
                    messages: finalPayload
                });
                setInputValue('');
                setImages([]);
            }
        }
    };
    const renderImagePreviews = () => {
        if (images.length === 0) return null;

        return (
            <div className="flex flex-wrap gap-3 mb-4 px-6">
                {images.map((imageItem, index) => (
                    <div key={index} className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                            <ImageWithFallback
                                src={imageItem.content}
                                alt={`Uploaded Preview ${index + 1}`}
                                style={{ width: 128, height: 128, borderRadius: '8px' }}
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
    };

    return (
        <div className='max-w-4xl w-full mx-auto'>
            {renderImagePreviews()}
            <div className="px-6 pb-4">
                <div className="flex items-center gap-3">
                    {/* Upload */}
                    <div className="flex flex-col">
                        <input
                            ref={fileInputRef}
                            id="call-tf-upload"
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*,video/*,audio/*,application/pdf"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={handleFileClick}
                            className="rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                            aria-label="Upload"
                        >
                            <div className="flex px-2 py-1.5 w-8 h-8 items-center justify-center group">
                                <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 text-white" />
                            </div>
                        </button>
                    </div>

                    {/* Input */}
                    <div className="flex-1">
                        <TextField
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message.."
                            fullWidth
                            multiline
                            maxRows={6}
                            type="text"
                            inputMode="text"
                            inputProps={{ 'aria-label': 'Call message input', maxLength: 2000 }}
                            sx={{
                                '& fieldset': { border: 'none' },
                                '& .MuiOutlinedInput-root': {
                                    padding: '8px 12px',
                                    minHeight: '40px',
                                },
                                '& .MuiInputBase-input': {
                                    padding: '0',
                                    lineHeight: '1.4',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    resize: 'none'
                                },
                                '& .MuiInputBase-root': {
                                    alignItems: 'flex-start'
                                }
                            }}
                            className="bg-white/80 backdrop-blur-sm rounded-lg"
                        />
                    </div>

                    {/* Send */}
                    <button
                        type="button"
                        onClick={handleSend}
                        className="rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                        aria-label="Send"
                    >
                        <div className="flex px-2 py-1.5 w-8 h-8 items-center justify-center group">
                            <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 text-white" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(addUrlDataHoc(CallTextField));