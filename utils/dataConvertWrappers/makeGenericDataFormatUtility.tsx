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

                    return {
                        role,
                        id: chat?.id,
                        from_name: chat?.message?.from_name,
                        content: chat?.message?.message_type === 'interactive'
                            ? chat?.message?.content?.body?.text
                            : chat?.message?.content?.text,
                        urls: chat?.message?.content?.attachment,
                        message_type: chat?.message?.message_type,
                        messageJson : chat?.message?.content
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
    console.log(message,'message-0-0-0-0-0-0-0-0-0-0-0-')
    const { sender_id, from_name, content } = message || {};
    return [{
        role: sender_id === "bot" ? "Bot" : "Human",
        from_name,
        content: content?.body?.text || content?.text,
        urls: content?.body?.attachment || content?.attachment,
        id: message?.id,
        message_type: message?.message_type,
        messageJson : message?.content
    }]
}

function createSendMessageGtwyPayload(message: string) {
    return {
        message: message
    };
}



export {
    createSendMessageHelloPayload,
    createSendMessageGtwyPayload,
    convertChatHistoryToGenericFormat,
    convertEventMessageToGenericFormat
};
