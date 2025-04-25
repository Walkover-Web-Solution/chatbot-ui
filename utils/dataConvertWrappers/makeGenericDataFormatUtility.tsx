function convertChatHistoryToGenericFormat(history: any, isHello: boolean = false) {

    switch (isHello) {
        case true:
            return history
                .map((chat: any) => {
                    let role;
                    if (chat?.message?.from_name) {
                        role = "Human";
                    } else if (!chat?.message?.from_name && chat?.message?.sender_id === "bot") {
                        role = "Bot";
                    } else {
                        role = "user";
                    }

                    // Handle feedback type messages
                    if (chat?.message?.type === 'feedback') {
                        return {
                            role: "Human",
                            id: chat?.id,
                            from_name: chat?.message?.dynamic_values?.agent_name,
                            message_type: 'feedback',
                            token: chat?.message?.token,
                            dynamic_values: chat?.message?.dynamic_values,
                            chat_id: chat?.message?.chat_id,
                            channel: chat?.message?.channel
                        };
                    }

                    return {
                        role,
                        id: chat?.id,
                        from_name: chat?.message?.from_name,
                        content: chat?.message?.message_type === 'interactive'
                            ? chat?.message?.content?.body?.text
                            : chat?.message?.content?.text,
                        urls: chat?.message?.content?.attachment,
                        message_type: chat?.message?.message_type,
                        messageJson: chat?.message?.content
                    };
                })
                .reverse();

        case false:
            return (Array.isArray(history) ? history : []).map((msgObj: any) => {
                return {
                    ...msgObj,
                    id: msgObj?.Id,
                    content: msgObj?.content,
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
    const { sender_id, from_name, content, type } = message || {};
    // Handle feedback type messages    
    if (type === 'feedback') {
        return [{
            role: "Human",
            from_name:message?.dynamic_values?.agent_name,
            id: message?.id,
            message_type: 'feedback',
            token: message?.token,
            dynamic_values: message?.dynamic_values,
            chat_id: message?.chat_id,
            channel: message?.channel
        }];
    }

    // Handle regular messages
    return [{
        role: sender_id === "bot" ? "Bot" : "Human",
        from_name,
        content: content?.body?.text || content?.text,
        urls: content?.body?.attachment || content?.attachment,
        id: message?.id,
        message_type: message?.message_type,
        messageJson: message?.content
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

