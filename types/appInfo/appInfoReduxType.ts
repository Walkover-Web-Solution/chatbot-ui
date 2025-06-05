export interface $AppInfoReduxType{
    [tabSessionId:string]:{
        threadId:string
        bridgeName:string
        subThreadId:string
        helloId:string
        version_id:string
        userId:string
        config:Record<string,unknown>
        currentChannelId: string,
        currentChatId: string,
        currentTeamId: string
    }
}