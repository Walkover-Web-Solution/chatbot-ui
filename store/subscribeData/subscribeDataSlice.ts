import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SubscribeDataState {
    [chatSessionId: string]: {
        widgetInfo?: any;
        anonymousClientId?: string;
        socketJwt?: { jwt: string };
        channelListData?: any;
        isLoading?: boolean;
        Channel?: any;
        mode?: any;
        vision?: boolean;
        stream?: boolean;
        isStream?: boolean;
        image_model?: boolean;
        showWidgetForm?: boolean;
        clientInfo?: any;
        greeting?: any;
        supportedServices?: string[];
    }
}

const initialState: SubscribeDataState = {};

const subscribeDataSlice = createSlice({
    name: "subscribeData",
    initialState,
    reducers: {
        setSubscribeChatbotDetailsInChatSession(state, action: PayloadAction<any>) {
            const chatSessionId = (action as any).urlData?.chatSessionId;
            if (!chatSessionId) return;

            const { mode, supportedServices } = action.payload;
            const modes = Array.isArray(mode) 
                ? mode 
                : (typeof mode === 'string' ? mode.split(',').map((m: any) => m.trim()) : []);

            const hasStream = modes.includes("stream") || action.payload?.stream === true || action.payload?.isStream === true;

            state[chatSessionId] = {
                ...state[chatSessionId],
                mode,
                supportedServices,
                vision: modes.includes("vision") || action.payload?.vision === true,
                stream: hasStream,
                isStream: hasStream,
                image_model: modes.includes("files") || action.payload?.image_model === true,
                showWidgetForm: true,
                isLoading: false,
                clientInfo: state[chatSessionId]?.clientInfo || {}
            };
        },
        setSubscribeClientInfo(state, action: PayloadAction<any>) {
            const chatSessionId = (action as any).urlData?.chatSessionId;
            const existingClientInfo = state[chatSessionId]?.clientInfo || {};
            if (chatSessionId && action.payload && typeof action.payload === 'object') {
                state[chatSessionId] = {
                    ...state[chatSessionId],
                    clientInfo: {
                        ...existingClientInfo,
                        ...(action.payload?.clientInfo || {})
                    }
                };
            }
        },
        setSubscribeKeysData(state, action: PayloadAction<any>) {
            const chatSessionId = (action as any).urlData?.chatSessionId;
            if (chatSessionId && action.payload && typeof action.payload === 'object') {
                state[chatSessionId] = {
                    ...state[chatSessionId],
                    ...action.payload
                };
            }
        }
    }
});

export const {
    setSubscribeChatbotDetailsInChatSession,
    setSubscribeClientInfo,
    setSubscribeKeysData
} = subscribeDataSlice.actions;

export default subscribeDataSlice.reducer;
