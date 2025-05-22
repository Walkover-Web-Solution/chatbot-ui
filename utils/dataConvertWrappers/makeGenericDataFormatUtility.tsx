import { generateNewId } from "../utilities";

function convertChatHistoryToGenericFormat(history: any, isHello: boolean = false) {
    switch (isHello) {
        case true:
            return history
                .map((chat: any) => {
                    let role;
                    if (chat?.message?.chat_id) {
                        role = 'user'
                    } else if (chat?.message?.sender_id === 'workflow' || chat?.message?.sender_id === 'bot' || chat?.message?.is_auto_response) {
                        role = "Bot"
                    } else {
                        role = "Human"
                    }

                    // Handle feedback type messages
                    if (chat?.message?.type === 'feedback') {
                        return {
                            role: "Human",
                            id: chat?.timetoken || chat?.id,
                            from_name: chat?.message?.dynamic_values?.agent_name,
                            message_type: 'feedback',
                            token: chat?.message?.token,
                            dynamic_values: chat?.message?.dynamic_values,
                            chat_id: chat?.message?.chat_id,
                            channel: chat?.message?.channel,
                            time: chat?.timetoken || null
                        };
                    }

                    return {
                        role,
                        id: chat?.timetoken || chat?.id,
                        from_name: chat?.message?.from_name,
                        content: chat?.message?.message_type === 'interactive'
                            ? chat?.message?.content?.body?.text
                            : chat?.message?.content?.text,
                        urls: chat?.message?.content?.attachment,
                        message_type: chat?.message?.message_type,
                        messageJson: chat?.message?.content,
                        time: chat?.timetoken
                    };
                })

        case false:
            return (Array.isArray(history) ? history : []).map((msgObj: any) => {
                return {
                    ...msgObj,
                    id: msgObj?.Id,
                    content: msgObj?.chatbot_message || msgObj?.content,
                    role: msgObj?.role,
                    createdAt: msgObj?.createdAt,
                    function: msgObj?.function,
                    tools_call_data: msgObj?.tools_call_data,
                    created_at: msgObj?.created_at,
                    error: msgObj?.error,
                    urls: msgObj?.urls
                }
            });

        default:
            return [];
    }
}

function createSendMessageHelloPayload(message: string) {
    return {
        message: message
    };
}

function convertEventMessageToGenericFormat(message: any, isHello: boolean = false) {


    if (!isHello) {
        return [{
            ...message,
            id: message?.Id || generateNewId(),
            content: message?.chatbot_message || message?.content,
            role: message?.role,
            createdAt: message?.createdAt,
            function: message?.function,
            tools_call_data: message?.tools_call_data,
            created_at: message?.created_at,
            error: message?.error,
            urls: message?.urls
        }]
    }


    const { sender_id, from_name, content, type } = message || {};
    // Handle feedback type messages    
    if (type === 'feedback') {
        return [{
            role: "Human",
            from_name: message?.dynamic_values?.agent_name,
            id: message?.timetoken || message?.id,
            message_type: 'feedback',
            token: message?.token,
            dynamic_values: message?.dynamic_values,
            chat_id: message?.chat_id,
            channel: message?.channel,
            time: message?.timetoken || null
        }];
    }

    // Handle regular messages
    return [{
        role: (sender_id === "bot" || sender_id === "workflow") ? "Bot" : sender_id === "user" ? "user" : "Human",
        from_name,
        content: content?.body?.text || content?.text,
        urls: content?.body?.attachment || content?.attachment,
        id: message?.timetoken || message?.id,
        message_type: message?.message_type,
        messageJson: message?.content,
        time: message?.timetoken || null
    }];
}

function createSendMessageGtwyPayload(message: string) {
    return {
        message: message
    };
}

export {
    convertChatHistoryToGenericFormat,
    convertEventMessageToGenericFormat, createSendMessageGtwyPayload, createSendMessageHelloPayload
};
