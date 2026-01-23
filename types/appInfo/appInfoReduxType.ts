export interface $AppInfoReduxType {
    [tabSessionId: string]: {
        threadId: string
        bridgeName: string
        subThreadId: string
        helloId: string
        versionId: string
        wrapperId: string
        userId: string
        config: Record<string, unknown>
        currentChannelId: string,
        currentChatId: string,
        currentTeamId: string,
        isChatbotOpen: boolean,
        hideFullScreenButton: boolean,
        hideCloseButton: boolean,
        callToken: string,
        serviceChanged: string, //name of the service
        modelChanged: string, //name of the model
    }
}