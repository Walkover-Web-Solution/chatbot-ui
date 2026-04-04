/* eslint-disable */
import React, { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";

interface ToolCall {
    name: string;
    args: Record<string, any>;
    status: "calling" | "done";
    result: string | null;
}

interface ToolCallAccordionProps {
    toolsData: Record<string, ToolCall>;
}

function ToolCallItem({ toolCall, name }: { toolCall: ToolCall; name: string }) {
    const [open, setOpen] = useState(false);
    let parsedResult: any = null;
    if (toolCall.result) {
        try {
            parsedResult = JSON.parse(toolCall.result);
        } catch {
            parsedResult = toolCall.result;
        }
    }

    return (
        <div className="rounded-lg border border-base-300 overflow-hidden text-sm mb-1">
            <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 bg-base-200 hover:bg-base-300 transition-colors text-left"
                onClick={() => toolCall.status === "done" && setOpen((v) => !v)}
                disabled={toolCall.status === "calling"}
            >
                {toolCall?.status === "calling" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                )}
                <span className="flex-1 font-mono font-medium truncate">{toolCall?.name || name}</span>
                {toolCall?.status === "calling" ? (
                    <span className="text-xs opacity-50">Running…</span>
                ) : toolCall?.status && (open ? (
                    <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                ))}
            </button>

            {toolCall?.status === "done" && open && (
                <div className="px-3 py-2 bg-base-100 border-t border-base-300 space-y-2">
                    {Object.keys(toolCall.args || {}).length > 0 && (
                        <div>
                            <p className="text-xs font-semibold opacity-50 mb-1 uppercase tracking-wide">Input</p>
                            <pre className="text-xs bg-base-200 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                                {JSON.stringify(toolCall.args, null, 2)}
                            </pre>
                        </div>
                    )}
                    {parsedResult !== null && (
                        <div>
                            <p className="text-xs font-semibold opacity-50 mb-1 uppercase tracking-wide">Output</p>
                            <pre className="text-xs bg-base-200 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                                {typeof parsedResult === "string"
                                    ? parsedResult
                                    : JSON.stringify(parsedResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ToolCallAccordion({ toolsData }: ToolCallAccordionProps) {
    if (!toolsData || Object.keys(toolsData).length === 0) return null;

    const calls = Object.entries(toolsData);

    return (
        <div className="mb-3 w-full">
            {calls.map(([callId, toolCall]) => (
                <ToolCallItem key={callId} toolCall={toolCall} name={callId} />
            ))}
        </div>
    );
}
