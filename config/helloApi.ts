import axios from "@/utils/interceptor";
import { errorToast } from "@/components/customToast";

const HELLO_HOST_URL = process.env.NEXT_PUBLIC_MSG91_HOST_URL;

// Register anonymous user
export async function registerAnonymousUser(widgetId: string): Promise<any> {
  try {
    const response = await axios.post(`${HELLO_HOST_URL}/anonymous-client-details/`, {
      widget_id: widgetId
    },      {
      headers: {
        authorization: localStorage.getItem("WidgetId"),
      },
    });
    
    if (response?.data?.data?.uuid) {
      localStorage.setItem("HelloClientId", response.data.data.uuid);
    }
    
    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to register anonymous user");
    return null;
  }
}

// Get JWT token for socket subscription
export async function getJwtToken(isAnonymous: boolean): Promise<string | null> {
  try {
    const response = await axios.get(`${HELLO_HOST_URL}/jwt-token/?is_anon=${isAnonymous}`,{
      headers: {
        authorization: `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
      },
    });
    return response?.data?.data?.token || null;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get JWT token");
    return null;
  }
}

// Get all channels for registered user
export async function getAllChannels(uuid: string, uniqueId: string, isAnonymous: boolean): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/pubnub-channels/list/`,
      {
        uuid: uuid,
        user_data: isAnonymous ? {} : {
          "unique_id": uniqueId
        },
        is_anon: isAnonymous,
        anonymous_client_uuid: ""
      },
      {
        headers: {
          authorization: localStorage.getItem("HelloClientId") ? `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}` : localStorage.getItem("WidgetId"),
        },
      }
    );
    if (!localStorage.getItem("HelloClientId")) {
      localStorage.setItem("HelloClientId", response?.data?.uuid);
    }
    return response?.data?.data || [];
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get channels");
    return [];
  }
}

// Get agent team list
export async function getAgentTeam(): Promise<any> {
  try {
    const response = await axios.get(`${HELLO_HOST_URL}/agent-team/`,{
      headers: {
        authorization: `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
      },
    });
    return response?.data?.data || [];
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get agent team");
    return [];
  }
}

// Get greeting/starter questions
export async function getGreetingQuestions(companyId: string, botId: string, isAnonymous: boolean): Promise<any> {
  try {
    const response = await axios.get(
      `${HELLO_HOST_URL}/chat-gpt/greeting/?company_id=${companyId}&bot_id=${botId}&is_anon=${isAnonymous}`,{
      headers: {
        authorization: `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
      },
    });
    return response?.data?.data || [];
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get greeting questions");
    return [];
  }
}

// Save client details
export async function saveClientDetails(clientData: any): Promise<any> {
  try {
    const response = await axios.post(`${HELLO_HOST_URL}/client/`, clientData,{
      headers: {
        authorization: `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
      },
    });
    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to save client details");
    return null;
  }
}

// Get chat history
export async function getChatHistory(channelId: string): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/get-history/`,
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
          authorization: `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
          "content-type": "application/json",
        },
      }
    );
    return response?.data || null;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get chat history");
    return null;
  }
}

// Main function to initialize Hello chat
export async function initializeHelloChat(isAnonymous: boolean = true, uniqueId: string): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/widget-info/`,
      {
        "user_data": isAnonymous ? {} : {
          "unique_id": uniqueId
        },
        "is_anon": localStorage.getItem("HelloClientId") ? false : true
      },
      {
        headers: {
          authorization: `${localStorage.getItem("WidgetId")}${localStorage.getItem("HelloClientId") ? `:${localStorage.getItem("HelloClientId")}` : ''}`,
          "content-type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to initialize Hello chat");
    return null;
  }
} 

// Function to send message to Hello chat
export async function sendMessageToHello(message: string, attachment: object | null = null, channelDetail?: any, channelId?: string, chat_id?: string): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/v2/send/`,
      {
        type: "widget",
        message_type: "text", 
        content: {
          text: message,
          attachment: attachment ? [attachment] : [],
        },
        ...(channelDetail ? { channelDetail } : {}),
        chat_id: !channelId ? null : chat_id,
        session_id: null,
        user_data: {},
        is_anon: true,
      },
      {
        headers: {
          authorization: `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
          "content-type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to send message");
    return null;
  }
}


// Function to upload attachment to Hello chat
export async function uploadAttachmentToHello(file: File, inboxId: string): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await axios.post(
      `${HELLO_HOST_URL}/v2/upload/?type=chat&inbox_id=${inboxId}`,
      formData,
      {
        headers: {
          'authorization': `${localStorage.getItem("WidgetId")}:${localStorage.getItem("HelloClientId")}`,
          'content-type': 'multipart/form-data',
        }
      }
    );
    return response?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to upload attachment");
    return null;
  }
}

