/* eslint-disable */
import actionType from "@/types/utility";
import { convertChatHistoryToGenericFormat, convertEventMessageToGenericFormat } from "@/utils/dataConvertWrappers/makeGenericDataFormatUtility";
import { PayloadAction } from "@reduxjs/toolkit";

type TaskStatus = "pending" | "in_progress" | "running" | "done" | "error" | "failed" | "waiting_for_user";
type ExecutionState = "idle" | "pending" | "queued" | "executing" | "running" | "paused" | "completed" | "error" | "updating";

interface PlanTask {
    id: string;
    title?: string;
    status?: TaskStatus;
    result?: string;
    error?: string;
    reasoning?: string;
}

interface PlanExecution {
    state: ExecutionState;
    tasks: Record<string, PlanTask>;
}

interface PlanHistoryEntry {
    message_to_user?: string;
    questions: any[];
    answers: Record<string, string>;
    timestamp?: string;
}

interface PlanningData {
    plan?: any;
    rawPlan?: string;
    execution: PlanExecution;
    planHistory: PlanHistoryEntry[];
    currentAnswers?: Record<string, string>;
}

interface ReviewPhase {
    phase: "reviewer_start" | "reviewer_done" | "main_rerun_start";
    round: number;
    passed?: boolean;
    reason?: string;
    reviewContent?: string;
    isStreaming?: boolean;
    snapshotContent?: string;
}

interface ChatState {
    // Messages and Conversations
    messages: any[];
    messageIds: Record<string, string[]>;
    msgIdAndDataMap: Record<string, Record<string, any>>;
    helloMsgIds: Record<string, string[]>;
    helloMsgIdAndDataMap: Record<string, Record<string, any>>;
    helloMessages: any[];
    starterQuestions: any[];
    isTyping: Record<string, any>;

    // Loading States
    loading: boolean;
    chatsLoading: boolean;
    isFetching: boolean;

    // UI States
    openHelloForm: boolean;
    isToggledrawer: boolean;
    headerButtons: any[];

    // Chat Metadata
    threadId: string;
    subThreadId: string;
    bridgeName: string;
    helloId: string;
    bridgeVersionId: string;

    // Pagination & Message Handling
    currentPage: number;
    hasMoreMessages: boolean;
    newMessage: boolean;
    skip: number;

    // Options & Media
    options: any[];
    images: any[];

    // Error handling
    error: string | null;

    // Additional properties that might be needed
    open?: boolean;
    isHelloUser?: boolean;
}
export const initialChatState: ChatState = {
    // Messages and Conversations
    messages: [],
    messageIds: {},
    msgIdAndDataMap: {},
    helloMsgIds: {},
    helloMsgIdAndDataMap: {},
    helloMessages: [],
    starterQuestions: [],
    isTyping: {},

    // Loading States
    loading: false,
    chatsLoading: false,
    isFetching: false,

    // UI States
    openHelloForm: false,
    isToggledrawer: false,
    headerButtons: [],

    // Chat Metadata
    threadId: "",
    subThreadId: "",
    bridgeName: "",
    helloId: "",
    bridgeVersionId: "",

    // Pagination & Message Handling
    currentPage: 1,
    hasMoreMessages: true,
    newMessage: false,
    skip: 1,

    // Options & Media
    options: [],
    images: [],

    // Error handling
    error: null,
};

const hasQuestions = (plan: any): boolean => {
    return plan &&
           typeof plan === 'object' &&
           Array.isArray(plan.questions) &&
           plan.questions.length > 0;
};

// Archive the previous plan's questions+answers into history once the user
// has submitted answers and the next AI response begins to overwrite the plan.
// Trigger: previousPlan has questions AND currentAnswers is populated.
// After archiving, currentAnswers must be cleared so subsequent stream chunks
// of the new response don't re-archive the same entry.
const buildPlanHistory = (
    existingHistory: any[] | undefined,
    previousPlan: any,
    currentAnswers: Record<string, string> | undefined
): { history: any[]; archived: boolean } => {
    const history = Array.isArray(existingHistory) ? [...existingHistory] : [];

    const hasAnswers = currentAnswers && Object.keys(currentAnswers).length > 0;
    if (!hasQuestions(previousPlan) || !hasAnswers) {
        return { history, archived: false };
    }

    history.push({
        message_to_user: previousPlan.message_to_user,
        questions: previousPlan.questions,
        answers: currentAnswers,
        timestamp: new Date().toISOString()
    });

    return { history, archived: true };
};

export const chatReducerV2 = {
    updateLastAssistantMessage: (state, action: PayloadAction<{ id?: string;[key: string]: any }>) => {
        const subThreadId = state.subThreadId;
        if (subThreadId) {
            state.messageIds[subThreadId] = [action.payload.id, ...state.messageIds[subThreadId].slice(1)];
            if (!state.msgIdAndDataMap[subThreadId]) {
                state.msgIdAndDataMap[subThreadId] = {};
            }
            state.msgIdAndDataMap[subThreadId][action.payload.id] = {
                ...(state.msgIdAndDataMap[subThreadId][action.payload.id] || {}),
                ...action.payload,
            };
        }
    },

    appendLastAssistantMessageChunk: (state, action: PayloadAction<{ chunk: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message) return;
        
        message.content = (message.content || "") + action.payload.chunk;
    },

    appendReasoningChunk: (state, action: PayloadAction<{ chunk: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message) return;
        
        message.reasoning = (message.reasoning || "") + action.payload.chunk;
    },

    setPlanningData: (state, action: PayloadAction<{ plan?: any; rawPlan?: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message) return;

        const existingPlanning = message.planning && typeof message.planning === "object" ? message.planning : {};
        const { plan: incomingPlan, rawPlan } = action.payload;

        const cleanedPlan = incomingPlan && typeof incomingPlan === 'object'
            ? { ...incomingPlan, planHistory: undefined }
            : incomingPlan;

        const { history: planHistory, archived } = buildPlanHistory(
            existingPlanning.planHistory,
            existingPlanning.plan,
            existingPlanning.currentAnswers
        );

        message.planning = {
            plan: cleanedPlan,
            rawPlan,
            planHistory,
            execution: existingPlanning.execution || { state: "pending", tasks: {} },
            currentAnswers: archived ? undefined : existingPlanning.currentAnswers
        };
    },

    savePlanningAnswers: (state, action: PayloadAction<{ answers: Record<string, string> }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message || !message.planning) return;

        message.planning.currentAnswers = action.payload.answers;
    },

    updatePlanningExecutionState: (state, action: PayloadAction<{ executionState?: string; taskUpdate?: { id: string; title?: string; status?: string; result?: string; error?: string }; taskId?: string; taskDelta?: string; taskReasoning?: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message?.planning) return;

        const execution = message.planning.execution || { state: "idle", tasks: {} };
        message.planning.execution = execution;

        if (action.payload.executionState) {
            execution.state = action.payload.executionState;
        }

        const { taskUpdate, taskId, taskDelta, taskReasoning } = action.payload;
        
        if (taskUpdate?.id) {
            execution.tasks = execution.tasks || {};
            execution.tasks[taskUpdate.id] = {
                ...execution.tasks[taskUpdate.id],
                ...taskUpdate
            };
        }

        if (taskId && (taskDelta || taskReasoning)) {
            execution.tasks = execution.tasks || {};
            const task = execution.tasks[taskId] || {};
            
            if (taskDelta) {
                task.result = (task.result || "") + taskDelta;
                task.status = "running";
            }
            
            if (taskReasoning) {
                task.reasoning = (task.reasoning || "") + taskReasoning;
                task.status = "running";
            }
            
            execution.tasks[taskId] = task;
        }
    },

    appendToolCall: (state, action: PayloadAction<{ call_id: string; name: string; args: Record<string, any> }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message) return;
        
        message.tools_data = message.tools_data || {};
        message.tools_data[action.payload.call_id] = {
            name: action.payload.name,
            args: action.payload.args,
            status: "calling",
            result: null,
        };
    },

    updateToolResult: (state, action: PayloadAction<{ call_id: string; content: any }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message?.tools_data) return;
        
        const callId = action.payload.call_id && message.tools_data[action.payload.call_id]
            ? action.payload.call_id
            : Object.keys(message.tools_data).find((k) => message.tools_data[k].status === "calling");
            
        if (!callId) return;
        
        message.tools_data[callId].status = "done";
        message.tools_data[callId].result = typeof action.payload.content === "string"
            ? action.payload.content
            : JSON.stringify(action.payload.content);
    },

    removeMessages: (state, { payload: { numberOfMessages = 1 } }: PayloadAction<{ numberOfMessages?: number }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;

        const idsToRemove = state.messageIds[subThreadId].slice(0, numberOfMessages);
        idsToRemove.forEach(id => delete state.msgIdAndDataMap[subThreadId][id]);
        state.messageIds[subThreadId] = state.messageIds[subThreadId].slice(numberOfMessages);
    },


    setLoading: (state, action: actionType<boolean>) => {
        state.loading = action.payload;
    },

    setChatsLoading: (state, action: PayloadAction<boolean>) => {
        state.chatsLoading = action.payload;
    },

    setOptions: (state, action: PayloadAction<any[]>) => {
        state.options = action.payload;
    },

    setImages: (state, action: PayloadAction<any[]>) => {
        state.images = action.payload;
    },

    clearImages: (state) => {
        state.images = [];
    },

    setThreadId: (state, action: PayloadAction<string>) => {
        state.threadId = action.payload;
    },

    setSubThreadId: (state, action: PayloadAction<string>) => {
        state.subThreadId = action.payload;
    },

    setBridgeName: (state, action: PayloadAction<string>) => {
        state.bridgeName = action.payload;
    },

    setHelloId: (state, action: PayloadAction<string>) => {
        state.helloId = action.payload;
    },

    setBridgeVersionId: (state, action: PayloadAction<string>) => {
        state.bridgeVersionId = action.payload;
    },

    setHeaderButtons: (state, action: PayloadAction<any[]>) => {
        state.headerButtons = action.payload;
    },

    setStarterQuestions: (state, action: PayloadAction<any[]>) => {
        state.starterQuestions = action.payload;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
        state.currentPage = action.payload;
    },

    setHasMoreMessages: (state, action: PayloadAction<boolean>) => {
        state.hasMoreMessages = action.payload;
    },

    setIsFetching: (state, action: PayloadAction<boolean>) => {
        state.isFetching = action.payload;
    },

    setNewMessage: (state, action: PayloadAction<boolean>) => {
        state.newMessage = action.payload;
    },

    setOpen: (state, action: PayloadAction<boolean>) => {
        state.open = action.payload;
    },

    setToggleDrawer: (state, action: PayloadAction<boolean>) => {
        state.isToggledrawer = action.payload;
    },

    setTyping: (state, action: PayloadAction<{ subThreadId?: string; data: any }>) => {
        const subThreadId = action.payload?.subThreadId || state.subThreadId;
        state.isTyping[subThreadId] = action.payload?.data;
    },

    setData: (state, action: PayloadAction<Partial<ChatState>>) => {
        Object.assign(state, action.payload);
    },

    updateSingleMessage: (state, action: PayloadAction<{ messageId: string; data: any }>) => {
        const subThreadId = state.subThreadId;
        const { messageId, data } = action.payload;
        
        const message = state.msgIdAndDataMap[subThreadId]?.[messageId];
        if (!message) return;
        
        Object.assign(message, data);
    },

    setOpenHelloForm: (state, action: PayloadAction<boolean>) => {
        state.openHelloForm = action.payload;
    },

    setInitialMessages: (state, action: PayloadAction<{ subThreadId?: string; messages: any[] }>) => {
        const subThreadId = action.payload?.subThreadId || state.subThreadId;
        const messages = convertChatHistoryToGenericFormat(action.payload.messages, state.isHelloUser);

        if (subThreadId) {
            state.messageIds[subThreadId] = messages.map((item) => item.id);
            state.msgIdAndDataMap[subThreadId] = messages.reduce((acc: Record<string, any>, item) => {
                acc[item.id] = item;
                return acc;
            }, {});
        }
    },

    setPaginateMessages: (state, action: PayloadAction<{ subThreadId?: string; messages: any[] }>) => {
        const subThreadId = action.payload?.subThreadId || state.subThreadId;
        const messages = action.payload.messages;
        const messagesArray = convertChatHistoryToGenericFormat(messages, state.isHelloUser);

        if (subThreadId) {
            state.messageIds[subThreadId] = [
                ...(state.messageIds[subThreadId] || []),
                ...messagesArray.map(msg => msg.id)
            ];

            if (!state.msgIdAndDataMap[subThreadId]) {
                state.msgIdAndDataMap[subThreadId] = {};
            }

            Object.assign(
                state.msgIdAndDataMap[subThreadId],
                messagesArray.reduce((acc: Record<string, any>, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {})
            );
        }
    },

    setHelloEventMessage: (state, action: PayloadAction<{ subThreadId?: string; message: any }>) => {
        const subThreadId = action.payload?.subThreadId || state.subThreadId;
        const messagesArray = convertEventMessageToGenericFormat(action.payload.message, state.isHelloUser);

        if (subThreadId) {
            state.messageIds[subThreadId] = [
                ...messagesArray?.map(msg => msg?.id),
                ...(state.messageIds[subThreadId] || [])
            ];

            if (!state.msgIdAndDataMap[subThreadId]) {
                state.msgIdAndDataMap[subThreadId] = {};
            }

            Object.assign(
                state.msgIdAndDataMap[subThreadId],
                messagesArray.reduce((acc: Record<string, any>, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {})
            );
        }
    },

    setReviewData: (state, action: PayloadAction<{ phase: string; round?: number; passed?: boolean; reason?: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message) return;

        const phases = Array.isArray(message.review_phases) ? message.review_phases : [];
        const { phase, round = 1, passed, reason } = action.payload;

        if (phase === "reviewer_start") {
            message.review_phases = [...phases, { phase, round, isStreaming: true, reviewContent: "" }];
        } 
        else if (phase === "reviewer_done") {
            const updatedPhases = [...phases];
            const targetIdx = updatedPhases.findLastIndex((r: any) => r.round === round);
            const idx = targetIdx >= 0 ? targetIdx : updatedPhases.length - 1;
            
            if (updatedPhases[idx]) {
                const cleanContent = (updatedPhases[idx].reviewContent || "")
                    .replace(/\s*\{[^{}]*"passed"[^{}]*\}\s*$/, "")
                    .trimEnd();
                    
                updatedPhases[idx] = { 
                    ...updatedPhases[idx], 
                    phase: "reviewer_done", 
                    passed, 
                    reason: reason || "", 
                    reviewContent: cleanContent, 
                    isStreaming: false 
                };
            } else {
                updatedPhases.push({ 
                    phase: "reviewer_done", 
                    round, 
                    passed, 
                    reason: reason || "", 
                    reviewContent: "", 
                    isStreaming: false 
                });
            }
            message.review_phases = updatedPhases;
        } 
        else if (phase === "main_rerun_start") {
            const updatedPhases = [...phases];
            const lastFailedIdx = updatedPhases.findLastIndex((r: any) => 
                r.phase === "reviewer_done" && r.passed === false
            );
            
            if (lastFailedIdx >= 0) {
                updatedPhases[lastFailedIdx] = { 
                    ...updatedPhases[lastFailedIdx], 
                    snapshotContent: message.content || "" 
                };
            }
            
            message.review_phases = [...updatedPhases, { phase: "main_rerun_start", round, isStreaming: true }];
            message.content = "";
            message.isOutdated = false;
        }
    },

    appendReviewDelta: (state, action: PayloadAction<{ chunk: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message?.review_phases?.length) return;
        
        const phases = message.review_phases;
        const lastPhase = phases[phases.length - 1];
        
        if (lastPhase?.isStreaming) {
            lastPhase.reviewContent = (lastPhase.reviewContent || "") + action.payload.chunk;
        }
    },

    setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
    },

    resetState: (state) => {
        const preservedValues = {
            threadId: state.threadId,
            bridgeName: state.bridgeName,
            helloId: state.helloId,
            bridgeVersionId: state.bridgeVersionId,
            headerButtons: state.headerButtons
        };

        Object.assign(state, initialChatState, preservedValues);
    }
};
