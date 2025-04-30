import { errorToast } from "@/components/customToast";
import { getLocalStorage, setLocalStorage } from "@/utils/utilities";
import axios from "axios";

const HELLO_HOST_URL = process.env.NEXT_PUBLIC_MSG91_HOST_URL;

// Helper function to get authorization header
const getAuthHeader = (includeClientId = true) => {
  const widgetId = getLocalStorage("WidgetId");
  const clientId = getLocalStorage(`${widgetId}_HelloClientId`);
  return includeClientId && clientId 
    ? `${widgetId}:${clientId}` 
    : widgetId;
};

// Helper function for API requests
const makeApiRequest = async (method: string, endpoint: string, data = {}, includeClientId = true, contentType = "application/json") => {
  try {
    const headers: Record<string, string> = {
      authorization: getAuthHeader(includeClientId),
    };
    
    if (contentType) {
      headers["content-type"] = contentType;
    }

    const config = {
      method,
      url: `${HELLO_HOST_URL}${endpoint}`,
      headers,
      data: method !== "get" ? data : undefined,
      params: method === "get" ? data : undefined,
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || `Failed to ${endpoint.split('/')[1] || 'complete request'}`;
    errorToast(errorMessage);
    return null;
  }
};

// Register anonymous user
export async function registerAnonymousUser(): Promise<any> {
  const response = await makeApiRequest("post", "/anonymous-client-details/", {}, false);
  
  if (response?.data?.uuid) {
    setLocalStorage(`${getLocalStorage("WidgetId")}_HelloClientId`, response.data.uuid);
  }
  
  return response?.data;
}

// Get JWT token for socket subscription
export async function getJwtToken(): Promise<string | null> {
  const isAnon = getLocalStorage("is_anon") === 'true';
  const response = await makeApiRequest("get", `/jwt-token/?is_anon=${isAnon}`);
  
  const token = response?.data?.jwt_token;
  if (token) {
    setLocalStorage("JwtTokenForSocket", token);
  }
  
  return token || null;
}

// Get all channels for registered user
export async function getAllChannels(helloConfig?: any): Promise<any> {
  if (!helloConfig) return [];
  
  const { mail, number, user_jwt_token, uniqueId, hide_launcher, show_widget_form, show_close_button, launch_widget, show_send_button, ...rest } = helloConfig;
  
  const data = {
    ...rest,
    widgetToken:getLocalStorage("WidgetId"),
    mail, 
    number,
    uuid: getLocalStorage(`${getLocalStorage("WidgetId")}_HelloClientId`),
    user_data: {
      "unique_id": uniqueId,
      "mail": mail,
      "number": number,
      "user_jwt_token": user_jwt_token
    },
    is_anon: getLocalStorage("is_anon") === 'true',
    ...(getLocalStorage("client") ? {} : { anonymous_client_uuid: getLocalStorage(`${getLocalStorage("WidgetId")}_HelloClientId`) })
  };

  const response = await makeApiRequest("post", "/pubnub-channels/list/", data, true);
  
  if (!getLocalStorage(`${getLocalStorage("WidgetId")}_HelloClientId`) && response?.uuid) {
    setLocalStorage(`${getLocalStorage("WidgetId")}_HelloClientId`, response.uuid);
  }
  
  return response || [];
}

// Get agent team list
export async function getAgentTeamApi(uniqueId: string): Promise<any> {
  const data = {
    user_data: !uniqueId ? {} : {
      "unique_id": uniqueId
    },
    is_anon: getLocalStorage("is_anon") === 'true',
  };
  
  const response = await makeApiRequest("post", "/agent-team/", data);
  return response?.data || [];
}

// Get greeting/starter questions
export async function getGreetingQuestions(companyId: string, botId: string): Promise<any> {
  const isAnon = getLocalStorage("is_anon") === 'true';
  const response = await makeApiRequest("get", `/chat-gpt/greeting/?company_id=${companyId}&bot_id=${botId}&is_anon=${isAnon}`);
  return response?.data || [];
}

// Save client details
export async function saveClientDetails(clientData: any): Promise<any> {
  const response = await makeApiRequest("put", "/client/", clientData);
  
  if (response) {
    console.log(response,'response=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')
    setLocalStorage("client", response);
  }
  
  return response;
}

// Get chat history
export async function getHelloChatHistoryApi(channelId: string): Promise<any> {
  const data = {
    channel: channelId,
    origin: "chat",
    page_size: 30,
    start_from: 1,
    user_data: {},
    is_anon: getLocalStorage("is_anon") === 'true',
  };
  
  const response = await makeApiRequest("post", "/get-history/", data);
  return response || null;
}

// Main function to initialize Hello chat
export async function initializeHelloChat(uniqueId: string | null = null): Promise<any> {
  const data = {
    "user_data": uniqueId ? {
      "unique_id": uniqueId
    } : {},
    "is_anon": getLocalStorage("is_anon") === 'true'
  };
  
  return await makeApiRequest("post", "/widget-info/", data, false);
}

// Function to send message to Hello chat
export async function sendMessageToHelloApi(message: string, attachment: Array<object> = [], channelDetail?: any, chat_id?: string): Promise<any> {
  // Determine message type based on attachment and message content
  let messageType = 'text';
  if (attachment?.length > 0) {
    messageType = message === '' ? 'attachment' : 'text-attachment';
  }

  const data = {
    type: "widget",
    message_type: messageType,
    content: {
      text: message,
      attachment: attachment,
    },
    ...(!chat_id ? { channelDetail } : {}),
    chat_id: chat_id ? chat_id : null,
    session_id: null,
    user_data: {},
    is_anon: getLocalStorage("is_anon") === 'true',
  };

  const response = await makeApiRequest("post", "/v2/send/", data);

  if (channelDetail && getLocalStorage("is_anon") === 'true') {
    setLocalStorage("is_anon", "false");
  }
  
  return response?.data;
}

// Function to upload attachment to Hello chat
export async function uploadAttachmentToHello(file: any, inboxId: string): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await axios.post(
      `${HELLO_HOST_URL}/v2/upload/?type=chat&inbox_id=${inboxId}`,
      formData,
      {
        headers: {
          'authorization': getAuthHeader(),
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

// Get client token for WebRTC
export async function getClientToken(): Promise<any> {
  const isAnon = getLocalStorage("is_anon") === 'true';
  const response = await makeApiRequest("get", `/web-rtc/get-client-token/?is_anon=${isAnon}`);
  
  if (response?.data?.jwt_token) {
    setLocalStorage("HelloClientToken", response.data.jwt_token);
  }
  
  return response?.data;
}

// Get call token for WebRTC
export async function getCallToken(): Promise<any> {
  const isAnon = getLocalStorage("is_anon") === 'true';
  const response = await makeApiRequest("get", `/web-rtc/get-call-token/?is_anon=${isAnon}`);
  
  if (response?.data?.jwt_token) {
    setLocalStorage("HelloCallToken", response.data.jwt_token);
  }
  
  return response?.data;
}

// Function to add domain to Hello chat
export async function addDomainToHello(domain?: string, mail?: string, uniqueId?: string, userJwtToken?: string, number?: string): Promise<any> {
  const data = {
    dom: domain,
    user_data: {
      mail: mail,
      unique_id: uniqueId,
      user_jwt_token: userJwtToken,
      number: number,
    },
    is_anon: getLocalStorage("is_anon") === 'true'
  };
  
  return await makeApiRequest("put", "/add-domain/", data);
}

// Delete read receipt for a message
export async function deleteReadReceipt(channelId: string): Promise<any> {
  return await makeApiRequest("delete", `/read-receipt/${channelId}`);
}

// Submit feedback for a conversation
export async function submitFeedback(params: {
  feedbackMsg: string;
  rating: string; 
  token: string;
  id: number;
}): Promise<any> {
  const data = {
    feedback_msg: params.feedbackMsg,
    rating: params.rating,
    token: params.token,
    type: "post-feedback",
    id: params.id,
    user_data: {
      unique_id: getLocalStorage(`${getLocalStorage("WidgetId")}_HelloClientId`)
    },
    is_anon: getLocalStorage("is_anon") === 'true'
  };
  
  return await makeApiRequest("post", "/receive-feedback/", data);
}
