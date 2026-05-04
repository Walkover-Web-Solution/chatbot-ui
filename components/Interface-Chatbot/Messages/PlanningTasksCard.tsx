import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { CheckCircle2, ChevronDown, Circle, Loader2, MessageSquare, PauseCircle, Pencil, PlayCircle, RotateCcw, Sparkles, XCircle } from "lucide-react";
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
    const [openTaskId, setOpenTaskId] = useState("");
    const [queryHistoryPerTask, setQueryHistoryPerTask] = useState<Record<string, Array<{ query: string; answer: string | null }>>>({});
    const [useCustomAnswerPerQuery, setUseCustomAnswerPerQuery] = useState<Record<string, boolean>>({});
    const [isActionLoading, setIsActionLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const prevHumanQueriesRef = useRef<Record<string, string>>({});

    const { parsedPlan, rawPlan, execution, planState } = useMemo(() => {
        if (plan === null || plan === undefined) {
            return { parsedPlan: null, rawPlan: "", execution: null, planState: null };
        }
        if (typeof plan === "string") {
            try {
                const parsed = JSON.parse(plan);
                return { parsedPlan: parsed, rawPlan: plan, execution: parsed?.execution || null, planState: parsed?.state || null };
            } catch {
                return { parsedPlan: null, rawPlan: plan, execution: null, planState: null };
            }
        }
        const parsedPlan = plan?.plan || plan;
        return { parsedPlan, rawPlan: JSON.stringify(parsedPlan, null, 2), execution: plan?.execution || null, planState: (plan?.plan || parsedPlan)?.state || null };
    }, [plan]);

    // Detect new backend format: { message_to_user, plan, questions }
    const isNewFormat = Boolean(parsedPlan && typeof parsedPlan === "object" && ("message_to_user" in parsedPlan || "questions" in parsedPlan));
    // For new format the actual plan (with tasks) lives at parsedPlan.plan
    const effectivePlan = isNewFormat ? parsedPlan?.plan : parsedPlan;

    const tasks = useMemo(() => {
        const src = isNewFormat ? parsedPlan?.plan?.tasks : parsedPlan?.tasks;
        if (!src) return [];
        if (Array.isArray(src)) return src;
        if (typeof src === "object") {
            return Object.entries(src).map(([key, value]: [string, any]) => ({ id: key, ...(value || {}) }));
        }
        return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedPlan, isNewFormat]);

    const activeTaskId = useMemo(() => {
        if (!execution?.tasks || typeof execution.tasks !== "object") return "";
        const runningTask = Object.entries(execution.tasks).find(([, value]: [string, any]) => value?.status === "in_progress");
        return runningTask?.[0] || "";
    }, [execution]);

    const hasTaskQueryValues = useMemo(
        () => Object.values(taskQueries).some((v) => v?.trim().length > 0),
        [taskQueries],
    );

    const humanQueryTasks = useMemo(() => tasks.filter((t) => t.status === "waiting_for_user" && t.human_query && !t.human_response), [tasks]);

    const humanQueriesKey = useMemo(() => {
        return JSON.stringify(humanQueryTasks.map(t => ({ id: t.id, query: t.human_query })));
    }, [humanQueryTasks]);

    const allHumanQueriesAnswered = useMemo(() => {
        // Check humanQueryTasks (from parsedPlan)
        if (humanQueryTasks.length > 0) {
            return humanQueryTasks.every((t) => {
                return humanQueryAnswers[`${t.id}_0`]?.trim().length > 0;
            });
        }
        // When paused via execution.tasks (e.g. task has human_response already set in parsedPlan but execution still tracks it)
        if (execution?.state === "paused" && execution?.tasks) {
            const waitingEntries = Object.entries(execution.tasks).filter(([, t]: [string, any]) => t?.status === "waiting_for_user");
            if (waitingEntries.length > 0) {
                return waitingEntries.every(([taskId]) => humanQueryAnswers[`${taskId}_0`]?.trim().length > 0);
            }
        }
        return true;
    }, [humanQueryTasks, humanQueryAnswers, execution]);

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

    const hasHumanQueries = humanQueryTasks.length > 0;
    const isPaused = planState === "paused" || hasHumanQueries || execution?.state === "paused";
    const isExecuting = !isPaused && (execution?.state === "executing" || execution?.state === "running" || execution?.state === "queued");
    const isUpdatingPlan = execution?.state === "updating";
    const isExecutionCompleted = execution?.state === "completed";
    const isExecutionLockedToActiveTask = isExecuting && Boolean(activeTaskId);
    // True only when execution phase definitively started — execution/running/executing/queued/completed/error states
    // OR when execution.tasks has any task with a non-pending status (including waiting_for_user set during execution)
    // "paused" alone does NOT confirm execution started (it can be set during planning phase too)
    const executionHasStarted = Boolean(
        execution?.state === "executing" ||
        execution?.state === "running" ||
        execution?.state === "queued" ||
        execution?.state === "completed" ||
        execution?.state === "error" ||
        (execution?.tasks && Object.values(execution.tasks).some((t: any) =>
            t?.status === "done" || t?.status === "in_progress" || t?.status === "error" || t?.status === "waiting_for_user"
        ))
    );
    const isExecutionPaused = executionHasStarted && (execution?.state === "paused" || isPaused);
    // Paused because a task failed during EXECUTION (no human query pending) — needs retry, not respond
    // Only true when execution has definitively started AND we have execution-level task failure evidence
    const isPausedDueToError = isExecutionPaused && !hasHumanQueries && Boolean(
        execution?.tasks && Object.values(execution.tasks).some((t: any) =>
            t?.status === "error" || t?.status === "failed" || t?.is_error
        )
    );
    const showProceedButton = !isPaused && !hasTaskQueryValues && !isExecuting && !isActionLoading && !isUpdatingPlan && !isStreaming;
    const showUpdateButton = isPaused || hasHumanQueries;

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

    // When a task's human_response is set (task completed after answering),
    // fill in the queryHistoryPerTask answer so options don't stay interactive
    useEffect(() => {
        tasks.forEach((t) => {
            if (t.human_response && t.human_query) {
                setQueryHistoryPerTask((prev) => {
                    const existing = prev[t.id];
                    if (!existing || existing.length === 0) return prev;
                    // Check if the last entry still has answer: null
                    const lastIdx = existing.length - 1;
                    if (existing[lastIdx].answer !== null) return prev;
                    const updated = [...existing];
                    updated[lastIdx] = { ...updated[lastIdx], answer: t.human_response };
                    return { ...prev, [t.id]: updated };
                });
            }
        });
    }, [tasks]);

    useEffect(() => {
        // Clear stale answers only when execution phase starts (approve/execute), not on plan update
        if (isExecuting) {
            setIsActionLoading(false);
            setHumanQueryAnswers({});
            setUseCustomAnswerPerQuery({});
        }
    }, [isExecuting]);

    useEffect(() => {
        // Clear loading state when a new plan arrives (e.g. done event response)
        setIsActionLoading(false);
    }, [parsedPlan]);

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

    // New format with no inner plan yet (questions-only phase) — AssistantMessage handles rendering
    if (isNewFormat && !effectivePlan) return null;
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
            // If paused due to task error — retry execution
            if (isPausedDueToError) {
                const payload = { parsedPlan, rawPlan };
                if (onAction) {
                    onAction("proceed", payload);
                } else {
                    emitEventToParent("PLANNING_ACTION", { action: "execute", plan: parsedPlan || rawPlan, ...payload });
                }
                return;
            }

            // If plan is paused during execution, respond with the human answer
            // Find waiting task from humanQueryTasks or execution.tasks
            const executionWaitingTask = !humanQueryTasks.length && execution?.tasks
                ? Object.entries(execution.tasks).find(([, t]: [string, any]) => t?.status === "waiting_for_user")
                : null;
            const pausedWaitingTask = humanQueryTasks.length > 0 ? humanQueryTasks[0] : null;
            const waitingTaskId = pausedWaitingTask?.id || executionWaitingTask?.[0];
            const waitingTaskData = pausedWaitingTask || (executionWaitingTask ? tasks.find(t => t.id === executionWaitingTask[0]) : null);

            if (isExecutionPaused && waitingTaskId) {
                const answer = humanQueryAnswers[`${waitingTaskId}_0`]?.trim() || "";
                const humanQueryAnswersMap: Record<string, string> = { [waitingTaskId]: answer };
                const payload = {
                    parsedPlan,
                    rawPlan,
                    humanQueryAnswers: humanQueryAnswersMap,
                };
                if (onAction) {
                    onAction("respond", payload);
                } else {
                    emitEventToParent("PLANNING_ACTION", { action: "respond", task_id: waitingTaskId, answer, ...payload });
                }
                return;
            }

            // Collect answers for human queries and user suggestions
            const messages: string[] = [];
            
            // Collect answers for current waiting human query tasks
            humanQueryTasks.forEach((t) => {
                const answer = humanQueryAnswers[`${t.id}_0`]?.trim();
                if (answer) {
                    messages.push(`task_id:${t.id}, answer:${answer}`);
                }
            });
            
            // Collect user suggestions/queries for all tasks
            tasks.forEach((t) => {
                const query = taskQueries[t.id]?.trim();
                if (query) {
                    messages.push(`task_id:${t.id}, query:${query}`);
                }
            });
            
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
        <div className="mb-3 w-full not-prose" ref={cardRef}>
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
                                        const isWaitingForUser = isPaused && status === "waiting_for_user";
                                        const isPending = !isActive && !isDone && !isError && !isWaitingForUser;

                                        let iconEl: React.ReactNode;
                                        if (isActive) {
                                            iconEl = <Loader2 className="w-3.5 h-3.5 text-base-content/70 animate-spin" />;
                                        } else if (isDone) {
                                            iconEl = <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
                                        } else if (isError) {
                                            iconEl = <XCircle className="w-3.5 h-3.5 text-error" />;
                                        } else if (isWaitingForUser) {
                                            iconEl = <PauseCircle className="w-3.5 h-3.5 text-warning" />;
                                        } else {
                                            iconEl = <Circle className="w-3.5 h-3.5 text-base-content/20" />;
                                        }

                                        const taskError = executionTask?.error || (task as any)?.error;
                                        const taskDesc = task.task_description;
                                        const canExpand = taskDesc || executionTask?.result || taskError || executionTask?.reasoning || (task.human_query && !isExecuting) || showQueryInputs;

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
                                                        isWaitingForUser ? "bg-warning/10 dark:bg-warning/15 ring-1 ring-warning/30" :
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
                                                                {taskDesc && !isTaskOpen && !isError && (
                                                                    <p className="text-[11px] opacity-55 truncate mt-0.5 font-normal">{taskDesc}</p>
                                                                )}
                                                                {isError && taskError && !isTaskOpen && (
                                                                    <p className="text-[11px] text-error/80 truncate mt-0.5 font-normal">{taskError}</p>
                                                                )}
                                                            </div>
                                                            {canExpand && (
                                                                <ChevronDown className={`w-3.5 h-3.5 text-base-content/30 shrink-0 transition-transform duration-200 group-hover:text-base-content/60 ${isTaskOpen ? "rotate-180" : ""}`} />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {isWaitingForUser && task.human_query && (
                                                        <div className="mt-2 space-y-2">
                                                            <div className="flex items-start gap-2 rounded-lg bg-warning/8 dark:bg-warning/10 border border-warning/25 px-3 py-2">
                                                                <span className="text-warning font-bold text-xs shrink-0 mt-0.5">?</span>
                                                                <span className="text-xs text-base-content/80 leading-relaxed">{task.human_query}</span>
                                                            </div>
                                                            {(() => {
                                                                const answerKey = `${task.id}_0`;
                                                                const options = Array.isArray(task.human_options) ? task.human_options.filter(Boolean) : [];
                                                                const showCustomChoice = Boolean(task.allow_custom_response);
                                                                const useCustomAnswer = Boolean(useCustomAnswerPerQuery[answerKey]);
                                                                return (
                                                                    <div className="space-y-2">
                                                                        {options.length > 0 && (
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
                                                                                                if (!queryHistoryPerTask[task.id]?.length) {
                                                                                                    setQueryHistoryPerTask((prev) => ({ ...prev, [task.id]: [{ query: task.human_query, answer: null }] }));
                                                                                                }
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
                                                                        )}
                                                                        {(options.length === 0 || useCustomAnswer) && (
                                                                            <input
                                                                                type="text"
                                                                                autoFocus={useCustomAnswer || options.length === 0}
                                                                                className="w-full text-xs rounded-lg border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-800 px-3 py-2 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 placeholder:text-base-content/30 transition-all"
                                                                                placeholder={options.length > 0 ? "Type your custom response..." : "Your answer..."}
                                                                                value={humanQueryAnswers[answerKey] || ""}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    setHumanQueryAnswers((prev) => ({ ...prev, [answerKey]: value }));
                                                                                    if (!queryHistoryPerTask[task.id]?.length) {
                                                                                        setQueryHistoryPerTask((prev) => ({ ...prev, [task.id]: [{ query: task.human_query, answer: null }] }));
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}

                                                    {queryHistoryPerTask[task.id]?.length > 0 && !isExecuting && !isWaitingForUser && (
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
                                                                    ) : !isWaitingForUser ? null : (
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
                                                            {taskDesc && (
                                                                <p className="text-[11.5px] leading-relaxed text-base-content/65">{taskDesc}</p>
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
                                                            {taskError && (
                                                                <div className="text-[11.5px] bg-error/8 dark:bg-error/10 border border-error/25 rounded-xl p-3 whitespace-pre-wrap text-error/90 flex items-start gap-2">
                                                                    <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-error" />
                                                                    <span>{taskError}</span>
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

                    {!isExecutionCompleted && isStreaming && !hasHumanQueries && !isExecutionPaused && (
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-base-200 dark:border-base-700">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-base-content/60" />
                            <span className="text-xs text-base-content/65">Planning tasks...</span>
                        </div>
                    )}

                    {!isExecutionCompleted && (isStreaming ? (hasHumanQueries || isExecutionPaused) : true) && (
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-base-200 dark:border-base-700 bg-base-50 dark:bg-base-800/50 sticky bottom-0 z-10">
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
                                    disabled={isActionLoading || isUpdatingPlan || (isStreaming && !hasHumanQueries && !isExecutionPaused) || (!isPausedDueToError && !allHumanQueriesAnswered && !hasTaskQueryValues)}
                                    onClick={() => handleAction("update")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-content hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {isActionLoading || isUpdatingPlan
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {isPausedDueToError ? "Retrying..." : isExecutionPaused ? "Responding..." : "Updating"}</>
                                        : isPausedDueToError
                                            ? <><PlayCircle className="w-3.5 h-3.5" /> Retry</>
                                            : isExecutionPaused
                                                ? <><MessageSquare className="w-3.5 h-3.5" /> Respond</>
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
