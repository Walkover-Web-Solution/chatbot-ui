import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';

export const initialChatState: ChatState = {
  // Messages and Conversations
  messages: [],
  helloMessages: [],
  starterQuestions: [],

  // Loading States
  loading: false,
  chatsLoading: false,
  isFetching: false,

  // UI States
  openHelloForm: false,
  isToggledrawer: true,
  headerButtons: [],

  // Chat Metadata
  threadId: GetSessionStorageData("threadId") || "",
  subThreadId: "",
  bridgeName: GetSessionStorageData("bridgeName") || "root",
  helloId: GetSessionStorageData("helloId") || null,
  bridgeVersionId: GetSessionStorageData("version_id") || null,

  // Pagination & Message Handling
  currentPage: 1,
  hasMoreMessages: true,
  newMessage: false,

  // Options & Media
  options: [],
  images: [],
};

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case ChatActionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    case ChatActionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.payload
          }
        ]
      };
    case ChatActionTypes.ADD_ASSISTANT_WAITING_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            wait: true,
            content: action.payload?.content || "Talking with AI"
          }
        ]
      };
    case ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, -1),
          {
            role: action.payload.role || "assistant",
            ...action.payload
          }
        ]
      };
    case ChatActionTypes.REMOVE_MESSAGES:
      const { numberOfMessages } = action.payload;
      const newMessages = state.messages.slice(0, -numberOfMessages);
      return {
        ...state,
        messages: newMessages
      };
    case ChatActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ChatActionTypes.SET_CHATS_LOADING:
      return {
        ...state,
        chatsLoading: action.payload
      };
    case ChatActionTypes.SET_OPTIONS:
      return {
        ...state,
        options: action.payload
      };
    case ChatActionTypes.SET_IMAGES:
      return {
        ...state,
        images: action.payload
      };
    case ChatActionTypes.CLEAR_IMAGES:
      return {
        ...state,
        images: []
      };
    case ChatActionTypes.SET_THREAD_ID:
      return {
        ...state,
        threadId: action.payload
      };
    case ChatActionTypes.SET_SUB_THREAD_ID:
      return {
        ...state,
        subThreadId: action.payload
      };
    case ChatActionTypes.SET_BRIDGE_NAME:
      return {
        ...state,
        bridgeName: action.payload
      };
    case ChatActionTypes.SET_HELLO_ID:
      return {
        ...state,
        helloId: action.payload
      };
    case ChatActionTypes.SET_BRIDGE_VERSION_ID:
      return {
        ...state,
        bridgeVersionId: action.payload
      };
    case ChatActionTypes.SET_HEADER_BUTTONS:
      return {
        ...state,
        headerButtons: action.payload
      };
    case ChatActionTypes.SET_STARTER_QUESTIONS:
      return {
        ...state,
        starterQuestions: action.payload
      };
    case ChatActionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      };
    case ChatActionTypes.SET_HAS_MORE_MESSAGES:
      return {
        ...state,
        hasMoreMessages: action.payload
      };
    case ChatActionTypes.SET_IS_FETCHING:
      return {
        ...state,
        isFetching: action.payload
      };
    case ChatActionTypes.SET_NEW_MESSAGE:
      return {
        ...state,
        newMessage: action.payload
      };
    case ChatActionTypes.SET_OPEN:
      return {
        ...state,
        open: action.payload
      };
    case ChatActionTypes.SET_TOGGLE_DRAWER:
      return {
        ...state,
        isToggledrawer: action.payload
      };
    case ChatActionTypes.SET_HELLO_MESSAGES:
      return {
        ...state,
        helloMessages: action.payload
      };
    case ChatActionTypes.ADD_HELLO_MESSAGE:
      // If the last message ID is the same, we don't add a new message
      if (action.payload?.reponseType === 'assistant') {
        const lastMessageId = state.helloMessages.length > 0 ? state.helloMessages[state.helloMessages.length - 1]?.id : undefined;
        if (lastMessageId !== action.payload?.message?.id) {
          return {
            ...state,
            helloMessages: [
              ...state.helloMessages,
              {
                role: action.payload.role || "assistant",
                ...action.payload.message,
              }
            ]
          };
        }
        return state
      }
      return {
        ...state,
        helloMessages: [...state.helloMessages, action.payload.message]
      };
    case ChatActionTypes.SET_MESSAGE_TIMEOUT:
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, -1),
          { role: "assistant", wait: false, timeOut: true }
        ],
        loading: false
      };
    case ChatActionTypes.SET_DATA:
      return {
        ...state,
        ...action.payload
      };
    case ChatActionTypes.RESET_STATE:
      return {
        ...initialChatState,
        threadId: state.threadId,
        bridgeName: state.bridgeName,
        helloId: state.helloId,
        bridgeVersionId: state.bridgeVersionId,
        headerButtons: state.headerButtons
      };
    default:
      return state;
  }
};