import { createContext } from "react";

export const ChatbotContext = createContext({
    chatbotConfig: {},
    chatbot_id: "",
    userId: "",
    token: "",
    themeColor: "#000000",
    onConfigChange: (config?: any) => { },
    toggleHideCloseButton: () => { },
    isTestChatbot: false,
    environment: null,
    hideToolCall: false,
});