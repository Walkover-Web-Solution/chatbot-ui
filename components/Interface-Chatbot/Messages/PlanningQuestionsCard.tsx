import { Loader2, Pencil, Send } from "lucide-react";
import React, { useState } from "react";

interface Question {
    id: string;
    question: string;
    options?: string[];
}

interface PlanningQuestionsCardProps {
    questions: Question[];
    isStreaming?: boolean;
    isHistorical?: boolean;
    answers?: Record<string, string>;
    onSubmit?: (answersText: string) => void;
}

export default function PlanningQuestionsCard({ questions, isStreaming = false, isHistorical = false, answers: savedAnswers, onSubmit }: PlanningQuestionsCardProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [useCustom, setUseCustom] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]?.trim().length > 0);
    const answeredCount = questions.filter((q) => answers[q.id]?.trim().length > 0).length;

    const handleSubmit = () => {
        if (!allAnswered || loading || submitted) return;
        setLoading(true);
        const text = questions
            .map((q) => `${q.id}: ${answers[q.id]?.trim()}`)
            .join("\n");
        onSubmit?.(text);
        setSubmitted(true);
    };

    if (isHistorical || submitted) {
        const displayAnswers = isHistorical ? (savedAnswers || {}) : answers;
        return (
            <div className="mt-3 mb-1 rounded-xl border border-base-200 dark:border-base-700 bg-base-50 dark:bg-base-800/50 px-4 py-3 not-prose">
                <div className="space-y-2">
                    {questions.map((q) => (
                        <div key={q.id} className="flex flex-col gap-0.5">
                            <p className="text-[11px] text-base-content/45 leading-snug">{q.question}</p>
                            {displayAnswers[q.id]
                                ? <p className="text-[13px] text-base-content/80">{displayAnswers[q.id]}</p>
                                : <p className="text-[12px] text-base-content/30 italic">—</p>
                            }
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-3 mb-1 rounded-xl border border-base-200 dark:border-base-700 bg-base-50 dark:bg-base-800/40 overflow-hidden not-prose">
            <div className="divide-y divide-base-200 dark:divide-base-700">
                {questions.map((q, idx) => {
                    const opts = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
                    const isCustom = Boolean(useCustom[q.id]);
                    const selected = answers[q.id] || "";

                    return (
                        <div key={q.id} className="px-4 py-3 space-y-2.5">
                            <div className="flex items-start gap-2">
                                <span className="flex-shrink-0 text-[11px] font-bold text-base-content/35 mt-0.5 w-4">{idx + 1}.</span>
                                <p className="text-[13px] text-base-content/85 leading-snug">{q.question}</p>
                            </div>

                            {opts.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pl-6">
                                    {opts.map((opt, oIdx) => {
                                        const isSelected = selected === opt && !isCustom;
                                        return (
                                            <button
                                                key={oIdx}
                                                type="button"
                                                disabled={isStreaming}
                                                onClick={() => {
                                                    setUseCustom((p) => ({ ...p, [q.id]: false }));
                                                    setAnswers((p) => ({ ...p, [q.id]: opt }));
                                                }}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all select-none cursor-pointer disabled:opacity-40 ${
                                                    isSelected
                                                        ? "bg-base-content text-base-100"
                                                        : "border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-800 text-base-content/70 hover:border-base-content/40 hover:text-base-content"
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        disabled={isStreaming}
                                        onClick={() => {
                                            setUseCustom((p) => ({ ...p, [q.id]: true }));
                                            setAnswers((p) => ({ ...p, [q.id]: "" }));
                                        }}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all select-none cursor-pointer flex items-center gap-1 disabled:opacity-40 ${
                                            isCustom
                                                ? "bg-base-content text-base-100"
                                                : "border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-800 text-base-content/60 hover:border-base-content/40 hover:text-base-content"
                                        }`}
                                    >
                                        <Pencil className="w-2.5 h-2.5" />
                                        Other
                                    </button>
                                </div>
                            )}

                            {(opts.length === 0 || isCustom) && (
                                <input
                                    type="text"
                                    autoFocus={isCustom && idx === 0}
                                    disabled={isStreaming}
                                    className="w-full ml-6 text-xs rounded-lg border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-800 px-3 py-2 outline-none focus:border-base-content/40 focus:ring-1 focus:ring-base-content/10 placeholder:text-base-content/25 transition-all disabled:opacity-40"
                                    placeholder="Type your answer..."
                                    value={isCustom ? selected : ""}
                                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey && allAnswered) handleSubmit();
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-base-200 dark:border-base-700 bg-base-100 dark:bg-base-800/50">
                <span className="text-[11px] text-base-content/35">
                    {answeredCount}/{questions.length} answered
                </span>
                <button
                    type="button"
                    disabled={!allAnswered || loading || isStreaming}
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-base-content text-base-100 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {loading
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending</>
                        : <><Send className="w-3 h-3" /> Submit</>}
                </button>
            </div>
        </div>
    );
}
