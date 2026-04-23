/* eslint-disable */
import { supportsLookbehind } from "@/utils/appUtility";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "lucide-react";

interface ReasoningAccordionProps {
    reasoning: string;
    isStreaming?: boolean;
    hasContent?: boolean;
    label?: string;
    defaultOpen?: boolean;
}

export default function ReasoningAccordion({ reasoning, isStreaming, hasContent, label, defaultOpen }: ReasoningAccordionProps) {
    const [expanded, setExpanded] = useState(defaultOpen ?? false);
    const [animateIn, setAnimateIn] = useState(defaultOpen ?? false);
    const contentRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const manuallyClosedRef = useRef(false);

    const handleScroll = () => {
        const el = contentRef.current;
        if (!el) return;
        isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 60;
    };

    const openCard = (isAuto = false) => {
        if (isAuto) manuallyClosedRef.current = false;
        setExpanded(true);
        // animateIn is set in useLayoutEffect after mount
    };

    const closeCard = (isManual = false) => {
        if (isManual) manuallyClosedRef.current = true;
        setAnimateIn(false);
        setTimeout(() => setExpanded(false), 200);
    };

    // After card mounts (expanded=true), trigger the open animation
    useLayoutEffect(() => {
        if (expanded) {
            requestAnimationFrame(() => setAnimateIn(true));
        }
    }, [expanded]);

    // Auto-scroll as reasoning streams in
    useEffect(() => {
        if (!animateIn) return;
        if (isAtBottomRef.current && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [reasoning, animateIn]);

    // Auto-open when streaming starts (unless user manually closed)
    useEffect(() => {
        if (isStreaming && reasoning && !manuallyClosedRef.current && !expanded) {
            openCard(true);
        }
    }, [isStreaming, reasoning]);

    // Auto-close when streaming ends and content arrives
    useEffect(() => {
        if (!isStreaming && hasContent) closeCard();
    }, [isStreaming, hasContent]);

    if (!reasoning) return null;

    const title = label ?? "Reasoning";
    const chipLabel = isStreaming ? "Thinking…" : title;

    return (
        <div className="mb-2" data-testid="chatbot-interface-reasoning-accordion">
            {/* Collapsed pill */}
            {!expanded && (
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => openCard()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-200/80 dark:bg-base-700/60 border border-base-300/60 dark:border-base-600/40 hover:bg-base-200 dark:hover:bg-base-700 transition-colors cursor-pointer"
                    >
                        {isStreaming ? (
                            <span className="w-2 h-2 rounded-full bg-base-content/40 animate-pulse shrink-0" />
                        ) : (
                            <span className="w-2 h-2 rounded-full border border-base-content/30 shrink-0" />
                        )}
                        <span className="text-xs text-base-content/60 font-medium">{chipLabel}</span>
                    </button>
                    {!isStreaming && (
                        <button
                            type="button"
                            onClick={() => openCard()}
                            className="text-xs text-base-content/50 hover:text-base-content/80 transition-colors font-medium"
                        >
                            Show
                        </button>
                    )}
                </div>
            )}

            {/* Expanded card */}
            {expanded && (
                <div
                    className="rounded-2xl border border-base-200 dark:border-base-700 bg-base-50 dark:bg-base-800/60 shadow-sm overflow-hidden"
                    style={{
                        opacity: animateIn ? 1 : 0,
                        transform: animateIn ? "translateY(0)" : "translateY(-6px)",
                        transition: "opacity 180ms ease-out, transform 180ms ease-out",
                    }}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 dark:border-base-700">
                        <span className="text-sm font-semibold text-base-content/80">{title}</span>
                        <button
                            type="button"
                            onClick={() => closeCard(true)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-base-content/40 hover:text-base-content/70 hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div
                        ref={contentRef}
                        onScroll={handleScroll}
                        className="px-4 py-3 max-h-60 overflow-y-auto"
                    >
                        <div className="prose prose-sm dark:prose-invert break-words max-w-none text-[12px] leading-relaxed text-base-content/70">
                            <ReactMarkdown {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}>
                                {reasoning}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
