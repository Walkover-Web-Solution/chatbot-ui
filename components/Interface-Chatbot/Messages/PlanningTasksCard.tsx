import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { CheckCircle2, ChevronDown, Circle, Loader2, MessageSquare, PlayCircle, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

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
    const showProceedButton = !hasHumanQueries && !hasTaskQueryValues && !isExecuting && !isActionLoading && !isStreaming;
    const showUpdateButton = (hasHumanQueries || hasTaskQueryValues) && !isExecuting && !isStreaming;

    const doneCount = useMemo(() => {
        if (!execution?.tasks) return 0;
        return Object.values(execution.tasks).filter((t: any) => t?.status === "done").length;
    }, [execution]);

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
                <pre className="text-xs bg-base-200/70 rounded-lg p-3 whitespace-pre-wrap break-words mb-2">{rawPlan}</pre>
            )}

            {parsedPlan && (
                <>

                    {tasks.length > 0 && (
                        <div className="relative">
                            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-base-300" />

                            <div className="space-y-0">
                                {tasks.map((task, idx) => {
                                    const executionTask = execution?.tasks?.[task.id] || {};
                                    const status = String(executionTask?.status || task.status || "pending").toLowerCase();
                                    const isLast = idx === tasks.length - 1;
                                    const isTaskOpen = isExecutionLockedToActiveTask ? activeTaskId === task.id : (showQueryInputs ? true : openTaskId === task.id);

                                    let iconEl: React.ReactNode;
                                    let rowClass = "opacity-50";
                                    if (status === "in_progress") {
                                        iconEl = <Loader2 className="w-[14px] h-[14px] text-primary animate-spin" />;
                                        rowClass = "opacity-100";
                                    } else if (status === "done") {
                                        iconEl = <CheckCircle2 className="w-[14px] h-[14px] text-success" />;
                                        rowClass = "opacity-100";
                                    } else if (status === "error") {
                                        iconEl = <XCircle className="w-[14px] h-[14px] text-error" />;
                                        rowClass = "opacity-100";
                                    } else {
                                        iconEl = <Circle className="w-[14px] h-[14px] text-base-content/30" />;
                                    }

                                    return (
                                        <div
                                            key={task.id}
                                            ref={(node) => { taskRefs.current[task.id] = node; }}
                                            className={`relative flex gap-3 ${isLast ? "pb-1" : "pb-3"}`}
                                        >
                                            <div className="relative z-10 flex-shrink-0 w-[23px] flex items-start justify-center pt-[3px]">
                                                <div className="w-[23px] h-[23px] rounded-full bg-base-100 flex items-center justify-center">
                                                    {iconEl}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <button
                                                    type="button"
                                                    className={`w-full text-left group ${rowClass}`}
                                                    onClick={() => {
                                                        if (isExecutionLockedToActiveTask) return;
                                                        setOpenTaskId((prev) => (prev === task.id ? "" : task.id));
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-medium leading-snug truncate ${status === "done" ? "opacity-60" : ""}`}>
                                                                {executionTask?.title || task.title || "Untitled task"}
                                                            </p>
                                                            {task.task_description && !isTaskOpen && (
                                                                <p className="text-[11px] opacity-50 truncate mt-0.5">{task.task_description}</p>
                                                            )}
                                                        </div>
                                                        {(task.task_description || executionTask?.result || executionTask?.error || (task.human_query && !isExecuting) || showQueryInputs) && (
                                                            <ChevronDown className={`w-3.5 h-3.5 opacity-30 shrink-0 transition-transform group-hover:opacity-60 ${isTaskOpen ? "rotate-180" : ""}`} />
                                                        )}
                                                    </div>
                                                </button>

                                                {queryHistoryPerTask[task.id]?.length > 0 && !isExecuting && (
                                                    <div className="mt-2 space-y-2">
                                                        {queryHistoryPerTask[task.id].map((queryItem, idx) => (
                                                            <div key={idx} className="space-y-1.5">
                                                                <div className="flex items-start gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400">
                                                                    <span className="font-semibold shrink-0">?</span>
                                                                    <span>{queryItem.query}</span>
                                                                </div>
                                                                {queryItem.answer !== null ? (
                                                                    <div className="flex items-start gap-1.5 text-[11px] text-success">
                                                                        <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                                                                        <span className="opacity-80">{queryItem.answer}</span>
                                                                    </div>
                                                                ) : (
                                                                    (() => {
                                                                        const answerKey = `${task.id}_${idx}`;
                                                                        const options = Array.isArray(task.human_options) ? task.human_options.filter(Boolean) : [];
                                                                        const showCustomChoice = Boolean(task.allow_custom_response);
                                                                        const useCustomAnswer = Boolean(useCustomAnswerPerQuery[answerKey]);
                                                                        return (
                                                                            <div className="space-y-2">
                                                                                {options.length > 0 && (
                                                                                    <div className="space-y-1.5">
                                                                                        <p className="text-[10px] uppercase tracking-wide opacity-50">These are options from AI</p>
                                                                                        <div className="flex flex-wrap gap-1.5">
                                                                                            {options.map((opt: string, optIndex: number) => {
                                                                                                const isSelected = humanQueryAnswers[answerKey] === opt && !useCustomAnswer;
                                                                                                return (
                                                                                                    <button
                                                                                                        key={`${answerKey}_opt_${optIndex}`}
                                                                                                        type="button"
                                                                                                        className={`btn btn-xs ${isSelected ? "btn-primary" : "btn-outline"}`}
                                                                                                        onClick={() => {
                                                                                                            setUseCustomAnswerPerQuery((prev) => ({ ...prev, [answerKey]: false }));
                                                                                                            setHumanQueryAnswers((prev) => ({ ...prev, [answerKey]: opt }));
                                                                                                        }}
                                                                                                    >
                                                                                                        {opt}
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                            {showCustomChoice && (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className={`btn btn-xs ${useCustomAnswer ? "btn-primary" : "btn-outline"}`}
                                                                                                    onClick={() => {
                                                                                                        setUseCustomAnswerPerQuery((prev) => ({ ...prev, [answerKey]: true }));
                                                                                                        setHumanQueryAnswers((prev) => ({ ...prev, [answerKey]: prev[answerKey] || "" }));
                                                                                                    }}
                                                                                                >
                                                                                                    Custom
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {(options.length === 0 || useCustomAnswer) && (
                                                                                    <input
                                                                                        type="text"
                                                                                        className="input input-bordered input-xs w-full text-xs"
                                                                                        placeholder={options.length > 0 ? "Enter custom response..." : "Your answer..."}
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

                                                {isTaskOpen && (
                                                    <div className="mt-2 space-y-1.5">
                                                        {task.task_description && (
                                                            <p className="text-[11px] leading-relaxed opacity-60">{task.task_description}</p>
                                                        )}
                                                        {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
                                                            <p className="text-[10px] opacity-40">
                                                                <span className="font-semibold">Depends on:</span> {task.dependencies.join(", ")}
                                                            </p>
                                                        )}
                                                        {!isExecuting && showQueryInputs && (
                                                            <input
                                                                type="text"
                                                                className="input input-bordered input-xs w-full text-xs"
                                                                placeholder={`Note for ${task.id}...`}
                                                                value={taskQueries[task.id] || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setTaskQueries((prev) => ({ ...prev, [task.id]: value }));
                                                                }}
                                                            />
                                                        )}
                                                        {executionTask?.result && (
                                                            <div 
                                                                ref={(el) => { taskResultRefs.current[task.id] = el; }}
                                                                className={`text-[11px] rounded p-2 max-h-32 overflow-auto whitespace-pre-wrap ${
                                                                    executionTask.status === "running" 
                                                                        ? "bg-blue-500/8 border border-blue-500/20 opacity-90" 
                                                                        : "bg-success/8 border border-success/20 opacity-80"
                                                                }`}
                                                            >
                                                                {executionTask.status === "running" && (
                                                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                        <span className="text-[10px] font-semibold">Running...</span>
                                                                    </div>
                                                                )}
                                                                {typeof executionTask.result === "string" ? executionTask.result : JSON.stringify(executionTask.result)}
                                                            </div>
                                                        )}
                                                        {executionTask?.error && (
                                                            <div className="text-[11px] bg-error/8 border border-error/20 rounded p-2 whitespace-pre-wrap text-error">
                                                                {executionTask.error}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isExecuting && tasks.length > 0 && (
                        <p className="text-[11px] opacity-40 mt-2 ml-[35px]">
                            {doneCount} of {tasks.length} done
                        </p>
                    )}

                    {!isExecutionCompleted && isStreaming && (
                        <div className="flex items-center gap-2 text-xs opacity-50 py-1 mt-3">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Planning tasks...</span>
                        </div>
                    )}

                    {!isExecutionCompleted && !isStreaming && (
                        <div className="flex items-center gap-2 mt-4">
                            {showProceedButton && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    disabled={isActionLoading || (parsedPlan && tasks.length === 0)}
                                    title={(parsedPlan && tasks.length === 0) ? "Waiting for tasks to be generated" : undefined}
                                    onClick={() => handleAction("proceed")}
                                >
                                    {isActionLoading 
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                                        : <><PlayCircle className="w-3.5 h-3.5" /> Proceed</>}
                                </button>
                            )}
                            {showUpdateButton && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    disabled={isActionLoading || isUpdatingPlan || (!allHumanQueriesAnswered && !hasTaskQueryValues)}
                                    onClick={() => handleAction("update")}
                                >
                                    {isActionLoading || isUpdatingPlan
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating</>
                                        : <><MessageSquare className="w-3.5 h-3.5" /> Update</>}
                                </button>
                            )}
                            {showProceedButton && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-ghost opacity-60 hover:opacity-100"
                                    onClick={() => {
                                        const next = !showQueryInputs;
                                        setShowQueryInputs(next);
                                        if (next) {
                                            setOpenTaskId("");
                                        }
                                    }}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {showQueryInputs ? "Cancel" : "Suggest changes"}
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
