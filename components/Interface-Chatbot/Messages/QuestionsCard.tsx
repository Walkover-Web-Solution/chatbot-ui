import React, { useState, useCallback } from "react";
import { ChevronDown, Check, HelpCircle } from "lucide-react";

interface Question {
    id: string;
    for_task: string;
    status: "pending" | "answered" | "skipped";
    question: string;
    options?: string[];
    allow_custom?: boolean;
    priority?: "blocking" | "optional";
    response?: string | null;
}

interface QuestionsCardProps {
    questions: Question[];
    onAnswersSubmit: (answers: Record<string, string>) => void;
    isLoading?: boolean;
}

export default function QuestionsCard({ questions, onAnswersSubmit, isLoading = false }: QuestionsCardProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id || null);
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

    const handleSelectOption = useCallback((questionId: string, option: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
        setCustomAnswers((prev) => {
            const updated = { ...prev };
            delete updated[questionId];
            return updated;
        });
    }, []);

    const handleCustomAnswer = useCallback((questionId: string, value: string) => {
        setCustomAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
        setAnswers((prev) => {
            const updated = { ...prev };
            delete updated[questionId];
            return updated;
        });
    }, []);

    const allAnswered = questions.every((q) => {
        const hasAnswer = answers[q.id] || customAnswers[q.id];
        return q.status === "answered" || q.status === "skipped" || hasAnswer;
    });

    const handleSubmit = () => {
        const finalAnswers: Record<string, string> = { ...answers };
        Object.entries(customAnswers).forEach(([qId, answer]) => {
            if (answer.trim()) {
                finalAnswers[qId] = answer;
            }
        });
        onAnswersSubmit(finalAnswers);
    };

    if (!questions || questions.length === 0) return null;

    return (
        <div className="mb-4 w-full not-prose">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Planning Questions</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Answer the following questions to proceed</p>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {questions.map((question, idx) => {
                        const isExpanded = expandedId === question.id;
                        const selectedAnswer = answers[question.id];
                        const customAnswer = customAnswers[question.id];
                        const hasAnswer = selectedAnswer || customAnswer || question.response;
                        const isAnswered = question.status === "answered" || hasAnswer;

                        return (
                            <div key={question.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <button
                                    type="button"
                                    className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
                                    onClick={() => setExpandedId(isExpanded ? null : question.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Q{idx + 1}</span>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {question.question}
                                            </p>
                                            {question.priority === "blocking" && (
                                                <span className="text-xs px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        {isAnswered && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                <span className="text-green-600 dark:text-green-400 font-medium">✓ Answered:</span> {selectedAnswer || customAnswer || question.response}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-2">
                                        {isAnswered && <Check className="w-4 h-4 text-green-600 dark:text-green-400" />}
                                        <ChevronDown
                                            className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                                                isExpanded ? "rotate-180" : ""
                                            }`}
                                        />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                        {question.options && question.options.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Select an option</p>
                                                <div className="space-y-2">
                                                    {question.options.map((option) => (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={question.id}
                                                                value={option}
                                                                checked={selectedAnswer === option}
                                                                onChange={() => handleSelectOption(question.id, option)}
                                                                className="w-4 h-4 accent-blue-600"
                                                            />
                                                            <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {question.allow_custom && (
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                    {question.options?.length ? "Or provide a custom answer" : "Your answer"}
                                                </p>
                                                <textarea
                                                    value={customAnswer}
                                                    onChange={(e) => handleCustomAnswer(question.id, e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Submit Button */}
                {allAnswered && (
                    <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Submit Answers
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
