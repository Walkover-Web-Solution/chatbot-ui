import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { CheckCircle2, ChevronDown, Circle, Loader2, PauseCircle, Pencil, PlayCircle, RotateCcw, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReasoningAccordion from "./ReasoningAccordion";

interface PlanningTasksCardProps {
    plan: any;
    isStreaming?: boolean;
    onAction?: (action: "proceed" | "revise", payload: { parsedPlan: any; rawPlan: string; taskQueries?: Record<string, string>; queryMessage?: string; updateMessage?: string }) => void;
}

export default function PlanningTasksCard({ plan, isStreaming = false, onAction }: PlanningTasksCardProps) {
    const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const taskResultRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showQueryInputs, setShowQueryInputs] = useState(false);
    const [taskQueries, setTaskQueries] = useState<Record<string, string>>({});
    const [openTaskId, setOpenTaskId] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

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

    const isPaused = planState === "paused" || execution?.state === "paused";
    const isExecuting = !isPaused && (execution?.state === "executing" || execution?.state === "running" || execution?.state === "queued");
    const isUpdatingPlan = execution?.state === "updating";
    const isExecutionCompleted = execution?.state === "completed";
    const isExecutionLockedToActiveTask = isExecuting && Boolean(activeTaskId);
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
    const isPausedDueToError = isExecutionPaused && Boolean(
        execution?.tasks && Object.values(execution.tasks).some((t: any) =>
            t?.status === "error" || t?.status === "failed" || t?.is_error
        )
    );
    // When execution is paused waiting for human query, questions are shown via executionQuery card —
    // hide the Update button here to avoid double-submit UI
    const isWaitingForHumanQuery = isExecutionPaused && !isPausedDueToError;
    const showProceedButton = !isPaused && !hasTaskQueryValues && !isExecuting && !isActionLoading && !isUpdatingPlan && !isStreaming;
    const showUpdateButton = (isPaused && !isWaitingForHumanQuery) || hasTaskQueryValues;

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
        if (isExecuting) {
            setIsActionLoading(false);
        }
    }, [isExecuting]);

    useEffect(() => {
        setIsActionLoading(false);
    }, [parsedPlan]);

    useEffect(() => {
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

    // New format with no inner plan yet (questions-only phase) — AssistantMessage handles rendering
    if (isNewFormat && !effectivePlan) return null;
    if (!parsedPlan && !rawPlan) return null;
    if (tasks.length === 0 && !rawPlan) return null;

    const handleAction = (action: "proceed" | "update") => {
        setIsActionLoading(true);

        if (action === "proceed") {
            const payload = { parsedPlan, rawPlan };
            if (onAction) {
                onAction("proceed", payload);
            } else {
                emitEventToParent("PLANNING_ACTION", { action: "execute", plan: parsedPlan || rawPlan, ...payload });
            }
            return;
        }

        if (action === "update") {
            if (isPausedDueToError) {
                const payload = { parsedPlan, rawPlan };
                if (onAction) {
                    onAction("proceed", payload);
                } else {
                    emitEventToParent("PLANNING_ACTION", { action: "execute", plan: parsedPlan || rawPlan, ...payload });
                }
                return;
            }

            const messages: string[] = [];
            tasks.forEach((t) => {
                const query = taskQueries[t.id]?.trim();
                if (query) {
                    messages.push(`task_id:${t.id}, query:${query}`);
                }
            });
            const message = messages.join("\n");
            const payload = { parsedPlan, rawPlan, updateMessage: message };

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
                <pre className="text-xs bg-base-200/70 dark:bg-base-800/80 rounded-xl p-3 whitespace-pre-wrap break-words mb-2 border border-base-300 dark:border-base-600 dark:text-base-content/80">{rawPlan}</pre>
            )}

            {parsedPlan && (
                <div className="rounded-2xl border border-base-300 dark:border-base-500 bg-base-100 dark:bg-base-800 shadow-sm overflow-hidden">

                    {tasks.length > 0 && (
                        <div className="px-4 pt-4 pb-2">
                            <div className="relative">
                                <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-base-300 via-base-300 to-transparent dark:from-base-500 dark:via-base-500" />

                                <div className="space-y-1">
                                    {tasks.map((task, idx) => {
                                        const executionTask = execution?.tasks?.[task.id] || {};
                                        const status = String(executionTask?.status || task.status || "pending").toLowerCase();
                                        const isLast = idx === tasks.length - 1;
                                        const isTaskOpen = isExecutionLockedToActiveTask ? activeTaskId === task.id : (showQueryInputs ? true : openTaskId === task.id);
                                        const isActive = status === "in_progress";
                                        const isDone = status === "done" || status === "completed";
                                        const isError = status === "error" || status === "failed";
                                        const isWaitingForUser = status === "waiting_for_user";
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
                                            iconEl = <Circle className="w-3.5 h-3.5 text-base-content/25 dark:text-base-content/40" />;
                                        }

                                        const taskError = executionTask?.error || (task as any)?.error;
                                        const taskDesc = task.task_description;
                                        const canExpand = taskDesc || executionTask?.result || taskError || executionTask?.reasoning || showQueryInputs;

                                        return (
                                            <div
                                                key={task.id}
                                                ref={(node) => { taskRefs.current[task.id] = node; }}
                                                className={`relative flex gap-3 ${isLast ? "pb-1" : "pb-2"}`}
                                            >
                                                <div className="relative z-10 flex-shrink-0 w-7 flex items-start justify-center pt-[3px]">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                                        isActive ? "bg-base-200 dark:bg-base-600 ring-1 ring-base-300 dark:ring-base-500" :
                                                        isDone ? "bg-base-200/60 dark:bg-base-600/60" :
                                                        isError ? "bg-base-200/60 dark:bg-base-600/60 text-error" :
                                                        isWaitingForUser ? "bg-warning/10 dark:bg-warning/20 ring-1 ring-warning/40" :
                                                        "bg-base-200 dark:bg-base-700"
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
                                                                    isDone ? "opacity-60 dark:opacity-70" : "dark:text-base-content"
                                                                }`}>
                                                                    {executionTask?.title || task.title || "Untitled task"}
                                                                </p>
                                                                {taskDesc && !isTaskOpen && !isError && (
                                                                    <p className="text-[11px] text-base-content/55 dark:text-base-content/65 truncate mt-0.5 font-normal">{taskDesc}</p>
                                                                )}
                                                                {isError && taskError && !isTaskOpen && (
                                                                    <p className="text-[11px] text-error/80 truncate mt-0.5 font-normal">{taskError}</p>
                                                                )}
                                                            </div>
                                                            {canExpand && (
                                                                <ChevronDown className={`w-3.5 h-3.5 text-base-content/30 dark:text-base-content/50 shrink-0 transition-transform duration-200 group-hover:text-base-content/60 ${isTaskOpen ? "rotate-180" : ""}`} />
                                                            )}
                                                        </div>
                                                    </button>

                                                    <div className={`overflow-hidden transition-all duration-200 ease-out ${
                                                        isTaskOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                                                    }`}>
                                                        <div className="space-y-2">
                                                            {taskDesc && (
                                                                <p className="text-[11.5px] leading-relaxed text-base-content/65 dark:text-base-content/75">{taskDesc}</p>
                                                            )}
                                                            {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
                                                                <p className="text-[10px] text-base-content/50 dark:text-base-content/60">
                                                                    <span className="font-semibold">Depends on:</span> {task.dependencies.join(", ")}
                                                                </p>
                                                            )}
                                                            {!isExecuting && showQueryInputs && (
                                                                <input
                                                                    type="text"
                                                                    className="w-full text-xs rounded-lg border border-base-300 dark:border-base-500 bg-base-100 dark:bg-base-700 text-base-content dark:text-base-content px-3 py-2 outline-none focus:border-primary/60 dark:focus:border-base-400 focus:ring-2 focus:ring-primary/10 placeholder:text-base-content/35 dark:placeholder:text-base-content/40 transition-all"
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
                                                                    className="text-[11.5px] rounded-xl p-3 max-h-36 overflow-auto whitespace-pre-wrap leading-relaxed border bg-base-200/60 dark:bg-base-700/60 border-base-300 dark:border-base-500 text-base-content/80 dark:text-base-content/85"
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
                                <div className="flex-1 h-1 rounded-full bg-base-200 dark:bg-base-600 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-700"
                                        style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-[10.5px] text-base-content/50 dark:text-base-content/70 shrink-0">{doneCount}/{tasks.length}</span>
                            </div>
                        </div>
                    )}

                    {!isExecutionCompleted && (isStreaming ? isExecutionPaused : true) && (showProceedButton || showUpdateButton || hasFailedTasks) && (
                        <div className="flex items-center gap-2 px-4 py-3 border-t border-base-200 dark:border-base-600 bg-base-50 dark:bg-base-700/80 sticky bottom-0 z-10">
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
                                    disabled={isActionLoading || isUpdatingPlan || (isStreaming && !isExecutionPaused) || !hasTaskQueryValues}
                                    onClick={() => handleAction("update")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-content hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {isActionLoading || isUpdatingPlan
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {isPausedDueToError ? "Retrying..." : "Updating..."}</>
                                        : isPausedDueToError
                                            ? <><PlayCircle className="w-3.5 h-3.5" /> Retry</>
                                            : <><Pencil className="w-3.5 h-3.5" /> Update</>}
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
                                            ? "bg-base-200 dark:bg-base-600 border-base-300 dark:border-base-500 text-base-content/80 dark:text-base-content/80"
                                            : "bg-base-100 dark:bg-base-700 border-base-200 dark:border-base-600 text-base-content/60 dark:text-base-content/60 hover:border-base-300 dark:hover:border-base-500 hover:text-base-content/80"
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
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-base-300 dark:border-base-500 text-base-content dark:text-base-content hover:bg-base-200/50 dark:hover:bg-base-600/50 transition-all"
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
