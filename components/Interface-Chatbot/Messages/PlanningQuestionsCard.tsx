import { ChevronLeft, ChevronRight, Pencil, Send, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { savePlanningAnswers } from "@/store/chat/chatSlice";
import { useColor } from "@/components/Chatbot/hooks/useColor";

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
    /** When true, renders the compact floating-above-textfield style */
    floatingMode?: boolean;
}

export default function PlanningQuestionsCard({ questions, isStreaming = false, isHistorical = false, answers: savedAnswers, onSubmit, floatingMode = false }: PlanningQuestionsCardProps) {
    const dispatch = useDispatch();
    const { backgroundColor, textColor } = useColor();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [useCustom, setUseCustom] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [customText, setCustomText] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

    const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]?.trim().length > 0);
    const answeredCount = questions.filter((q) => answers[q.id]?.trim().length > 0).length;

    // Reset submitted state when questions change (new questions arrived)
    useEffect(() => {
        setSubmitted(false);
        setAnswers({});
        setUseCustom({});
        setCurrentIdx(0);
        setCustomText("");
    }, [JSON.stringify(questions.map(q => q.id))]);

    // Animated navigation helper
    const navigateTo = (nextIdx: number, dir: 'left' | 'right' = 'right') => {
        if (nextIdx === currentIdx) return;
        setSlideDir(dir);
        setIsVisible(false);
        setTimeout(() => {
            setCurrentIdx(nextIdx);
            const nextQuestion = questions[nextIdx];
            if (nextQuestion && useCustom[nextQuestion.id]) {
                setCustomText(answers[nextQuestion.id] || "");
            } else {
                setCustomText("");
            }
            setIsVisible(true);
        }, 250);
    };

    useEffect(() => {
        if (submitted && !isStreaming) {
            setLoading(false);
        }
    }, [isStreaming, submitted]);

    const handleSubmit = () => {
        if (!allAnswered || loading || submitted) return;
        setLoading(true);

        // Save answers to Redux for history
        dispatch(savePlanningAnswers({ answers }));

        const text = questions
            .map((q) => `${q.id}: ${answers[q.id]?.trim()}`)
            .join("\n");
        onSubmit?.(text);
        setSubmitted(true);
    };

    const currentQuestion = questions[currentIdx];
    const totalQuestions = questions.length;

    const handleOptionSelect = (qId: string, opt: string) => {
        setUseCustom(p => ({ ...p, [qId]: false }));
        setAnswers(p => ({ ...p, [qId]: opt }));
        setCustomText("");
    };

    const handleCustomActivate = (qId: string) => {
        setUseCustom(p => ({ ...p, [qId]: true }));
        setAnswers(p => ({ ...p, [qId]: "" }));
        setCustomText("");
    };

    const handleCustomTextChange = (qId: string, value: string) => {
        setCustomText(value);
        setAnswers(p => ({ ...p, [qId]: value }));
    };

    const handleSkip = () => {
        if (currentIdx < totalQuestions - 1) {
            setCurrentIdx(i => i + 1);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Historical / submitted: compact read-only view (unchanged)
    // ─────────────────────────────────────────────────────────────────────────
    if (isHistorical || submitted) {
        // In floating mode, instantly hide the card once submitted (user request)
        if (floatingMode) return null;

        const displayAnswers = isHistorical ? (savedAnswers || {}) : answers;
        return (
            <div className="mt-3 mb-1 not-prose">
                <div className="rounded-xl border border-base-300 dark:border-base-500 bg-base-200/60 dark:bg-base-700/60 overflow-hidden">
                    <div className="px-4 py-3 space-y-2.5">
                        {questions.map((q) => {
                            const answer = displayAnswers[q.id];
                            return (
                                <div key={q.id} className="flex flex-col gap-0.5">
                                    <p className="text-[11px] text-base-content/60 dark:text-base-content/70 leading-snug">{q.question}</p>
                                    {answer
                                        ? <p className="text-[13px] text-base-content dark:text-base-content whitespace-pre-wrap break-words">{answer}</p>
                                        : <p className="text-[12px] text-base-content/40 dark:text-base-content/50 italic">—</p>
                                    }
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Floating mode: Windsurf/Antigravity style — one question at a time
    // ─────────────────────────────────────────────────────────────────────────
    if (floatingMode) {
        if (!currentQuestion) return null;
        const opts = Array.isArray(currentQuestion.options) ? currentQuestion.options.filter(Boolean) : [];
        const isCustom = Boolean(useCustom[currentQuestion.id]);
        const selected = answers[currentQuestion.id] || "";

        // Slide direction class: going right = slide from right in, going left = slide from left in
        const slideOut = slideDir === 'right' ? '-translate-x-2' : 'translate-x-2';

        return (
            <div className="w-full px-5 pb-2 not-prose">
                <div
                    className="relative w-full rounded-xl border bg-base-100 dark:bg-base-800 shadow-lg overflow-hidden p-3 sm:p-4"
                    style={{
                        borderColor: "var(--fallback-b3,oklch(var(--b3)/0.8))",
                        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.06)"
                    }}
                >
                    {/* Header: Progress Bar */}
                    <div className="w-full flex gap-1 mb-3">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                    i <= currentIdx ? "bg-base-content/80 dark:bg-base-content/80" : "bg-base-200 dark:bg-base-600/50"
                                }`}
                                style={i <= currentIdx ? { backgroundColor } : undefined}
                            />
                        ))}
                    </div>

                    {/* Header: Title and Question (Animated) */}
                    <div
                        className={`transition-all duration-300 ease-out mb-3.5 ${
                            isVisible ? "opacity-100 translate-x-0" : `opacity-0 ${slideOut}`
                        }`}
                    >
                        <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-base-content/40 dark:text-base-content/50 uppercase mb-1.5">
                            Question {currentIdx + 1} of {totalQuestions}
                        </p>
                        <h3 className="text-[14px] sm:text-[15px] font-bold text-base-content dark:text-base-content leading-snug">
                            {currentQuestion.question}
                        </h3>
                    </div>

                    {/* Animated content area — options + Other row */}
                    <div
                        className={`transition-all duration-300 ease-out ${
                            isVisible ? "opacity-100 translate-x-0" : `opacity-0 ${slideOut}`
                        }`}
                    >
                        {/* Options list */}
                        {opts.length > 0 && (
                            <div className="flex flex-col gap-1.5 mb-2.5">
                                {opts.map((opt, oIdx) => {
                                    const isSelected = selected === opt && !isCustom;
                                    return (
                                        <button
                                            key={oIdx}
                                            type="button"
                                            disabled={isStreaming}
                                            onClick={() => {
                                                handleOptionSelect(currentQuestion.id, opt);
                                                if (currentIdx < totalQuestions - 1) {
                                                    setTimeout(() => navigateTo(currentIdx + 1, 'right'), 450);
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 px-2.5 py-1.5 text-left transition-colors disabled:opacity-40 border rounded-xl ${
                                                isSelected
                                                    ? "border-transparent shadow-sm"
                                                    : "border-transparent opacity-90 hover:opacity-100"
                                            }`}
                                            style={isSelected ? { backgroundColor, color: textColor } : undefined}
                                        >
                                            <span
                                                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors border ${
                                                    isSelected
                                                        ? "border-transparent bg-base-100/30 dark:bg-base-800/40"
                                                        : "border-transparent bg-base-100/10 dark:bg-base-800/10 text-base-content/60"
                                                }`}
                                                style={isSelected ? { color: textColor } : undefined}
                                            >
                                                {oIdx + 1}
                                            </span>
                                            <span
                                                className={`text-[12px] sm:text-[13px] leading-snug transition-colors ${
                                                    isSelected ? "font-bold" : "font-medium text-base-content/85 dark:text-base-content/90"
                                                }`}
                                                style={isSelected ? { color: textColor } : undefined}
                                            >
                                                {opt}
                                            </span>
                                            {isSelected && (
                                                <span
                                                    className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: textColor, opacity: 0.8 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Other / custom answer row */}
                        {!isCustom ? (
                            <button
                                type="button"
                                disabled={isStreaming}
                                onClick={() => handleCustomActivate(currentQuestion.id)}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-base-50 dark:hover:bg-base-700/50 transition-colors disabled:opacity-40 border border-dashed border-base-300 dark:border-base-500 rounded-xl"
                            >
                                <Pencil className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
                                <span className="text-[12px] sm:text-[13px] font-medium text-base-content/50 dark:text-base-content/60">
                                    Other — type your answer
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2.5 px-3.5 py-2 border border-base-content/50 dark:border-base-content/60 rounded-xl bg-base-50/50 dark:bg-base-800 focus-within:border-base-content dark:focus-within:border-base-content transition-colors">
                                <Pencil className="w-3.5 h-3.5 text-base-content/50 shrink-0" />
                                <input
                                    type="text"
                                    autoFocus
                                    disabled={isStreaming}
                                    className="flex-1 text-[12px] sm:text-[13px] font-medium bg-transparent outline-none text-base-content dark:text-base-content placeholder:text-base-content/40 dark:placeholder:text-base-content/50 py-0.5"
                                    placeholder="Type your answer..."
                                    value={customText}
                                    onChange={(e) => handleCustomTextChange(currentQuestion.id, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey && customText.trim()) {
                                            if (currentIdx < totalQuestions - 1) {
                                                navigateTo(currentIdx + 1, 'right');
                                            }
                                        }
                                        if (e.key === "Escape") {
                                            setUseCustom(p => ({ ...p, [currentQuestion.id]: false }));
                                            setCustomText("");
                                            setAnswers(p => ({ ...p, [currentQuestion.id]: "" }));
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseCustom(p => ({ ...p, [currentQuestion.id]: false }));
                                        setCustomText("");
                                        setAnswers(p => ({ ...p, [currentQuestion.id]: "" }));
                                    }}
                                    className="p-1 rounded-md hover:bg-base-200 dark:hover:bg-base-600 text-base-content/50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-base-200 dark:border-base-600">
                        <span className="text-[11px] text-base-content/50 dark:text-base-content/60 font-medium">
                            {answeredCount}/{totalQuestions} answered
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentIdx === 0}
                                onClick={() => navigateTo(currentIdx - 1, 'left')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-base-200 dark:border-base-600 hover:bg-base-50 dark:hover:bg-base-700 disabled:opacity-30 transition-colors"
                                aria-label="Previous question"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 text-base-content/70" />
                            </button>
                            <button
                                type="button"
                                disabled={currentIdx === totalQuestions - 1}
                                onClick={() => navigateTo(currentIdx + 1, 'right')}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-base-200 dark:border-base-600 hover:bg-base-50 dark:hover:bg-base-700 disabled:opacity-30 transition-colors"
                                aria-label="Next question"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-base-content/70" />
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    if (currentIdx < totalQuestions - 1) {
                                        navigateTo(currentIdx + 1, 'right');
                                    }
                                }}
                                disabled={currentIdx === totalQuestions - 1 && !allAnswered}
                                className="px-3 py-1 rounded-lg border border-base-200 dark:border-base-600 text-[12px] font-medium hover:bg-base-50 dark:hover:bg-base-700 disabled:opacity-30 transition-colors text-base-content/80 dark:text-base-content/90"
                            >
                                Skip
                            </button>

                            <button
                                type="button"
                                disabled={!allAnswered || loading || isStreaming}
                                onClick={handleSubmit}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-transparent"
                                style={(!allAnswered || loading || isStreaming) ? undefined : { backgroundColor, color: textColor }}
                            >
                                <Send className="w-3.5 h-3.5" />
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Default inline mode (legacy, used in historical rendering / fallback)
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="mt-3 mb-1 rounded-xl border border-base-300 dark:border-base-500 bg-base-50 dark:bg-base-700 overflow-hidden not-prose">
            <div className="divide-y divide-base-200 dark:divide-base-600">
                {questions.map((q, idx) => {
                    const opts = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
                    const isCustom = Boolean(useCustom[q.id]);
                    const selected = answers[q.id] || "";
                    const isManyOptions = opts.length > 4;

                    return (
                        <div key={q.id} className="px-4 py-3.5 space-y-2.5">
                            <div className="flex items-start gap-2">
                                <span className="flex-shrink-0 text-[11px] font-bold text-base-content/50 dark:text-base-content/60 mt-0.5 w-4">{idx + 1}.</span>
                                <p className="text-[13px] font-medium text-base-content dark:text-base-content leading-snug">{q.question}</p>
                            </div>

                            {opts.length > 0 && (
                                <div
                                    className={`flex flex-wrap gap-1.5 pl-6 ${
                                        isManyOptions
                                            ? "max-h-32 overflow-y-auto pr-1 [scrollbar-width:thin]"
                                            : ""
                                    }`}
                                >
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
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none cursor-pointer disabled:opacity-40 whitespace-normal break-words leading-snug max-w-full ${
                                                    isSelected
                                                        ? "bg-base-content dark:bg-base-content text-base-100 dark:text-base-100"
                                                        : "border border-base-300 dark:border-base-500 bg-base-100 dark:bg-base-600 text-base-content dark:text-base-content hover:border-base-content/50 dark:hover:border-base-400 hover:bg-base-200 dark:hover:bg-base-500"
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
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none cursor-pointer flex items-center gap-1 disabled:opacity-40 ${
                                            isCustom
                                                ? "bg-base-content dark:bg-base-content text-base-100 dark:text-base-100"
                                                : "border border-base-300 dark:border-base-500 bg-base-100 dark:bg-base-600 text-base-content dark:text-base-content hover:border-base-content/50 dark:hover:border-base-400 hover:bg-base-200 dark:hover:bg-base-500"
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
                                    className="w-full ml-6 text-xs rounded-lg border border-base-300 dark:border-base-500 bg-base-100 dark:bg-base-600 text-base-content dark:text-base-content px-3 py-2 outline-none focus:border-base-content/60 dark:focus:border-base-300 focus:ring-1 focus:ring-base-content/15 placeholder:text-base-content/35 dark:placeholder:text-base-content/45 transition-all disabled:opacity-40"
                                    placeholder="Type your answer..."
                                    value={opts.length === 0 || isCustom ? selected : ""}
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

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-base-200 dark:border-base-600 bg-base-100 dark:bg-base-600/70">
                <span className="text-[11px] text-base-content/50 dark:text-base-content/70 font-medium">
                    {answeredCount}/{questions.length} answered
                </span>
                <button
                    type="button"
                    disabled={!allAnswered || loading || isStreaming}
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-base-content dark:bg-base-content text-base-100 dark:text-base-100 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {loading
                        ? <><Send className="w-3 h-3" /> Sending</>
                        : <><Send className="w-3 h-3" /> Submit</>}
                </button>
            </div>
        </div>
    );
}
