import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { CheckCircle2, ChevronDown, Circle, Loader2, MessageSquare, Pencil, PlayCircle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReasoningAccordion from "./ReasoningAccordion";

interface PlanningTasksCardProps {
    plan: any;
    isStreaming?: boolean;
    onAction?: (action: "proceed" | "revise" | "respond", payload: { parsedPlan: any; rawPlan: string; taskQueries?: Record<string, string>; queryMessage?: string; humanQueryAnswers?: Record<string, string>; humanQueryMessage?: string; resolvedAfter?: boolean }) => void;
}

export default function PlanningTasksCard({ plan, isStreaming = false, onAction }: PlanningTasksCardProps) {
    const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const taskResultRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showQueryInputs, setShowQueryInputs] = useState(false);
    const [taskQueries, setTaskQueries] = useState<Record<string, string>>({});
    const [humanQueryAnswers, setHumanQueryAnswers] = useState<Record<string, string>>({});
    const [resolvedHumanQueryIds, setResolvedHumanQueryIds] = useState<Set<string>>(new Set());
    const [openTaskId, setOpenTaskId] = useState("");
    const [queryHistoryPerTask, setQueryHistoryPerTask] = useState<Record<string, Array<{ query: string; answer: string | null }>>>({});
    const [useCustomAnswerPerQuery, setUseCustomAnswerPerQuery] = useState<Record<string, boolean>>({});
    const [isActionLoading, setIsActionLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const prevHumanQueriesRef = useRef<Record<string, string>>({});

    const { parsedPlan, rawPlan, execution } = useMemo(() => {
        if (plan === null || plan === undefined) {
            return { parsedPlan: null, rawPlan: "", execution: null };
        }
        if (typeof plan === "string") {
            try {
                const parsed = JSON.parse(plan);
                return { parsedPlan: parsed, rawPlan: plan, execution: parsed?.execution || null };
            } catch {
                return { parsedPlan: null, rawPlan: plan, execution: null };
            }
        }
        const parsedPlan = plan?.plan || plan;
        return { parsedPlan, rawPlan: JSON.stringify(parsedPlan, null, 2), execution: plan?.execution || null };
    }, [plan]);

    const tasks = useMemo(() => {
        if (!parsedPlan?.tasks || typeof parsedPlan.tasks !== "object") return [];
        return Object.entries(parsedPlan.tasks).map(([key, value]: [string, any]) => ({
            id: key,
            ...(value || {}),
        }));
    }, [parsedPlan]);

    const activeTaskId = useMemo(() => {
        if (!execution?.tasks || typeof execution.tasks !== "object") return "";
        const runningTask = Object.entries(execution.tasks).find(([, value]: [string, any]) => value?.status === "in_progress");
        return runningTask?.[0] || "";
    }, [execution]);

    const hasTaskQueryValues = useMemo(
        () => Object.values(taskQueries).some((v) => v?.trim().length > 0),
        [taskQueries],
    );

    const humanQueryTasks = useMemo(() => tasks.filter((t) => t.human_query), [tasks]);

    const humanQueriesKey = useMemo(() => {
        return JSON.stringify(humanQueryTasks.map(t => ({ id: t.id, query: t.human_query })));
    }, [humanQueryTasks]);

    const allHumanQueriesAnswered = useMemo(() => {
        if (humanQueryTasks.length === 0) return true;
        return humanQueryTasks.every((t) => {
            const history = queryHistoryPerTask[t.id] || [];
            return history.every((queryItem, idx) => {
                if (queryItem.answer !== null) return true;
                return humanQueryAnswers[`${t.id}_${idx}`]?.trim().length > 0;
            });
        });
    }, [humanQueryTasks, humanQueryAnswers, queryHistoryPerTask]);

    const humanQueryMessage = useMemo(() => {
        return humanQueryTasks
            .map((t) => {
                const answer = humanQueryAnswers[t.id]?.trim();
                if (!answer) return "";
                return `${t.id}(task_id): human_query:"${answer.replace(/"/g, '\\"')}"`;
            })
            .filter(Boolean)
            .join("\n");
    }, [humanQueryTasks, humanQueryAnswers]);

    const queryMessage = useMemo(() => {
        return tasks
            .map((t) => {
                const v = taskQueries[t.id]?.trim();
                if (!v) return "";
                return `${t.id}(task_id): query:"${v.replace(/"/g, '\\"')}"`;
            })
            .filter(Boolean)
            .join("\n");
    }, [tasks, taskQueries]);

    const isExecuting = execution?.state === "executing" || execution?.state === "running" || execution?.state === "queued";
    const isUpdatingPlan = execution?.state === "updating";
    const isExecutionCompleted = execution?.state === "completed";
    const isExecutionLockedToActiveTask = isExecuting && Boolean(activeTaskId);
    const hasHumanQueries = humanQueryTasks.length > 0;
    const showProceedButton = !hasHumanQueries && !hasTaskQueryValues && !isExecuting && !isActionLoading && !isUpdatingPlan && !isStreaming;
    const showUpdateButton = (hasHumanQueries || hasTaskQueryValues || isActionLoading || isUpdatingPlan) && !isExecuting && !isStreaming;

    const doneCount = useMemo(() => {
        if (!execution?.tasks) return 0;
        return Object.values(execution.tasks).filter((t: any) => t?.status === "done").length;
    }, [execution]);

    const hasFailedTasks = useMemo(() => {
        const executionTasks = execution?.tasks;
        if (executionTasks && typeof executionTasks === "object") {
            return Object.values(executionTasks).some((t: any) => {
                const status = String(t?.status || "").toLowerCase();
                return status === "error" || status === "failed" || t?.is_error === true || Boolean(t?.error);
            });
        }

        if (parsedPlan?.tasks && typeof parsedPlan.tasks === "object") {
            return Object.values(parsedPlan.tasks).some((t: any) => {
                const status = String(t?.status || "").toLowerCase();
                return status === "error" || status === "failed" || t?.is_error === true || Boolean(t?.error);
            });
        }

        return false;
    }, [execution?.tasks, parsedPlan?.tasks]);

    useEffect(() => {
        if (!activeTaskId) return;
        taskRefs.current[activeTaskId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [activeTaskId]);

    useEffect(() => {
        if (tasks.length > 0) {
            cardRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [tasks.length]);

    useEffect(() => {
        if (!isStreaming) {
            setOpenTaskId("");
            setShowQueryInputs(false);
        }
    }, [isStreaming]);

    useEffect(() => {
        if (isExecutionCompleted) { setOpenTaskId(""); return; }
        if (isExecutionLockedToActiveTask) { setOpenTaskId(activeTaskId); return; }
        setOpenTaskId((prev) => (prev && tasks.some((t) => t.id === prev) ? prev : ""));
    }, [activeTaskId, isExecutionLockedToActiveTask, isExecutionCompleted, tasks]);

    useEffect(() => {
        setTaskQueries((prev) => {
            const next: Record<string, string> = {};
            tasks.forEach((t) => { if (prev[t.id]) next[t.id] = prev[t.id]; });
            return next;
        });
    }, [tasks]);

    useEffect(() => {
        // Clear loading state when streaming starts or execution state changes
        if (isStreaming || isExecuting || isUpdatingPlan) {
            setIsActionLoading(false);
        }
    }, [isStreaming, isExecuting, isUpdatingPlan]);

    useEffect(() => {
        // Auto-scroll task result containers to bottom when new data arrives
        if (execution?.tasks) {
            Object.keys(execution.tasks).forEach((taskId) => {
                const task = execution.tasks[taskId];
                if (task?.status === "running" && task?.result) {
                    const resultContainer = taskResultRefs.current[taskId];
                    if (resultContainer) {
                        resultContainer.scrollTop = resultContainer.scrollHeight;
                    }
                }
            });
        }
    }, [execution?.tasks]);

    useEffect(() => {
        const currentHumanQueries: Record<string, string> = {};
        humanQueryTasks.forEach((t) => {
            currentHumanQueries[t.id] = t.human_query || "";
        });

        setQueryHistoryPerTask((prevHistory) => {
            const newHistory = { ...prevHistory };
            
            humanQueryTasks.forEach((t) => {
                const currentQuery = t.human_query || "";
                const prevQuery = prevHumanQueriesRef.current[t.id];
                
                if (!newHistory[t.id]) {
                    newHistory[t.id] = [];
                }
                
                if (currentQuery) {
                    const existingIndex = newHistory[t.id].findIndex(h => h.query === currentQuery);
                    if (existingIndex === -1) {
                        newHistory[t.id].push({ query: currentQuery, answer: null });
                    }
                }
            });
            
            return newHistory;
        });

        prevHumanQueriesRef.current = currentHumanQueries;
    }, [humanQueriesKey, humanQueryTasks]);

    if (!parsedPlan && !rawPlan) return null;

    const handleAction = (action: "proceed" | "update") => {
        setIsActionLoading(true);
        
        if (action === "proceed") {
            // No human_query case - execute the plan
            const payload = {
                parsedPlan,
                rawPlan,
            };
            if (onAction) {
                onAction("proceed", payload);
            } else {
                emitEventToParent("PLANNING_ACTION", { action: "execute", plan: parsedPlan || rawPlan, ...payload });
            }
            return;
        }

        if (action === "update") {
            // Collect answers for human queries and user suggestions
            const messages: string[] = [];
            
            // Collect answers for human queries
            humanQueryTasks.forEach((t) => {
                const history = queryHistoryPerTask[t.id] || [];
                history.forEach((queryItem, idx) => {
                    if (queryItem.answer === null) {
                        const answer = humanQueryAnswers[`${t.id}_${idx}`]?.trim();
                        if (answer) {
                            messages.push(`task_id:${t.id}, answer:${answer}`);
                            queryItem.answer = answer;
                        }
                    }
                });
            });
            
            // Collect user suggestions/queries for all tasks
            tasks.forEach((t) => {
                const query = taskQueries[t.id]?.trim();
                if (query) {
                    messages.push(`task_id:${t.id}, query:${query}`);
                }
            });
            
            setQueryHistoryPerTask({ ...queryHistoryPerTask });
            
            const message = messages.join("\n");
            const payload = {
                parsedPlan,
                rawPlan,
                updateMessage: message,
            };
            
            if (onAction) {
                onAction("revise", payload);
            } else {
                emitEventToParent("PLANNING_ACTION", { action: "update", plan: parsedPlan || rawPlan, message, ...payload });
            }
            
            setTaskQueries({});
            setShowQueryInputs(false);
        }
    };

    return (
        <div className="mb-3 w-full" ref={cardRef}>
            {!parsedPlan && rawPlan && (
                <pre className="text-xs bg-base-200/70 rounded-xl p-3 whitespace-pre-wrap break-words mb-2 border border-base-300">{rawPlan}</pre>
            )}

            {parsedPlan && (
                <div className="rounded-2xl border border-base-200 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm overflow-hidden">

                    {tasks.length > 0 && (
                        <div className="px-4 pt-4 pb-2">
                            <div className="relative">
                                <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-base-300 via-base-300 to-transparent dark:from-base-600" />

                                <div className="space-y-1">
                                    {tasks.map((task, idx) => {
                                        const executionTask = execution?.tasks?.[task.id] || {};
                                        const status = String(executionTask?.status || task.status || "pending").toLowerCase();
                                        const isLast = idx === tasks.length - 1;
                                        const isTaskOpen = isExecutionLockedToActiveTask ? activeTaskId === task.id : (showQueryInputs ? true : openTaskId === task.id);
                                        const isActive = status === "in_progress";
                                        const isDone = status === "done" || status === "completed";
                                        const isError = status === "error" || status === "failed";
                                        const isPending = !isActive && !isDone && !isError;

                                        let iconEl: React.ReactNode;
                                        if (isActive) {
                                            iconEl = <Loader2 className="w-3.5 h-3.5 text-base-content/70 animate-spin" />;
                                        } else if (isDone) {
                                            iconEl = <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
                                        } else if (isError) {
                                            iconEl = <XCircle className="w-3.5 h-3.5 text-error" />;
                                        } else {
                                            iconEl = <Circle className="w-3.5 h-3.5 text-base-content/20" />;
                                        }

                                        const canExpand = task.task_description || executionTask?.result || executionTask?.error || executionTask?.reasoning || (task.human_query && !isExecuting) || showQueryInputs;

                                        return (
                                            <div
                                                key={task.id}
                                                ref={(node) => { taskRefs.current[task.id] = node; }}
                                                className={`relative flex gap-3 ${isLast ? "pb-1" : "pb-2"}`}
                                            >
                                                <div className="relative z-10 flex-shrink-0 w-7 flex items-start justify-center pt-[3px]">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                                        isActive ? "bg-base-200 dark:bg-base-700 ring-1 ring-base-300 dark:ring-base-600" :
                                                        isDone ? "bg-base-200/60 dark:bg-base-700/40 text-base-success" :
                                                        isError ? "bg-base-200/60 dark:bg-base-700/40 text-error" :
                                                        "bg-base-200 dark:bg-base-800"
                                                    }`}>
                                                        {iconEl}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <button
                                                        type="button"
                                                        className={`w-full text-left group transition-opacity ${
                                                            isPending ? "opacity-55 hover:opacity-80" : "opacity-100"
                                                        }`}
                                                        onClick={() => {
                                                            if (isExecutionLockedToActiveTask || !canExpand) return;
                                                            setOpenTaskId((prev) => (prev === task.id ? "" : task.id));
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between gap-2 py-0.5">
                                                            <div className="min-w-0">
                                                                <p className={`text-[13px] font-medium leading-snug truncate ${
                                                                    isDone ? "opacity-60" : ""
                                                                }`}>
                                                                    {executionTask?.title || task.title || "Untitled task"}
                                                                </p>
                                                                {task.task_description && !isTaskOpen && (
                                                                    <p className="text-[11px] opacity-55 truncate mt-0.5 font-normal">{task.task_description}</p>
                                                                )}
                                                            </div>
                                                            {canExpand && (
                                                                <ChevronDown className={`w-3.5 h-3.5 text-base-content/30 shrink-0 transition-transform duration-200 group-hover:text-base-content/60 ${isTaskOpen ? "rotate-180" : ""}`} />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {queryHistoryPerTask[task.id]?.length > 0 && !isExecuting && (
                                                        <div className="mt-2 space-y-3">
                                                            {queryHistoryPerTask[task.id].map((queryItem, idx) => (
                                                                <div key={idx} className="space-y-2">
                                                                    <div className="flex items-start gap-2 rounded-lg bg-base-200/70 dark:bg-base-700/40 border border-base-300/60 dark:border-base-600 px-3 py-2">
                                                                        <span className="text-base-content/60 font-bold text-xs shrink-0 mt-0.5">?</span>
                                                                        <span className="text-xs text-base-content/80 leading-relaxed">{queryItem.query}</span>
                                                                    </div>
                                                                    {queryItem.answer !== null ? (
                                                                        <div className="flex items-start gap-2 rounded-lg bg-base-200/50 dark:bg-base-700/30 border border-base-300/50 dark:border-base-600 px-3 py-2">
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-base-content/60 shrink-0 mt-0.5" />
                                                                            <span className="text-xs text-base-content/75">{queryItem.answer}</span>
                                                                        </div>
                                                                    ) : (
                                                                        (() => {
                                                                            const answerKey = `${task.id}_${idx}`;
                                                                            const options = Array.isArray(task.human_options) ? task.human_options.filter(Boolean) : [];
                                                                            const showCustomChoice = Boolean(task.allow_custom_response);
                                                                            const useCustomAnswer = Boolean(useCustomAnswerPerQuery[answerKey]);
                                                                            return (
                                                                                <div className="space-y-2.5">
                                                                                    {options.length > 0 && (
                                                                                        <div className="space-y-1.5">
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <Sparkles className="w-3 h-3 text-base-content/50" />
                                                                                                <p className="text-[10px] font-semibold text-base-content/55 uppercase tracking-wider">Suggested options</p>
                                                                                            </div>
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                {options.map((opt: string, optIndex: number) => {
                                                                                                    const isSelected = humanQueryAnswers[answerKey] === opt && !useCustomAnswer;
                                                                                                    return (
                                                                                                        <button
                                                                                                            key={`${answerKey}_opt_${optIndex}`}
                                                                                                            type="button"
                                                                                                            onClick={() => {
                                                                                                                setUseCustomAnswerPerQuery((prev) => ({ ...prev, [answerKey]: false }));
                                                                                                                setHumanQueryAnswers((prev) => ({ ...prev, [answerKey]: opt }));
                                                                                                            }}
                                                                                                            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer select-none transition-colors ${
                                                                                                                isSelected
                                                                                                                    ? "border-2 border-base-content bg-base-content text-base-100"
                                                                                                                    : "border border-base-content/25 bg-transparent text-base-content hover:border-base-content/50 hover:bg-base-200/40"
                                                                                                            }`}
                                                                                                        >
                                                                                                            {opt}
                                                                                                        </button>
                                                                                                    );
                                                                                                })}
                                                                                                {showCustomChoice && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => {
                                                                                                            setUseCustomAnswerPerQuery((prev) => ({ ...prev, [answerKey]: true }));
                                                                                                            setHumanQueryAnswers((prev) => ({ ...prev, [answerKey]: prev[answerKey] || "" }));
                                                                                                        }}
                                                                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer select-none transition-colors flex items-center gap-1.5 ${
                                                                                                            useCustomAnswer
                                                                                                                ? "border-2 border-base-content bg-base-content text-base-100"
                                                                                                                : "border border-base-content/25 bg-transparent text-base-content hover:border-base-content/50 hover:bg-base-200/40"
                                                                                                        }`}
                                                                                                    >
                                                                                                        <Pencil className="w-2.5 h-2.5" />
                                                                                                        Custom
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {(options.length === 0 || useCustomAnswer) && (
                                                                                        <input
                                                                                            type="text"
                                                                                            autoFocus={useCustomAnswer}
                                                                                            className="w-full text-xs rounded-lg border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-800 px-3 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 placeholder:text-base-content/30 transition-all"
                                                                                            placeholder={options.length > 0 ? "Type your custom response..." : "Your answer..."}
                                                                                            value={humanQueryAnswers[answerKey] || ""}
                                                                                            onChange={(e) => {
                                                                                                const value = e.target.value;
                                                                                                setHumanQueryAnswers((prev) => ({ ...prev, [answerKey]: value }));
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })()
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className={`overflow-hidden transition-all duration-200 ease-out ${
                                                        isTaskOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                                                    }`}>
                                                        <div className="space-y-2">
                                                            {task.task_description && (
                                                                <p className="text-[11.5px] leading-relaxed text-base-content/65">{task.task_description}</p>
                                                            )}
                                                            {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
                                                                <p className="text-[10px] text-base-content/50">
                                                                    <span className="font-semibold">Depends on:</span> {task.dependencies.join(", ")}
                                                                </p>
                                                            )}
                                                            {!isExecuting && showQueryInputs && (
                                                                <input
                                                                    type="text"
                                                                    className="w-full text-xs rounded-lg border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-800 px-3 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 placeholder:text-base-content/30 transition-all"
                                                                    placeholder={`Add a note for this task...`}
                                                                    value={taskQueries[task.id] || ""}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setTaskQueries((prev) => ({ ...prev, [task.id]: value }));
                                                                    }}
                                                                />
                                                            )}
                                                            {executionTask?.reasoning && (
                                                                <ReasoningAccordion
                                                                    reasoning={executionTask.reasoning}
                                                                    isStreaming={isActive || status === "running"}
                                                                    label="Task Reasoning"
                                                                    defaultOpen={isActive || status === "running"}
                                                                />
                                                            )}
                                                            {executionTask?.result && (
                                                                <div
                                                                    ref={(el) => { taskResultRefs.current[task.id] = el; }}
                                                                    className="text-[11.5px] rounded-xl p-3 max-h-36 overflow-auto whitespace-pre-wrap leading-relaxed border bg-base-200/60 dark:bg-base-700/30 border-base-300 dark:border-base-600 text-base-content/80"
                                                                >
                                                                    {isActive && (
                                                                        <div className="flex items-center gap-1.5 mb-1.5 text-base-content/60">
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Running</span>
                                                                        </div>
                                                                    )}
                                                                    {typeof executionTask.result === "string" ? executionTask.result : JSON.stringify(executionTask.result)}
                                                                </div>
                                                            )}
                                                            {executionTask?.error && (
                                                                <div className="text-[11.5px] bg-base-200/60 dark:bg-base-700/30 border border-base-300 dark:border-base-600 rounded-xl p-3 whitespace-pre-wrap text-base-content/75">
                                                                    {executionTask.error}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {isExecuting && tasks.length > 0 && (
                        <div className="px-4 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 rounded-full bg-base-200 dark:bg-base-700 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-700"
                                        style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-[10.5px] text-base-content/40 shrink-0">{doneCount}/{tasks.length}</span>
                            </div>
                        </div>
                    )}

                    {!isExecutionCompleted && isStreaming && (
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-base-200 dark:border-base-700">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-base-content/60" />
                            <span className="text-xs text-base-content/65">Planning tasks...</span>
                        </div>
                    )}

                    {!isExecutionCompleted && !isStreaming && (
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-base-200 dark:border-base-700 bg-base-50 dark:bg-base-800/50">
                            {showProceedButton && (
                                <button
                                    type="button"
                                    disabled={isActionLoading || (parsedPlan && tasks.length === 0)}
                                    title={(parsedPlan && tasks.length === 0) ? "Waiting for tasks to be generated" : undefined}
                                    onClick={() => handleAction("proceed")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-content hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {isActionLoading
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                                        : <><PlayCircle className="w-3.5 h-3.5" /> Proceed</>}
                                </button>
                            )}
                            {showUpdateButton && (
                                <button
                                    type="button"
                                    disabled={isActionLoading || isUpdatingPlan || (!allHumanQueriesAnswered && !hasTaskQueryValues)}
                                    onClick={() => handleAction("update")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-content hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {isActionLoading || isUpdatingPlan
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating</>
                                        : <><MessageSquare className="w-3.5 h-3.5" /> Update</>}
                                </button>
                            )}
                            {showProceedButton && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = !showQueryInputs;
                                        setShowQueryInputs(next);
                                        if (next) setOpenTaskId("");
                                    }}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                                        showQueryInputs
                                            ? "bg-base-200 dark:bg-base-700 border-base-300 dark:border-base-600 text-base-content/70"
                                            : "bg-base-100 dark:bg-base-800 border-base-200 dark:border-base-700 text-base-content/50 hover:border-base-300 hover:text-base-content/80"
                                    }`}
                                >
                                    <Pencil className="w-3 h-3" />
                                    {showQueryInputs ? "Cancel" : "Suggest changes"}
                                </button>
                            )}
                            {hasFailedTasks && !isActionLoading && !isUpdatingPlan && (
                                <button
                                    type="button"
                                    onClick={() => handleAction("proceed")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-base-300 dark:border-base-600 text-base-content hover:bg-base-200/50 dark:hover:bg-base-700/40 transition-all"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Retry failed
                                </button>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
