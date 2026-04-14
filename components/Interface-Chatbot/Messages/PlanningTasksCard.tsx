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
    const [showQueryInputs, setShowQueryInputs] = useState(false);
    const [taskQueries, setTaskQueries] = useState<Record<string, string>>({});
    const [humanQueryAnswers, setHumanQueryAnswers] = useState<Record<string, string>>({});
    const [resolvedHumanQueryIds, setResolvedHumanQueryIds] = useState<Set<string>>(new Set());
    const [openTaskId, setOpenTaskId] = useState("");
    const cardRef = useRef<HTMLDivElement>(null);

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

    const allHumanQueriesAnswered = useMemo(
        () => humanQueryTasks.length === 0 || humanQueryTasks.every((t) => humanQueryAnswers[t.id]?.trim().length > 0),
        [humanQueryTasks, humanQueryAnswers],
    );

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
    const showUpdateButton = hasTaskQueryValues || isUpdatingPlan;

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

    if (!parsedPlan && !rawPlan) return null;

    const handleAction = (action: "proceed" | "revise") => {
        const pendingHumanQueryTasks = humanQueryTasks.filter((t) => !resolvedHumanQueryIds.has(t.id));
        const hasHumanQueries = pendingHumanQueryTasks.length > 0;
        const resolvedAction = action === "proceed" && hasHumanQueries ? "respond" : action;

        if (resolvedAction === "respond") {
            const answeredPendingIds = pendingHumanQueryTasks
                .filter((t) => humanQueryAnswers[t.id]?.trim())
                .map((t) => t.id);
            const remainingAfterResolve = pendingHumanQueryTasks.length - answeredPendingIds.length;
            setResolvedHumanQueryIds((prev) => new Set([...prev, ...answeredPendingIds]));
            const payload = {
                parsedPlan,
                rawPlan,
                humanQueryAnswers,
                humanQueryMessage,
                resolvedAfter: remainingAfterResolve === 0,
            };
            if (onAction) {
                onAction("respond", payload);
            } else {
                emitEventToParent("PLANNING_ACTION", { action: "respond", plan: parsedPlan || rawPlan, ...payload });
            }
            return;
        }

        const payload = {
            parsedPlan,
            rawPlan,
            ...(action === "revise" ? { taskQueries, queryMessage } : {}),
        };
        if (onAction) {
            onAction(action, payload);
        } else {
            emitEventToParent("PLANNING_ACTION", { action, plan: parsedPlan || rawPlan, ...payload });
        }
        if (action === "revise") {
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

                                                {task.human_query && !isExecuting && (
                                                    <div className="mt-2 space-y-1.5">
                                                        <div className="flex items-start gap-1.5 text-[11px] text-warning">
                                                            <span className="font-semibold shrink-0">?</span>
                                                            <span>{task.human_query}</span>
                                                        </div>
                                                        {resolvedHumanQueryIds.has(task.id) ? (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-success">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                <span className="opacity-80">Answered</span>
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="input input-bordered input-xs w-full text-xs"
                                                                placeholder="Your answer..."
                                                                value={humanQueryAnswers[task.id] || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setHumanQueryAnswers((prev) => ({ ...prev, [task.id]: value }));
                                                                }}
                                                            />
                                                        )}
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
                                                            <div className="text-[11px] bg-success/8 border border-success/20 rounded p-2 max-h-32 overflow-auto whitespace-pre-wrap opacity-80">
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
                            {!showUpdateButton && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    disabled={isExecuting || isUpdatingPlan || !allHumanQueriesAnswered || (parsedPlan && tasks.length === 0)}
                                    title={!allHumanQueriesAnswered ? "Answer all required questions first" : (parsedPlan && tasks.length === 0) ? "Waiting for tasks to be generated" : undefined}
                                    onClick={() => handleAction("proceed")}
                                >
                                    {isExecuting
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Proceeding</>
                                        : <><PlayCircle className="w-3.5 h-3.5" /> Proceed</>}
                                </button>
                            )}
                            {!isExecuting && showUpdateButton && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    disabled={isUpdatingPlan || !queryMessage}
                                    onClick={() => handleAction("revise")}
                                >
                                    {isUpdatingPlan
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating</>
                                        : <><MessageSquare className="w-3.5 h-3.5" /> Update plan</>}
                                </button>
                            )}
                            {!isExecuting && !showUpdateButton && (
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
