export interface $AppInfoReduxType{
    [chatSessionId:string]:{
        threadId:string
        bridgeName:string
        subThreadId:string
        userId:string
        config:Record<string,unknown>
    }
}