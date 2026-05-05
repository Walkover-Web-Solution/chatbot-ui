/* eslint-disable */
import { supportsLookbehind } from "@/utils/appUtility";
import { X } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ToolCallAccordion from "./ToolCallAccordion";

interface ToolCall {
    name: string;
    args: Record<string, any>;
    status: "calling" | "done";
    result: string | null;
}

interface WorkingAccordionProps {
    reasoning?: string;
    toolsData?: Record<string, ToolCall>;
    isStreaming?: boolean;
    hasContent?: boolean;
}

export default function WorkingAccordion({
    reasoning,
    toolsData,
    isStreaming,
    hasContent,
}: WorkingAccordionProps) {
    const [expanded, setExpanded] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const manuallyClosedRef = useRef(false);

    const hasReasoning = Boolean(reasoning);
    const toolEntries = toolsData ? Object.entries(toolsData) : [];
    const toolCount = toolEntries.length;
    const hasTools = toolCount > 0;
    const callingCount = toolEntries.filter(([, t]) => t?.status === "calling").length;
    const isWorking = Boolean(isStreaming) || callingCount > 0;

    const handleScroll = () => {
        const el = contentRef.current;
        if (!el) return;
        isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 60;
    };

    const openCard = (isAuto = false) => {
        if (isAuto) manuallyClosedRef.current = false;
        setExpanded(true);
    };

    const closeCard = (isManual = false) => {
        if (isManual) manuallyClosedRef.current = true;
        setAnimateIn(false);
        setTimeout(() => setExpanded(false), 200);
    };

    useLayoutEffect(() => {
        if (expanded) {
            requestAnimationFrame(() => setAnimateIn(true));
        }
    }, [expanded]);

    // Stick to bottom while reasoning streams in
    useEffect(() => {
        if (!animateIn) return;
        if (isAtBottomRef.current && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [reasoning, animateIn]);

    // Auto-open when activity starts (streaming or a tool firing), unless user closed it
    useEffect(() => {
        if (isWorking && (hasReasoning || hasTools) && !manuallyClosedRef.current && !expanded) {
            openCard(true);
        }
    }, [isWorking, hasReasoning, hasTools]);

    // Auto-close when the assistant's final content has arrived
    useEffect(() => {
        if (!isStreaming && hasContent) closeCard();
    }, [isStreaming, hasContent]);

    if (!hasReasoning && !hasTools) return null;

    const chipLabel = isWorking ? "Working…" : "Working";

    return (
        <div className="mb-2 not-prose" data-testid="chatbot-interface-working-accordion">
            {!expanded && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => openCard()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-200/80 dark:bg-base-700/60 border border-base-300/60 dark:border-base-600/40 hover:bg-base-200 dark:hover:bg-base-700 transition-colors cursor-pointer"
                    >
                        {isWorking ? (
                            <span className="w-2 h-2 rounded-full bg-base-content/40 animate-pulse shrink-0" />
                        ) : (
                            <span className="w-2 h-2 rounded-full border border-base-content/30 shrink-0" />
                        )}
                        <span className="text-xs text-base-content/60 font-medium">{chipLabel}</span>
                        {hasTools && (
                            <span className="text-[10px] text-base-content/60 px-1.5 py-0.5 rounded-md bg-base-300/60 dark:bg-base-600/50 font-medium">
                                {toolCount} {toolCount === 1 ? "tool" : "tools"}
                            </span>
                        )}
                    </button>
                    {!isWorking && (
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
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-base-content/80">Working</span>
                            {isWorking && (
                                <span className="w-1.5 h-1.5 rounded-full bg-base-content/40 animate-pulse" />
                            )}
                        </div>
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
                        className="max-h-72 overflow-y-auto"
                    >
                        {hasReasoning && (
                            <div className="px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-base-content/40 mb-1.5">
                                    Reasoning
                                </p>
                                <div className="prose prose-sm dark:prose-invert break-words max-w-none text-[12px] leading-relaxed text-base-content/70">
                                    <ReactMarkdown remarkPlugins={supportsLookbehind() ? [remarkGfm] : []}>
                                        {reasoning || ""}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                        {hasReasoning && hasTools && (
                            <div className="border-t border-base-200 dark:border-base-700" />
                        )}
                        {hasTools && toolsData && (
                            <div className="px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-base-content/40 mb-1.5">
                                    Tools used
                                </p>
                                <ToolCallAccordion toolsData={toolsData} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
