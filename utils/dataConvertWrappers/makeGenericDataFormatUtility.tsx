import { generateNewId } from "../utilities";

// In plan mode the next user message looks like "q1: Monday\nq2: Slack" —
// each line maps a question id to its answer. Answers may also span multiple
// lines (code blocks, pasted snippets), so we split on the next "qN:" marker
// rather than on newlines. Returns { qId: answerText } in the same shape
// redux planHistory stores.
const parsePlanAnswersFromUserText = (text: any): Record<string, string> => {
    const out: Record<string, string> = {};
    if (typeof text !== "string" || !text) return out;
    // Local regex instance — no shared `lastIndex` state across calls.
    const re = /(?:^|\n)\s*(q\d+)\s*:\s*([\s\S]*?)(?=\n\s*q\d+\s*:|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        out[m[1].toLowerCase()] = m[2].trim();
    }
    return out;
};

/**
 * Converts chat history to generic format.
 * @param history - The chat history to convert.
 * @param isHello - Whether the chat history is from Hello.
 * @returns The converted chat history.
 */
function convertChatHistoryToGenericFormat(history: any, isHello: boolean = false) {
    switch (isHello) {
        case true:
            return history
                .map((chat: any) => {
                    let role;
                    if (chat?.message?.chat_id && chat?.message?.message_type !== 'voice_call') {
                        role = 'user'
                    } else if (chat?.message?.sender_id === 'workflow' || chat?.message?.sender_id === 'bot' || chat?.message?.is_auto_response) {
                        role = "Bot"
                    } else if (chat?.message?.message_type === 'voice_call') {
                        role = "voice_call"
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
                        time: chat?.timetoken,
                        is_auto_response: chat?.message?.is_auto_response
                    };
                })

        case false: {
            const items = Array.isArray(history) ? history : [];
            return items.map((msgObj: any, idx: number) => {
                const base: any = {
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

                // Plan-mode history records carry a `plans` key. Their planning
                // blob is serialized in `llm_message`. Build a `planning` object
                // shaped like the redux state so AssistantMessage renders it via
                // the existing plan UI components instead of the raw JSON.
                if (msgObj?.plans) {
                    let parsed: any = null;
                    if (typeof msgObj.llm_message === "string") {
                        try { parsed = JSON.parse(msgObj.llm_message); } catch { /* ignore */ }
                    } else if (msgObj.llm_message && typeof msgObj.llm_message === "object") {
                        parsed = msgObj.llm_message;
                    }

                    if (parsed && typeof parsed === "object") {
                        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
                        // History array is reverse-chronological (index 0 = newest),
                        // so the chronologically NEXT record (which carries the user's
                        // answer "q1: a\nq2: b") is at idx - 1, not idx + 1.
                        const answers = questions.length > 0
                            ? parsePlanAnswersFromUserText(items[idx - 1]?.user)
                            : {};

                        // Mirror redux planHistory: archive message_to_user + Q&A
                        // into planHistory, leave the "current" plan with only its
                        // execution payload (tasks, etc.) so PlanningTasksCard still
                        // renders for executed plans.
                        const planHistory = questions.length > 0 ? [{
                            message_to_user: parsed.message_to_user || "",
                            questions,
                            answers,
                            timestamp: msgObj.created_at,
                        }] : [];

                        const currentPlan: any = { ...parsed };
                        if (questions.length > 0) {
                            currentPlan.questions = [];
                            currentPlan.message_to_user = "";
                        }

                        base.planning = {
                            plan: currentPlan,
                            planHistory,
                            execution: { state: "completed", tasks: {} },
                            currentAnswers: undefined,
                        };
                    }
                }

                return base;
            });
        }

        default:
            return [];
    }
}

function createSendMessageHelloPayload(message: string) {
    return {
        message: message
    };
}

/**
 * Converts an event message to generic format.
 * @param message - The event message to convert.
 * @param isHello - Whether the event message is from Hello.
 * @returns The converted event message.
 */
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


    const { sender_id, from_name, content, type, is_auto_response } = message || {};
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
            time: message?.timetoken || null,
            is_auto_response
        }];
    }

    // Handle regular messages
    return [{
        role: sender_id === "user" ? "user" : (sender_id === "bot" || sender_id === "workflow") ? "Bot" : sender_id ? "Human" : is_auto_response ? "Bot" : "user",
        from_name,
        content: content?.body?.text || content?.text,
        urls: content?.body?.attachment || content?.attachment,
        id: message?.timetoken || message?.id,
        message_type: message?.message_type,
        messageJson: message?.content,
        time: message?.timetoken || null,
        is_auto_response
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
