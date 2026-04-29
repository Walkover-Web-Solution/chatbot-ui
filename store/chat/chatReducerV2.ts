/* eslint-disable */
import actionType from "@/types/utility";
import { convertChatHistoryToGenericFormat, convertEventMessageToGenericFormat } from "@/utils/dataConvertWrappers/makeGenericDataFormatUtility";
import { PayloadAction } from "@reduxjs/toolkit";

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
        if (subThreadId && state.messageIds[subThreadId]?.length > 0) {
            const lastMessageId = state.messageIds[subThreadId][0]; // Newest is at index 0
            if (state.msgIdAndDataMap[subThreadId] && state.msgIdAndDataMap[subThreadId][lastMessageId]) {
                const existingContent = state.msgIdAndDataMap[subThreadId][lastMessageId].content || "";
                state.msgIdAndDataMap[subThreadId][lastMessageId].content = existingContent + action.payload.chunk;
            }
        }
    },

    appendReasoningChunk: (state, action: PayloadAction<{ chunk: string }>) => {
        const subThreadId = state.subThreadId;
        if (subThreadId && state.messageIds[subThreadId]?.length > 0) {
            const lastMessageId = state.messageIds[subThreadId][0];
            if (state.msgIdAndDataMap[subThreadId]?.[lastMessageId]) {
                const existing = state.msgIdAndDataMap[subThreadId][lastMessageId].reasoning || "";
                state.msgIdAndDataMap[subThreadId][lastMessageId].reasoning = existing + action.payload.chunk;
            }
        }
    },

    setPlanningData: (state, action: PayloadAction<{ plan?: any; rawPlan?: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        const lastMessageId = state.messageIds[subThreadId][0];
        if (!state.msgIdAndDataMap[subThreadId]) {
            state.msgIdAndDataMap[subThreadId] = {};
        }
        if (!state.msgIdAndDataMap[subThreadId][lastMessageId]) {
            state.msgIdAndDataMap[subThreadId][lastMessageId] = {} as any;
        }
        const existingMessage = state.msgIdAndDataMap[subThreadId][lastMessageId];
        const existingPlanning = typeof existingMessage.planning === "object" ? existingMessage.planning : {};
        existingMessage.planning = {
            ...existingPlanning,
            ...action.payload,
            execution: existingPlanning.execution || { state: "pending", tasks: {} },
        };
    },

    updatePlanningExecutionState: (state, action: PayloadAction<{ executionState?: string; taskUpdate?: { id: string; title?: string; status?: string; result?: string; error?: string }; taskId?: string; taskDelta?: string; taskReasoning?: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        const lastMessageId = state.messageIds[subThreadId][0];
        const message = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!message) return;

        if (typeof message.planning !== "object" || message.planning === null || !(message.planning.plan || message.planning.rawPlan)) return;

        if (!message.planning.execution) {
            message.planning.execution = { state: "idle", tasks: {} };
        }

        if (action.payload.executionState) {
            message.planning.execution.state = action.payload.executionState;
        }

        if (action.payload.taskUpdate?.id) {
            if (!message.planning.execution.tasks) {
                message.planning.execution.tasks = {};
            }
            const taskId = action.payload.taskUpdate.id;
            const existingTask = message.planning.execution.tasks[taskId] || {};
            message.planning.execution.tasks[taskId] = {
                ...existingTask,
                ...action.payload.taskUpdate,
            };
        }

        // Handle streaming task delta
        if (action.payload.taskId && action.payload.taskDelta) {
            if (!message.planning.execution.tasks) {
                message.planning.execution.tasks = {};
            }
            const taskId = action.payload.taskId;
            const existingTask = message.planning.execution.tasks[taskId] || {};
            const currentResult = existingTask.result || "";
            message.planning.execution.tasks[taskId] = {
                ...existingTask,
                result: currentResult + action.payload.taskDelta,
                status: "running",
            };
        }

        // Handle streaming task reasoning
        if (action.payload.taskId && action.payload.taskReasoning) {
            if (!message.planning.execution.tasks) {
                message.planning.execution.tasks = {};
            }
            const taskId = action.payload.taskId;
            const existingTask = message.planning.execution.tasks[taskId] || {};
            const currentReasoning = existingTask.reasoning || "";
            message.planning.execution.tasks[taskId] = {
                ...existingTask,
                reasoning: currentReasoning + action.payload.taskReasoning,
                status: "running",
            };
        }
    },

    appendToolCall: (state, action: PayloadAction<{ call_id: string; name: string; args: Record<string, any> }>) => {
        const subThreadId = state.subThreadId;
        if (subThreadId && state.messageIds[subThreadId]?.length > 0) {
            const lastMessageId = state.messageIds[subThreadId][0];
            if (state.msgIdAndDataMap[subThreadId]?.[lastMessageId]) {
                const msg = state.msgIdAndDataMap[subThreadId][lastMessageId];
                if (!msg.tools_data) msg.tools_data = {};
                msg.tools_data[action.payload.call_id] = {
                    name: action.payload.name,
                    args: action.payload.args,
                    status: "calling",
                    result: null,
                };
            }
        }
    },

    updateToolResult: (state, action: PayloadAction<{ call_id: string; content: any }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        const lastMessageId = state.messageIds[subThreadId][0];
        const msg = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!msg?.tools_data) return;
        const exactKey = action.payload.call_id && msg.tools_data[action.payload.call_id]
            ? action.payload.call_id
            : Object.keys(msg.tools_data).find((k) => msg.tools_data[k].status === "calling");
        if (!exactKey) return;
        msg.tools_data[exactKey].status = "done";
        msg.tools_data[exactKey].result = typeof action.payload.content === "string"
            ? action.payload.content
            : JSON.stringify(action.payload.content);
    },

    removeMessages: (state, { payload: { numberOfMessages = 1 } }: PayloadAction<{ numberOfMessages?: number }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;

        // Newest IDs are at the *front*, so trim from the start
        const messageIdsToRemove = state.messageIds[subThreadId].slice(0, numberOfMessages);

        messageIdsToRemove.forEach(id => {
            delete state.msgIdAndDataMap[subThreadId]?.[id];
        });

        // Keep the remaining IDs (oldest → newest)
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

    setMessageTimeout: (state) => {
        state.messages = [
            ...state.messages.slice(0, -1),
            { role: "assistant", wait: false, timeOut: true }
        ];
        state.loading = false;
    },

    setData: (state, action: PayloadAction<Partial<ChatState>>) => {
        Object.assign(state, action.payload);
    },

    updateSingleMessage: (state, action: PayloadAction<{ messageId: string; data: any }>) => {
        const subThreadId = state.subThreadId;
        const { messageId, data } = action.payload;
        if (subThreadId && state.msgIdAndDataMap[subThreadId] && state.msgIdAndDataMap[subThreadId][messageId]) {
            // Create a new object reference to ensure Redux detects the change
            state.msgIdAndDataMap = {
                ...state.msgIdAndDataMap,
                [subThreadId]: {
                    ...state.msgIdAndDataMap[subThreadId],
                    [messageId]: {
                        ...state.msgIdAndDataMap[subThreadId][messageId],
                        ...data
                    }
                }
            };
        }
        return state; // Explicitly return the updated state
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
        if (!state.msgIdAndDataMap[subThreadId]?.[lastMessageId]) return;
        const msg = state.msgIdAndDataMap[subThreadId][lastMessageId];
        const existing: any[] = Array.isArray(msg.review_phases) ? msg.review_phases : [];
        const { phase, round = 1, passed, reason } = action.payload;

        if (phase === "reviewer_start") {
            msg.review_phases = [...existing, { phase, round, isStreaming: true, reviewContent: "" }];

        } else if (phase === "reviewer_done") {
            const updated = [...existing];
            const idx = updated.findLastIndex?.((r: any) => r.round === round);
            const targetIdx = idx !== undefined && idx >= 0 ? idx : updated.length - 1;
            if (updated[targetIdx]) {
                // Strip any trailing JSON blob (e.g. {"passed":false,"reason":"..."}) from streamed reviewContent
                let cleanedContent = updated[targetIdx].reviewContent || "";
                cleanedContent = cleanedContent.replace(/\s*\{[^{}]*"passed"[^{}]*\}\s*$/s, "").trimEnd();
                updated[targetIdx] = { ...updated[targetIdx], phase: "reviewer_done", passed, reason: reason || "", reviewContent: cleanedContent, isStreaming: false };
            } else {
                updated.push({ phase: "reviewer_done", round, passed, reason: reason || "", reviewContent: "", isStreaming: false });
            }
            msg.review_phases = updated;

        } else if (phase === "main_rerun_start") {
            // Snapshot the current content into the last failed review phase, then wipe it
            const updated = [...existing];
            const lastFailedIdx = updated.findLastIndex?.((r: any) => r.phase === "reviewer_done" && r.passed === false);
            if (lastFailedIdx >= 0) {
                updated[lastFailedIdx] = { ...updated[lastFailedIdx], snapshotContent: msg.content || "" };
            }
            msg.review_phases = [...updated, { phase: "main_rerun_start", round, isStreaming: true }];
            msg.content = "";
            msg.isOutdated = false;
        }
    },

    appendReviewDelta: (state, action: PayloadAction<{ chunk: string }>) => {
        const subThreadId = state.subThreadId;
        if (!subThreadId || !state.messageIds[subThreadId]?.length) return;
        const lastMessageId = state.messageIds[subThreadId][0];
        const msg = state.msgIdAndDataMap[subThreadId]?.[lastMessageId];
        if (!msg) return;
        const phases: any[] = Array.isArray(msg.review_phases) ? msg.review_phases : [];
        if (phases.length === 0) return;
        const lastIdx = phases.length - 1;
        const last = phases[lastIdx];
        if (last?.isStreaming) {
            const updated = [...phases];
            updated[lastIdx] = { ...last, reviewContent: (last.reviewContent || "") + action.payload.chunk };
            msg.review_phases = updated;
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
