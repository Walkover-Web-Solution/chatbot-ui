/* eslint-disable */
import { supportsLookbehind } from "@/utils/appUtility";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight, CheckCircle2, FileText, Loader2, RotateCcw, XCircle } from "lucide-react";

interface ReviewPhaseEntry {
    phase: "reviewer_start" | "reviewer_done" | "main_rerun_start";
    round: number;
    isStreaming?: boolean;
    passed?: boolean;
    reason?: string;
    reviewContent?: string;
    snapshotContent?: string;
}

interface ReviewPhaseAccordionProps {
    reviewPhases: ReviewPhaseEntry[];
}

function ReviewerEntry({ entry }: { entry: ReviewPhaseEntry }) {
    const [reviewOpen, setReviewOpen] = useState(false);
    const [snapshotOpen, setSnapshotOpen] = useState(false);

    const isStreaming = entry.isStreaming;
    const passed = entry.passed;
    const hasFailed = !isStreaming && passed === false;
    const hasReviewContent = Boolean(entry.reviewContent?.trim());
    const hasReason = Boolean(entry.reason?.trim());
    const hasSnapshot = Boolean(entry.snapshotContent?.trim());
    const canExpand = !isStreaming && (hasReviewContent || hasReason);

    return (
        <div className="space-y-1">
            {/* Reviewer analysis row */}
            <div
                className="rounded-lg border overflow-hidden text-sm"
                style={{ borderColor: hasFailed ? "oklch(var(--er) / 0.3)" : isStreaming ? "oklch(var(--p) / 0.25)" : "oklch(var(--su) / 0.3)" }}
            >
                <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-left transition-opacity hover:opacity-80"
                    style={{
                        background: hasFailed
                            ? "oklch(var(--er) / 0.07)"
                            : isStreaming
                            ? "oklch(var(--p) / 0.06)"
                            : "oklch(var(--su) / 0.07)",
                    }}
                    onClick={() => canExpand && setReviewOpen((v) => !v)}
                    disabled={!canExpand}
                >
                    {isStreaming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                    ) : passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    ) : (
                        <XCircle className="w-3.5 h-3.5 text-error shrink-0" />
                    )}

                    <span className="flex-1 text-xs font-medium">
                        {isStreaming
                            ? "Reviewing response…"
                            : passed
                            ? "Review passed"
                            : "Review failed"}
                    </span>

                    {canExpand && (
                        <span className="text-[10px] opacity-40 mr-1">Reviewer analysis</span>
                    )}
                    {canExpand && (
                        reviewOpen
                            ? <ChevronDown className="w-3.5 h-3.5 opacity-40 shrink-0" />
                            : <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    )}
                </button>

                {canExpand && reviewOpen && (
                    <div className="px-3 py-2.5 border-t space-y-2"
                        style={{ borderColor: hasFailed ? "oklch(var(--er) / 0.15)" : "oklch(var(--b3))", background: "oklch(var(--b1))" }}>
                        {hasReviewContent && (
                            <div className="prose prose-xs dark:prose-invert max-w-none text-[11.5px] leading-relaxed opacity-75 break-words">
                                <ReactMarkdown {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}>
                                    {entry.reviewContent!}
                                </ReactMarkdown>
                                {isStreaming && (
                                    <span className="inline-block w-1.5 h-3.5 bg-current opacity-60 animate-pulse ml-0.5 align-middle" />
                                )}
                            </div>
                        )}
                        {!hasReviewContent && isStreaming && (
                            <div className="flex items-center gap-2 opacity-40">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="text-xs">Analysing…</span>
                            </div>
                        )}
                        {!hasReviewContent && !isStreaming && hasReason && (
                            <p className="text-[11.5px] leading-relaxed opacity-75 break-words">{entry.reason}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Outdated response snapshot */}
            {hasSnapshot && (
                <div className="rounded-lg border overflow-hidden text-sm" style={{ borderColor: "oklch(var(--wa) / 0.3)" }}>
                    <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-left transition-opacity hover:opacity-80"
                        style={{ background: "oklch(var(--wa) / 0.07)" }}
                        onClick={() => setSnapshotOpen((v) => !v)}
                    >
                        <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: "oklch(var(--wa))" }} />
                        <span className="flex-1 text-xs font-medium opacity-70">Outdated response (round {entry.round})</span>
                        {snapshotOpen
                            ? <ChevronDown className="w-3.5 h-3.5 opacity-40 shrink-0" />
                            : <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        }
                    </button>

                    {snapshotOpen && (
                        <div className="px-3 py-2.5 border-t"
                            style={{ borderColor: "oklch(var(--wa) / 0.2)", background: "oklch(var(--b1))" }}>
                            <div className="prose prose-xs dark:prose-invert max-w-none text-[11.5px] leading-relaxed opacity-60 break-words">
                                <ReactMarkdown {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}>
                                    {entry.snapshotContent!}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function RerunSeparator({ round }: { round: number }) {
    return (
        <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px" style={{ background: "oklch(var(--p) / 0.2)" }} />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border"
                style={{ background: "oklch(var(--p) / 0.06)", borderColor: "oklch(var(--p) / 0.2)" }}>
                <RotateCcw className="w-3 h-3" style={{ color: "oklch(var(--p) / 0.6)" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "oklch(var(--p) / 0.6)" }}>
                    Regenerating · Round {round}
                </span>
            </div>
            <div className="flex-1 h-px" style={{ background: "oklch(var(--p) / 0.2)" }} />
        </div>
    );
}

export default function ReviewPhaseAccordion({ reviewPhases }: ReviewPhaseAccordionProps) {
    if (!reviewPhases || reviewPhases.length === 0) return null;

    return (
        <div className="mb-3 w-full not-prose space-y-1" data-testid="chatbot-interface-review-phase-accordion">
            {/* Top separator marking start of review */}
            <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-px bg-base-300 dark:bg-base-600" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-base-200 dark:bg-base-700 border border-base-300 dark:border-base-600">
                    <RotateCcw className="w-3 h-3 opacity-40" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-40">Review Phase</span>
                </div>
                <div className="flex-1 h-px bg-base-300 dark:bg-base-600" />
            </div>

            {reviewPhases.map((entry, idx) => {
                if (entry.phase === "main_rerun_start") {
                    return <RerunSeparator key={idx} round={entry.round} />;
                }
                return <ReviewerEntry key={idx} entry={entry} />;
            })}

            {/* Bottom separator — marks where the new response begins */}
            <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-px bg-base-300 dark:bg-base-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wide opacity-30 px-1">Latest response</span>
                <div className="flex-1 h-px bg-base-300 dark:bg-base-600" />
            </div>
        </div>
    );
}
