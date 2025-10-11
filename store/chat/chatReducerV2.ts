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
    callVoiceHistory?: Array<{
        from: 'user' | 'bot';
        messages: Array<{ type: 'text' | 'image' | 'button'; content?: string; options?: Array<{ title: string }> }>;
    }>;
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
    callVoiceHistory: [],
};

export const chatReducerV2 = {
    updateLastAssistantMessage: (state, action: PayloadAction<{ id?: string;[key: string]: any }>) => {
        const subThreadId = state.subThreadId;
        if (subThreadId) {
            state.messageIds[subThreadId] = [action.payload.id, ...state.messageIds[subThreadId].slice(1)];
            if (!state.msgIdAndDataMap[subThreadId]) {
                state.msgIdAndDataMap[subThreadId] = {};
            }
            state.msgIdAndDataMap[subThreadId][action.payload.id] = action.payload;
        }
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

    addCallVoiceEntry: (state, action: PayloadAction<{
        from: 'user' | 'bot';
        messages: Array<{ type: 'text' | 'image' | 'button'; content?: string; options?: Array<{ title: string }> }>;
    }>) => {
        if (!state.callVoiceHistory) state.callVoiceHistory = [];
        state.callVoiceHistory.push(action.payload);
    },

    clearCallVoiceHistory: (state) => {
        state.callVoiceHistory = [];
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
