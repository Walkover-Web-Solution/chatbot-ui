import axiosInstance from "axios";
import { errorToast } from "@/components/customToast";
import { InterFaceDataType } from "@/types/interface/InterfaceReduxType";
import { UrlDataType } from "@/types/utility";
import axios from "@/utils/interceptor";
import { getLocalStorage } from "@/utils/utilities";
import { PAGE_SIZE } from "@/utils/enums";

const URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL;
let currentController: AbortController | null = null;

export async function getAllInterfaceApi(
    projectId: string
): Promise<{ [key: string]: any }[]> {
    const response = await axios.get(
        `${URL}/projects/${projectId}/interfaces/getAllInterfaces`
    );
    return response?.data?.data;
}

export async function createInterfaceApi(
    data: InterFaceDataType,
    urlData: UrlDataType
): Promise<{ [key: string]: any }[]> {
    const { orgId, projectId } = urlData;
    const response = await axios.post(`${URL}/projects/${projectId}/interfaces`, {
        ...data,
        org_id: orgId,
        project_id: projectId,
        config: {
            type: "popup",
            height: "50",
            heightUnit: "%",
            width: "500",
            widthUnit: "px",
        },
    });
    return response?.data?.data;
}

export async function updateInterfaceApi(
    data: InterFaceDataType,
    urlData: UrlDataType
): Promise<{ [key: string]: any }[]> {
    const { orgId, projectId, chatbotId } = urlData;
    const response = await axios.put(
        `${URL}/projects/${projectId}/interfaces/${chatbotId}/update`,
        {
            ...data,
            org_id: orgId,
            project_id: projectId,
        }
    );
    return response?.data?.data;
}

export async function updateInterfaceActionsApi(
    data: InterFaceDataType,
    urlData: UrlDataType
): Promise<{ [key: string]: any }[]> {
    const { orgId, projectId, chatbotId } = urlData;
    const response = await axios.put(
        `${URL}/projects/${projectId}/interfaces/${chatbotId}/updateAction`,
        {
            ...data,
            org_id: orgId,
            project_id: projectId,
        }
    );
    return response?.data?.data;
}
export async function updateInterfaceDetailsApi(
    data: InterFaceDataType,
    urlData: UrlDataType
): Promise<{ [key: string]: any }[]> {
    const { projectId } = urlData;
    const { chatbotId: datachatbotId, ...dataToSend } = data; // Renamed to avoid variable shadowing
    const chatbotId = datachatbotId || urlData.chatbotId;
    const response = await axios.put(
        `${URL}/projects/${projectId}/interfaces/${chatbotId}/updateInterfaceDetails`,
        dataToSend
    );
    return response?.data?.data;
}

export async function deleteInterfaceApi(
    data: InterFaceDataType,
    urlData: UrlDataType
): Promise<{ [key: string]: any }[]> {
    const { projectId } = urlData;
    const { chatbotId } = data;
    const response = await axios.delete(
        `${URL}/projects/${projectId}/interfaces/${chatbotId}`
    );
    return response?.data?.data;
}

export async function getInterfaceByIdApi(
    chatbotId: string
): Promise<{ [key: string]: any }[]> {
    const response = await axios.get(`${URL}/chatbot/${chatbotId}/getchatbot`);
    return response?.data;
}

export async function deleteComponentOrGridApi(
    chatbotId: string,
    gridId: string,
    componentId: string,
    urlData: UrlDataType
): Promise<{ [key: string]: any }[]> {
    const { projectId } = urlData;
    const requestBody = {
        componentId: componentId,
    };
    const response = await axios.delete(
        `${URL}/projects/${projectId}/interfaces/${chatbotId}/grid/${gridId}`,
        {
            data: requestBody,
        }
    );
    return response?.data?.data;
}

export async function getPreviousMessage(
    threadId: string | null,
    bridgeName: string | null,
    pageNo: number | null,
    subThreadId: string | null = threadId,
    limit = PAGE_SIZE.gtwy
): Promise<{ previousChats: any; starterQuestion: string[] }> {
    if (currentController) {
        currentController.abort();
    }
    currentController = new AbortController();

    try {
        const response = await axios.get(
            `${URL}/api/v1/config/gethistory-chatbot/${threadId}/${bridgeName}?sub_thread_id=${subThreadId || threadId
            }&pageNo=${pageNo}&limit=${limit}`,
            { signal: currentController.signal }
        );
        return {
            previousChats: response?.data?.data?.reverse() || [],
            starterQuestion: response?.data?.starterQuestion || [],
        };
    } catch (error) {
        if (error.name === "AbortError") {
            console.warn("Request aborted:", error.message);
        } else {
            console.warn("Error fetching previous messages:", error);
        }
        return [];
    }
}

export async function sendDataToAction(data: any): Promise<any> {
    try {
        if (!data.threadId) data.threadId = "";

        const response = await axios.post(
            `${PYTHON_URL}/chatbot/${data.chatBotId}/sendMessage`,
            {
                ...data,
            }
        );
        return { success: true, data: response?.data?.data };
    } catch (error) {
        errorToast(
            error?.response?.data?.detail?.error ||
            error?.response?.data?.detail ||
            "Something went wrong!"
        );
        return { success: false };
    }
}

export async function performChatAction(
    data: any
): Promise<{ [key: string]: any }[]> {
    try {
        if (!data.threadId) data.threadId = "";

        const response = await axios.post(
            `${PYTHON_URL}/chatbot/${data.chatBotId}/resetchat`,
            {
                ...data,
            }
        );
        return response?.data?.data;
    } catch (error) {
        errorToast(
            error?.response?.data?.detail?.error ||
            error?.response?.data?.detail ||
            "Something went wrong!"
        );
        return error;
    }
}

export async function sendFeedbackAction(data: {
    messageId: string;
    feedbackStatus: number;
}): Promise<{ [key: string]: any }[]> {
    try {
        const response = await axios.put(
            `${URL}/api/v1/config/status/${data?.feedbackStatus}`,
            { message_id: data?.messageId }
        );
        return response?.data;
    } catch (error) {
        errorToast(
            error?.response?.data?.detail?.error ||
            error?.response?.data?.detail ||
            "Something went wrong!"
        );
        return error;
    }
}

export async function loginUser(data: any): Promise<{ [key: string]: any }[]> {
    const response = await axios.post(`${URL}/chatbot/login`, {
        ...data,
    });
    return response?.data?.data;
}

export async function getHelloDetailsApi({
    threadId,
    slugName,
    helloId = null,
    versionId = null,
}: {
    threadId: string;
    slugName: string;
    helloId?: string | null;
    versionId: string | null;
}): Promise<any> {
    const data: any = {
        slugName,
    };
    if (threadId !== null) data.threadId = threadId;
    if (helloId !== null) data.helloId = helloId;
    if (versionId !== null) data.versionId = versionId;
    try {
        const response = await axios.post(`${URL}/hello/subscribe`, data);
        return response?.data;
    } catch (error) {
        console.error("Error getting hello details:", error);
        return null;
    }
}

export async function getHelloChatsApi({
    channelId,
}: {
    channelId: string;
}): Promise<any> {
    try {
        const response = await axiosInstance.post(
            "https://api.phone91.com/get-history/",
            {
                channel: channelId,
                origin: "chat",
                page_size: 30,
                start_from: 1,
                user_data: {},
                is_anon: false,
            },
            {
                headers: {
                    authorization: getLocalStorage("HelloAgentAuth"),
                    "content-type": "application/json",
                },
            }
        );
        return response?.data;
    } catch (error) {
        console.error("Error getting hello details:", error);
        return null;
    }
}

export const createScripts = async (data: any, type = "flow") => {
    try {
        data.type = type;
        const res = await axios.post(
            `${URL}/projects/${data?.project_id}/scripts`,
            data
        );
        return res;
    } catch (error: any) {
        console.error(error);
        errorToast(error?.response?.data?.message || "Something went wrong!");
    }
};

export const getAllThreadsApi = async ({ threadId = "" }) => {
    if (!threadId) {
        console.error("Invalid threadId provided");
        return null;
    }
    try {
        const response = await axios.get(`${URL}/thread/${threadId}`);
        return response?.data;
    } catch (error: any) {
        console.warn(error);
        errorToast(
            error?.response?.data?.message ||
            "Something went wrong While fetching Threads!"
        );
    }
};

export const createNewThreadApi = async ({
    threadId = "",
    subThreadId = "",
}) => {
    try {
        const response = await axios.post(`${URL}/thread/`, {
            thread_id: threadId,
            subThreadId,
        });
        return response?.data;
    } catch (error: any) {
        console.error(error);
        errorToast(error?.response?.data?.message || "Something went wrong!");
    }
};

export const uploadImage = async ({ formData = {} }) => {
    try {
        const response = await axios.post(
            `${PYTHON_URL}/image/processing/`,
            formData
        );
        return response?.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        errorToast(error?.response?.data?.message || "Something went wrong!");
        return null;
    }
};

export const sendMessage = async (scriptId, functionId, data) => {
    try {
        return await axios.post(
            `${URL}/chatbot/message/${scriptId}/functions/${functionId}`,
            data
        );
    } catch (e) {
        return e;
    }
};
export const allChats = async (scriptId, functionId) => {
    try {
        const data = await axios.get(
            `${URL}/chatbot/${scriptId}/functions/${functionId}`
        );
        return data;
    } catch (e) {
        return e;
    }
};

export const getAccessToken = async () => {
    try {
        const response = await axios.post(`${URL}/utility/get-token`);
        return response?.data?.data;
    } catch (e) {
        return e;
    }
};