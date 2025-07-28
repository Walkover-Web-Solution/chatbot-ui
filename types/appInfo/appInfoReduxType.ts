export interface $AppInfoReduxType {
    [tabSessionId: string]: {
        threadId: string
        bridgeName: string
        subThreadId: string
        helloId: string
        versionId: string
        userId: string
        config: Record<string, unknown>
        currentChannelId: string,
        currentChatId: string,
        currentTeamId: string,
        isChatbotOpen: boolean,
        hideFullScreenButton: boolean,
        hideCloseButton: boolean,
        isServiceChange: string, //name of the service
        isModelChange: string, //name of the model
    }
}