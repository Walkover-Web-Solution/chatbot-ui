export interface $AppInfoReduxType {
    [tabSessionId: string]: {
        threadId: string
        bridgeName: string
        subThreadId: string
        helloId?: string | null
        versionId: string
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
        stream?: boolean | string, //weather to set the flag true or false in the sendmessaage api
        isStream?: boolean | string, //whether to set stream UI flag true or false
        widget?: boolean | string, //weather to set the flag true or false in the sendmessaage api
        image_model?: boolean | string, //weather to set the flag true or false in the sendmessaage api
        vision?: boolean | string, //whether to set the vision flag true or false
        supportedServices?: string[], //list of supported services
        mode: boolean, //whether to show Fast/Planning mode dropdown and send mode in sendMessage api
        defaultMessage?: string, //default/first message shown in empty state
        mcpConfig?: Array<{
            name: string;
            url: string;
        }>; //MCP servers array
        defaultErrorMessage?: string, //user-configurable fallback shown instead of the original error
    }
}