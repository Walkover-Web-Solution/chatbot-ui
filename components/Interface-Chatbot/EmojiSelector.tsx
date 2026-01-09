'use client';
import { EmojiPicker } from 'frimousse';
import { useEffect, useRef } from 'react';

interface EmojiSelectorProps {
    isVisible: boolean;
    onEmojiSelect: (data: { emoji: string }) => void;
    onClose: () => void;
}

const EmojiSelector: React.FC<EmojiSelectorProps> = ({
    isVisible,
    onEmojiSelect,
    onClose,
}) => {
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const emojiSearchRef = useRef<HTMLInputElement>(null);

    // Handle clicking outside emoji picker to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            // Focus on search field when emoji picker opens
            setTimeout(() => {
                emojiSearchRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-[10000]">
            <EmojiPicker.Root onEmojiSelect={onEmojiSelect} className="isolate flex h-[368px] w-fit flex-col bg-base-100 dark:bg-slate-900 border-2 rounded-lg shadow-xl">
                <EmojiPicker.Search ref={emojiSearchRef} className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 dark:bg-slate-800 px-2.5 py-2 text-sm focus text-base-content dark:text-slate-100" />
                <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
                    <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                        Loading…
                    </EmojiPicker.Loading>
                    <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                        No emoji found.
                    </EmojiPicker.Empty>
                    <EmojiPicker.List
                        className="select-none pb-1.5"
                        components={{
                            CategoryHeader: ({ category, ...props }) => (
                                <div
                                    className="dark:text-slate-300 bg-base-100 dark:bg-slate-900 px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs"
                                    {...props}
                                >
                                    {category.label}
                                </div>
                            ),
                            Row: ({ children, ...props }) => (
                                <div className="scroll-my-1.5 px-1.5" {...props}>
                                    {children}
                                </div>
                            ),
                            Emoji: ({ emoji, ...props }) => (
                                <button
                                    className="flex size-10 items-center justify-center rounded-md text-2xl data-[active]:bg-neutral-100 dark:bg-slate-800"
                                    {...props}
                                >
                                    {emoji.emoji}
                                </button>
                            ),
                        }}
                    />
                </EmojiPicker.Viewport>
            </EmojiPicker.Root>
        </div>
    );
};

export default EmojiSelector;