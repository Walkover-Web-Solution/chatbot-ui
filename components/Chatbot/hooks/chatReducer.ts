import { convertChatHistoryToGenericFormat, convertEventMessageToGenericFormat } from "@/utils/dataConvertWrappers/makeGenericDataFormatUtility";
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';

export const initialChatState: ChatState = {
  // Messages and Conversations
  messages: [],
  messageIds: {},
  msgIdAndDataMap: {},
  helloMsgIds: {},
  helloMsgIdAndDataMap: {},
  helloMessages: [],
  starterQuestions: [],
  isTyping: {},

  // Loading States
  loading: false,
  chatsLoading: false,
  isFetching: false,

  // UI States
  openHelloForm: false,
  isToggledrawer: false,
  headerButtons: [],

  // Chat Metadata
  threadId: "",
  subThreadId: "",
  bridgeName: "",
  helloId: "",
  bridgeVersionId: "",

  // Pagination & Message Handling
  currentPage: 1,
  hasMoreMessages: true,
  newMessage: false,
  skip: 1,

  // Options & Media
  options: [],
  images: [],
};

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {

    case ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE: {
      const subThreadId = state.subThreadId
      return {
        ...state,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: [action.payload.id, ...state.messageIds?.[subThreadId].slice(1)]
        },
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: {
            ...state.msgIdAndDataMap?.[subThreadId],
            [action.payload.id]: action.payload
          }
        }
      }
    }

    case ChatActionTypes.REMOVE_MESSAGES: {
      const { numberOfMessages = 1 } = action.payload || {};
      const subThreadId = state.subThreadId;

      // Safety guards
      if (!subThreadId) return state;

      const currentIds = state.messageIds?.[subThreadId] || [];
      if (!currentIds.length) return state;                   // nothing to delete

      // Newest messages are at the front, so trim from the start
      const messageIdsToRemove = currentIds.slice(0, numberOfMessages);

      // Build a new mapping without those ids
      const updatedMapping = { ...(state.msgIdAndDataMap[subThreadId] || {}) };
      messageIdsToRemove.forEach(id => delete updatedMapping[id]);

      return {
        ...state,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: currentIds.slice(numberOfMessages)   // keep the rest
        },
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: updatedMapping
        }
      };
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

    case ChatActionTypes.SET_TYPING: {
      const subThreadId = action.payload?.subThreadId || state.subThreadId
      return {
        ...state,
        isTyping: {
          ...state.isTyping,
          [subThreadId]: action.payload?.data
        }
      };
    }
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

    case ChatActionTypes.UPDATE_SINGLE_MESSAGE: {
      const subThreadId = state.subThreadId
      const { messageId, data } = action.payload
      return {
        ...state,
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: {
            ...state.msgIdAndDataMap[subThreadId],
            [messageId]: {
              ...state.msgIdAndDataMap[subThreadId][messageId],
              ...data
            }
          }
        }
      }
    }
    case ChatActionTypes.SET_OPEN_HELLO_FORM: {
      return {
        ...state,
        openHelloForm: action.payload
      };
    }

    case ChatActionTypes.SET_INTIAL_MESSAGES: {
      const subThreadId = action.payload?.subThreadId || state.subThreadId
      const messages = convertChatHistoryToGenericFormat(action.payload.messages, state.isHelloUser)
      if (subThreadId) {
        return {
          ...state,
          messageIds: {
            ...state.messageIds,
            [subThreadId]: messages.map((item) => item.id)
          },
          msgIdAndDataMap: {
            ...state.msgIdAndDataMap,
            [subThreadId]: messages.reduce((acc: Record<string, unknown>, item) => {
              acc[item.id] = item;
              return acc;
            }, {})
          }
        }
      }
    }

    case ChatActionTypes.SET_PAGINATE_MESSAGES: {
      const subThreadId = action.payload?.subThreadId || state.subThreadId
      const messages = action.payload.messages
      const messagesArray = convertChatHistoryToGenericFormat(messages, state.isHelloUser)
      if (subThreadId) {
        return {
          ...state,
          messageIds: {
            ...state.messageIds,
            [subThreadId]: [
              ...(state.messageIds[subThreadId] || []),
              ...messagesArray.map(msg => msg.id)
            ]
          },
          msgIdAndDataMap: {
            ...state.msgIdAndDataMap,
            [subThreadId]: {
              ...(state.msgIdAndDataMap[subThreadId] || {}),
              ...messagesArray.reduce((acc: Record<string, unknown>, item) => {
                acc[item.id] = item;
                return acc;
              }, {})
            }
          }
        };
      }
    }

    case ChatActionTypes.SET_HELLO_EVENT_MESSAGE: {
      const subThreadId = action.payload?.subThreadId || state.subThreadId
      const messagesArray = convertEventMessageToGenericFormat(action.payload.message, state.isHelloUser)
      // console.log(messagesArray[0],'messagesArray')
      if (subThreadId) {
        return {
          ...state,
          messageIds: {
            ...state.messageIds,
            [subThreadId]: [
              ...messagesArray?.map(msg => msg?.id),
              ...(state.messageIds[subThreadId] || [])
            ]
          },
          msgIdAndDataMap: {
            ...state.msgIdAndDataMap,
            [subThreadId]: {
              ...(state.msgIdAndDataMap[subThreadId] || {}),
              ...messagesArray.reduce((acc: Record<string, unknown>, item) => {
                acc[item.id] = item;
                return acc;
              }, {})
            }
          }
        };
      }
    }

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