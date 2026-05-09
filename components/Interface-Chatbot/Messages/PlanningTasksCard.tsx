import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { CheckCircle2, ChevronDown, Circle, Loader2, MessageSquare, PauseCircle, Pencil, PlayCircle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReasoningAccordion from "./ReasoningAccordion";

interface PlanningTasksCardProps {
    plan: any;
    isStreaming?: boolean;
    onAction?: (action: "proceed" | "revise", payload: { parsedPlan: any; rawPlan: string; updateMessage?: string }) => void;
}

export default function PlanningTasksCard({ plan, isStreaming = false, onAction }: PlanningTasksCardProps) {
    const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const taskResultRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showQueryInputs, setShowQueryInputs] = useState(false);
    const [taskQueries, setTaskQueries] = useState<Record<string, string>>({});
    const [openTaskId, setOpenTaskId] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const { parsedPlan, rawPlan } = useMemo(() => {
        if (plan === null || plan === undefined) {
            return { parsedPlan: null, rawPlan: "" };
        }
        if (typeof plan === "string") {
            try {
                const parsed = JSON.parse(plan);
                return { parsedPlan: parsed, rawPlan: plan };
            } catch {
                return { parsedPlan: null, rawPlan: plan };
            }
        }
        return { parsedPlan: plan, rawPlan: JSON.stringify(plan, null, 2) };
    }, [plan]);

    // New format: { message_to_user, plan: { goal, tasks }, questions, history_summary }
    const effectivePlan = parsedPlan?.plan?.tasks ? parsedPlan.plan : parsedPlan;

    const tasks = useMemo(() => {
        const src = effectivePlan?.tasks;
        if (!src) return [];
        if (Array.isArray(src)) return src;
        return [];
    }, [effectivePlan]);

    const activeTaskId = useMemo(() => {
        const runningTask = tasks.find((t) => t?.status === "in_progress");
        return runningTask?.id || "";
    }, [tasks]);

    const hasTaskQueryValues = useMemo(
        () => Object.values(taskQueries).some((v) => v?.trim().length > 0),
        [taskQueries],
    );

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

    const isExecuting = tasks.some((t) => t?.status === "in_progress" || t?.status === "running");
    const isExecutionCompleted = tasks.every((t) => t?.status === "done" || t?.status === "completed");
    const showProceedButton = !hasTaskQueryValues && !isExecuting && !isActionLoading && !isStreaming;
    const showUpdateButton = isExecuting || hasTaskQueryValues;

    const doneCount = useMemo(() => {
        return tasks.filter((t) => t?.status === "done" || t?.status === "completed").length;
    }, [tasks]);

    const hasFailedTasks = useMemo(() => {
        return tasks.some((t) => {
            const status = String(t?.status || "").toLowerCase();
            return status === "error" || status === "failed";
        });
    }, [tasks]);

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
        if (isExecuting && activeTaskId) { setOpenTaskId(activeTaskId); return; }
        setOpenTaskId((prev) => (prev && tasks.some((t) => t.id === prev) ? prev : ""));
    }, [activeTaskId, isExecuting, isExecutionCompleted, tasks]);

    useEffect(() => {
        setTaskQueries((prev) => {
            const next: Record<string, string> = {};
            tasks.forEach((t) => { if (prev[t.id]) next[t.id] = prev[t.id]; });
            return next;
        });
    }, [tasks]);

    useEffect(() => {
        setIsActionLoading(false);
    }, [parsedPlan]);

    if (!parsedPlan && !rawPlan) {
        return null;
    }

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
            const messages: string[] = [];
            tasks.forEach((t) => {
                const query = taskQueries[t.id]?.trim();
                if (query) {
                    messages.push(`task_id:${t.id}, query:${query}`);
                }
            });
            
            const updateMessage = messages.join("\n");
            const payload = { parsedPlan, rawPlan, updateMessage };
            
            if (onAction) {
                onAction("revise", payload);
            } else {
                emitEventToParent("PLANNING_ACTION", { action: "update", plan: parsedPlan || rawPlan, message: updateMessage, ...payload });
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
                                        const status = String(task.status || "pending").toLowerCase();
                                        const isLast = idx === tasks.length - 1;
                                        const isTaskOpen = showQueryInputs ? true : openTaskId === task.id;
                                        const isActive = status === "in_progress";
                                        const isDone = status === "done" || status === "completed";
                                        const isError = status === "error" || status === "failed";
                                        const isWaitingForUser = false;
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

                                        const canExpand = showQueryInputs || isTaskOpen;

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

                                                <button
                                                    type="button"
                                                    className={`w-full text-left group transition-opacity ${
                                                        isPending ? "opacity-55 hover:opacity-80" : "opacity-100"
                                                    }`}
                                                    onClick={() => {
                                                        setOpenTaskId((prev) => (prev === task.id ? "" : task.id));
                                                    }}
                                                >
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        {task.title}
                                                    </div>
                                                </button>

                                                <div className={`overflow-hidden transition-all duration-200 ease-out ${
                                                    isTaskOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                                                }`}>
                                                    <div className="space-y-2">
                                                        {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
                                                            <p className="text-[10px] text-base-content/50 dark:text-base-content/60">
                                                                <span className="font-semibold">Depends on:</span> {task.dependencies.join(", ")}
                                                            </p>
                                                        )}
                                                        {showQueryInputs && (
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
                    {!isExecutionCompleted && (
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
                                    disabled={isActionLoading || !hasTaskQueryValues}
                                    onClick={() => handleAction("update")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-content hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {isActionLoading
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
                                            ? "bg-base-200 dark:bg-base-600 border-base-300 dark:border-base-500 text-base-content/80 dark:text-base-content/80"
                                            : "bg-base-100 dark:bg-base-700 border-base-200 dark:border-base-600 text-base-content/60 dark:text-base-content/60 hover:border-base-300 dark:hover:border-base-500 hover:text-base-content/80"
                                    }`}
                                >
                                    <Pencil className="w-3 h-3" />
                                    {showQueryInputs ? "Cancel" : "Suggest changes"}
                                </button>
                            )}
                            {hasFailedTasks && !isActionLoading && (
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
