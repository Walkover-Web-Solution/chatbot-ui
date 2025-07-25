import { errorToast } from "@/components/customToast";
import { PAGE_SIZE } from "@/utils/enums";
import axios from "@/utils/helloInterceptor";
import { getLocalStorage, setLocalStorage } from "@/utils/utilities";

const urlParams = new URLSearchParams(window.location.search);
const env = urlParams.get('env');
const HELLO_HOST_URL = env !== 'stage' ? process.env.NEXT_PUBLIC_MSG91_HOST_URL : 'https://stageapi.phone91.com';
const PUSH_NOTIFICATION_URL = process.env.NEXT_PUBLIC_PUSH_NOTIFICATION_URL;

export function getUserData() {
  const userData = JSON.parse(getLocalStorage('userData') || '{}');
  const filteredData = {};

  for (const [key, value] of Object.entries(userData)) {
    if (value && key !== 'name') {
      filteredData[key] = value;
    }
  }

  return filteredData;
}

// Register anonymous user
export async function registerAnonymousUser(): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/anonymous-client-details/`,
      {},
      {
        headers: {
          authorization: getLocalStorage('WidgetId'),
        },
      }
    );

    if (response?.data?.data?.uuid) {
      setLocalStorage('a_clientId', response.data.data.uuid);
    }

    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to register anonymous user");
    return null;
  }
}

// Get JWT token for socket subscription
export async function getJwtToken(): Promise<string | null> {
  try {
    const response = await axios.get(`${HELLO_HOST_URL}/jwt-token/?is_anon=${getLocalStorage("is_anon") == 'true'}`, {
      headers: {
        authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
      },
    });
    const token = response?.data?.data?.jwt_token;
    if (token) {
      setLocalStorage("JwtTokenForSocket", token);
    }
    return token || null;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get JWT token");
    return null;
  }
}

// Get all channels for registered user
export async function getAllChannels(): Promise<any> {
  try {
    const { mail, number, unique_id, name } = JSON.parse(getLocalStorage('userData') || '{}');
    const response = await axios.post(
      `${HELLO_HOST_URL}/pubnub-channels/list/`,
      {
        name,
        mail,
        number,
        unique_id,
        user_data: getUserData(),
        is_anon: getLocalStorage('is_anon') == 'true',
        ...(getLocalStorage('is_anon') == 'true' ? { anonymous_client_uuid: getLocalStorage('a_clientId'), uuid: getLocalStorage('a_clientId') } : {})
      },
      {
        headers: {
          authorization: (unique_id || mail || number)
            ? getLocalStorage('WidgetId') && getLocalStorage('k_clientId') ? `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId')}` : getLocalStorage('WidgetId')
            : (getLocalStorage('a_clientId')
              ? `${getLocalStorage('WidgetId')}:${getLocalStorage('a_clientId')}`
              : getLocalStorage('WidgetId')),
        },
      }
    );

    if (unique_id || mail || number) {
      setLocalStorage('k_clientId', response?.data?.uuid)
    } else {
      setLocalStorage('a_clientId', response?.data?.uuid)
    }

    // Update userData with customer details from response if available
    if (response?.data?.customer_name || response?.data?.customer_number || response?.data?.customer_mail) {
      const userData = JSON.parse(getLocalStorage('client') || '{}');
      const updatedUserData = {
        ...userData,
        name: response?.data?.customer_name || userData.name,
        number: response?.data?.customer_number?.replace(/^\+/, '') || userData.number,
        mail: response?.data?.customer_mail || userData.mail
      };
      setLocalStorage('client', JSON.stringify(updatedUserData));
    }
    return response?.data || [];
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get channels");
    return [];
  }
}

// Get agent team list
export async function getAgentTeamApi(): Promise<any> {
  try {
    const response = await axios.post(`${HELLO_HOST_URL}/agent-team/`, {
      user_data: getUserData(),
      is_anon: getLocalStorage("is_anon") == 'true',
    }, {
      headers: {
        authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
      },
    });
    return response?.data || [];
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get agent team");
    return [];
  }
}

// Get greeting/starter questions
export async function getGreetingQuestions(companyId: string, botId: string, botType: 'lex' | 'chatgpt'): Promise<any> {
  try {
    const isAnonymousUser = getLocalStorage("is_anon") == 'true';
    const widgetId = getLocalStorage('WidgetId');
    const clientId = getLocalStorage('k_clientId') || getLocalStorage('a_clientId');
    const authorization = clientId ? `${widgetId}:${clientId}` : widgetId;
    if (botType === 'lex') {
      // For Lex bot type, use POST request
      const greetingResponse = await axios.post(
        `${HELLO_HOST_URL}/chat-bot/welcome/get-welcome/`,
        {
          company_id: companyId,
          bot_id: botId,
          is_anon: isAnonymousUser
        },
        {
          headers: {
            authorization: authorization,
          },
        }
      );

      return greetingResponse?.data?.data || [];
    } else {
      // For ChatGPT or other bot types, use GET request
      const greetingResponse = await axios.get(
        `${HELLO_HOST_URL}/chat-gpt/greeting/`,
        {
          params: {
            company_id: companyId,
            bot_id: botId,
            is_anon: isAnonymousUser
          },
          headers: {
            authorization: authorization,
          },
        }
      );

      return greetingResponse?.data?.data || [];
    }
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to get greeting questions");
    return [];
  }
}

// Save client details
export async function saveClientDetails(clientData = {}): Promise<any> {
  try {
    const payload = {
      user_data: getUserData(),
      is_anon: getLocalStorage("is_anon") == 'true',
      ...clientData
    }

    const response = await axios.put(`${HELLO_HOST_URL}/v2/client/${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`, payload, {
      headers: {
        authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
      },
    });
    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.response?.data?.message || "Failed to save client details");
    return null;
  }
}

// Get chat history
export async function getHelloChatHistoryApi(channelId: string, skip: number = 0): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/get-history/`,
      {
        channel: channelId,
        origin: "chat",
        page_size: PAGE_SIZE.hello,
        start_from: skip + 1 || 1,
        user_data: getUserData(),
        is_anon: getLocalStorage("is_anon") == 'true',
      },
      {
        headers: {
          authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
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
export async function initializeHelloChat(): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/widget-info/`,
      {
        "user_data": getUserData(),
        "is_anon": getLocalStorage("is_anon") === 'true'
      },
      {
        headers: {
          authorization: `${getLocalStorage('WidgetId')}`,
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
export async function sendMessageToHelloApi(message: string, attachment: Array<object> = [], channelDetail?: any, chat_id?: string, helloVariables: any = {}): Promise<any> {
  let messageType = 'text'
  // Determine message type based on attachment and message content
  if (attachment?.length > 0) {
    if (message === '') {
      messageType = 'attachment'
    } else {
      messageType = 'text-attachment'
    }
  }

  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/v2/send/`,
      {
        type: "widget",
        message_type: messageType,
        content: {
          text: message,
          attachment: attachment,
        },
        ...(!chat_id ? { channelDetail } : {}),
        chat_id: chat_id ? chat_id : null,
        session_id: null,
        user_data: getUserData(),
        is_anon: getLocalStorage("is_anon") == 'true',
        sessionVariables: helloVariables
      },
      {
        headers: {
          authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
          "content-type": "application/json",
        },
      }
    );

    if (channelDetail) {
      setLocalStorage('is_anon', "false");
    }
    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to send message");
    return null;
  }
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
          'authorization': `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
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
  try {
    const isAnon = getLocalStorage("is_anon") == 'true';
    const response = await axios.get(
      `${HELLO_HOST_URL}/web-rtc/get-client-token/?is_anon=${isAnon}`,
      {
        headers: {
          authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
        },
      }
    );
    if (response?.data?.data?.jwt_token) {
      setLocalStorage("HelloClientToken", response?.data?.data?.jwt_token);
    }
    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to get client token for WebRTC");
    return null;
  }
}

// Get call token for WebRTC
export async function getCallToken(channelId?: string): Promise<any> {
  try {
    const isAnon = getLocalStorage("is_anon") == 'true';
    const response = await axios.get(
      `${HELLO_HOST_URL}/web-rtc/get-call-token/?is_anon=${isAnon}${channelId ? `&channel=${channelId}` : ''}`,
      {
        headers: {
          authorization: `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
        },
      }
    );
    if (response?.data?.data?.jwt_token && !channelId) {
      setLocalStorage("HelloCallToken", response?.data?.data?.jwt_token);
    }
    return response?.data?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to get call token for WebRTC");
    return null;
  }
}

// Function to add domain to Hello chat
export async function addDomainToHello({ domain, userEvent = {} }: { domain?: string, userEvent?: Record<string, any> }): Promise<any> {
  try {
    const response = await axios.put(
      `${HELLO_HOST_URL}/add-domain/`,
      {
        dom: domain,
        user_data: {
          ...getUserData(),
          ...userEvent
        },
        is_anon: getLocalStorage("is_anon") == 'true'
      },
      {
        headers: {
          'authorization': `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
          'content-type': 'application/json',
        }
      }
    );
    return response?.data;
  } catch (error: any) {
    // errorToast(error?.message || "Failed to add domain");
    return null;
  }
}
// Delete read receipt for a message
export async function deleteReadReceipt(channelId: string): Promise<any> {
  try {
    const response = await axios.delete(
      `${HELLO_HOST_URL}/read-receipt/${channelId}`,
      {
        headers: {
          'authorization': `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
          'content-type': 'application/json'
        }
      }
    );
    return response?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to delete read receipt");
    return null;
  }
}


// Submit feedback for a conversation
export async function submitFeedback(params: {
  feedbackMsg: string;
  rating: string;
  token: string;
  id: number;
}): Promise<any> {
  try {
    const response = await axios.post(
      `${HELLO_HOST_URL}/receive-feedback/`,
      {
        feedback_msg: params.feedbackMsg,
        rating: params.rating,
        token: params.token,
        type: "post-feedback",
        id: params.id,
        user_data: getUserData(),
        is_anon: getLocalStorage("is_anon") == 'true'
      },
      {
        headers: {
          'authorization': `${getLocalStorage('WidgetId')}:${getLocalStorage('k_clientId') || getLocalStorage('a_clientId')}`,
          'content-type': 'application/json'
        }
      }
    );
    return response?.data;
  } catch (error: any) {
    errorToast(error?.message || "Failed to submit feedback");
    return null;
  }
}

export async function subscribeForFCMPushNotification(data: Record<string, any>, jwtToken: string): Promise<any> {
  try {
    const response = await axios.post(
      `${PUSH_NOTIFICATION_URL}/add-user-fcm-token/`,
      data,
      {
        headers: {
          'authorization': jwtToken,
          'content-type': 'application/json'
        }
      }
    );
    return response?.data;
  } catch (error: any) {
    throw error;
  }
}