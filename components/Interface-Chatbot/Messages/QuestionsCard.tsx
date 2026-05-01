import React, { useState, useCallback } from "react";
import { ChevronRight, SkipForward, Check, HelpCircle } from "lucide-react";

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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [customAnswer, setCustomAnswer] = useState("");
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isRequired = currentQuestion?.priority === "blocking";
    const hasAnswer = selectedOption || customAnswer.trim();

    const handleSelectOption = useCallback((option: string) => {
        setSelectedOption(option);
        setCustomAnswer("");
    }, []);

    const handleCustomAnswerChange = useCallback((value: string) => {
        setCustomAnswer(value);
        setSelectedOption(null);
    }, []);

    const handleNext = useCallback(() => {
        if (!currentQuestion) return;

        const answer = selectedOption || customAnswer.trim();
        if (answer) {
            setAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: answer,
            }));
        }

        if (isLastQuestion) {
            const finalAnswers = {
                ...answers,
                [currentQuestion.id]: answer,
            };
            onAnswersSubmit(finalAnswers);
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setCustomAnswer("");
        }
    }, [currentQuestion, selectedOption, customAnswer, isLastQuestion, answers, onAnswersSubmit]);

    const handleSkip = useCallback(() => {
        if (isRequired) return;

        if (isLastQuestion) {
            onAnswersSubmit(answers);
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setCustomAnswer("");
        }
    }, [isRequired, isLastQuestion, answers, onAnswersSubmit]);

    if (!currentQuestion) return null;

    return (
        <div className="mb-4 w-full not-prose">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Planning Questions</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                            </div>
                        </div>
                        {isRequired && (
                            <span className="text-xs px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                                Required
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-200 dark:bg-slate-700">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Content */}
                <div className="px-5 py-6 space-y-4">
                    <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                            {currentQuestion.question}
                        </p>
                    </div>

                    {/* Options */}
                    {currentQuestion.options && currentQuestion.options.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Select an option:
                            </p>
                            <div className="space-y-2">
                                {currentQuestion.options.map((option: any, optIndex: number) => {
                                    const optionValue = typeof option === 'object' && option !== null ? option.value : option
                                    const optionLabel = typeof option === 'object' && option !== null ? option.label : option
                                    return (
                                        <label
                                            key={`${optionValue}-${optIndex}`}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                                selectedOption === optionValue
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={currentQuestion.id}
                                                value={optionValue}
                                                checked={selectedOption === optionValue}
                                                onChange={() => handleSelectOption(optionValue)}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{optionLabel}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Custom Answer - Always visible */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {currentQuestion.options?.length ? "Or type your custom answer:" : "Your answer:"}
                        </p>
                        <textarea
                            value={customAnswer}
                            onChange={(e) => handleCustomAnswerChange(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center justify-between gap-3">
                        {/* Skip Button - Only for optional questions */}
                        {!isRequired ? (
                            <button
                                type="button"
                                onClick={handleSkip}
                                disabled={isLoading}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <SkipForward className="w-3.5 h-3.5" />
                                Skip
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {/* Next/Submit Button - Right aligned, medium size */}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isLoading || (isRequired && !hasAnswer)}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Submitting...
                                </>
                            ) : isLastQuestion ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Submit
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
