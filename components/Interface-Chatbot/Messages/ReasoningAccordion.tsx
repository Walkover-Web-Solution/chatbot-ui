/* eslint-disable */
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { supportsLookbehind } from "@/utils/appUtility";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const remarkGfm = dynamic(() => import("remark-gfm"), { ssr: false }) as any;

interface ReasoningAccordionProps {
    reasoning: string;
    isStreaming?: boolean;
    hasContent?: boolean;
}

export default function ReasoningAccordion({ reasoning, isStreaming, hasContent }: ReasoningAccordionProps) {
    const [open, setOpen] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isStreaming && open && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [reasoning, isStreaming, open]);

    useEffect(() => {
        // Open when reasoning is streaming
        if (isStreaming && reasoning) {
            setOpen(true);
        }
        // Close when streaming is done and there's content
        if (!isStreaming && hasContent) {
            setOpen(false);
        }
    }, [hasContent, isStreaming, reasoning]);

    if (!reasoning) return null;

    return (
        <div className="rounded-lg border border-base-300 overflow-hidden text-sm mb-2">
            <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 bg-base-200 hover:bg-base-300 transition-colors text-left"
                onClick={() => setOpen((v) => !v)}
            >
                <Brain className="w-4 h-4 opacity-60 shrink-0" />
                <span className="flex-1 font-medium opacity-70">
                    {isStreaming && !hasContent ? "Thinking…" : "Reasoning"}
                </span>
                {open ? (
                    <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                )}
            </button>

            {open && (
                <div
                    ref={contentRef}
                    className="px-3 py-2 bg-base-100 border-t border-base-300 text-xs max-h-48 overflow-y-auto opacity-70"
                >
                    <div className="prose prose-xs dark:prose-invert break-words max-w-none">
                        <ReactMarkdown {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}>
                            {reasoning}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
