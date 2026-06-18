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
function convertChatHistoryToGenericFormat(history: any) {
    const items = Array.isArray(history) ? history : [];
    return items.map((msgObj: any, idx: number) => {
        const base: any = {
            ...msgObj,
            id: msgObj?.id,
            createdAt: msgObj?.created_at,
            created_at: msgObj?.created_at,
            wait: false,
        };

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
function convertEventMessageToGenericFormat(message: any) {
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

function createSendMessageGtwyPayload(message: string) {
    return {
        message: message
    };
}

export {
    convertChatHistoryToGenericFormat,
    convertEventMessageToGenericFormat, createSendMessageGtwyPayload, createSendMessageHelloPayload
};
