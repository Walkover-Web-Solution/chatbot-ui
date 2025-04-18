import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { ChatAction, ChatActionTypes, ChatState } from './chatTypes';
import { generateNewId } from "@/utils/utilities";

export const initialChatState: ChatState = {
  // Messages and Conversations
  messages: [],
  messageIds: {},
  msgIdAndDataMap: {},
  helloMsgIds: {},
  helloMsgIdAndDataMap: {},
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
    case ChatActionTypes.SET_MESSAGES: {
      const subThreadId = state.subThreadId
      return {
        ...state,
        messages: action.payload,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: Array.from(new Set([
            ...action.payload?.map((item) => item?.Id),
            ...(state.messageIds[subThreadId] || []),
          ])) as string[]
        },
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: {
            ...state.msgIdAndDataMap[subThreadId],
            ...action.payload?.reduce((acc, item) => {
              acc[item?.Id] = item
              return acc
            }, {})
          }
        }
      };
    }
    case ChatActionTypes.ADD_MESSAGE: {
      const subThreadId = state.subThreadId;
      const id = generateNewId();
      return {
        ...state,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: [...state.messageIds[subThreadId], id]
        },
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: {
            ...state.msgIdAndDataMap[subThreadId],
            [id]: action.payload
          }
        }
      };
    }
    case ChatActionTypes.ADD_ASSISTANT_WAITING_MESSAGE: {
      const subThreadId = state.subThreadId;
      const id = generateNewId();
      return {
        ...state,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: [...state.messageIds[subThreadId], id]
        },
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: {
            ...state.msgIdAndDataMap[subThreadId],
            [id]: {
              role: "assistant",
              wait: true,
              content: action.payload?.content || "Talking with AI"
            }
          }
        }
      };
    }
    case ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE: {
      const subThreadId = state.subThreadId
      return {
        ...state,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: [...state.messageIds?.[subThreadId].slice(0, -1), action?.payload?.id]
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
      const { numberOfMessages } = action.payload;
      const subThreadId = state.subThreadId;
      const updatedMapping = { ...state.msgIdAndDataMap[subThreadId] };

      // Get the message IDs that will be removed
      const messageIdsToRemove = state.messageIds?.[subThreadId].slice(-numberOfMessages);

      // Remove these message IDs from the mapping
      messageIdsToRemove.forEach(msgId => {
        delete updatedMapping[msgId];
      });

      return {
        ...state,
        messageIds: {
          ...state.messageIds,
          [subThreadId]: state.messageIds[subThreadId].slice(0, -numberOfMessages)
        },
        msgIdAndDataMap: {
          ...state.msgIdAndDataMap,
          [subThreadId]: updatedMapping
        }
      }
    }
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
    case ChatActionTypes.SET_HELLO_MESSAGES: {
      const subThreadId = state.subThreadId
      return {
        ...state,
        helloMsgIds: {
          ...state.helloMsgIds,
          [subThreadId]: Array.from(new Set(action.payload?.map((item) => item?.message_id))) as string[]
        },
        helloMsgIdAndDataMap: {
          ...state.helloMsgIdAndDataMap,
          [subThreadId]: {
            ...state.helloMsgIdAndDataMap?.[subThreadId],
            ...action.payload?.reduce((acc, item) => {
              if (item.message_id) {
                acc[item?.message_id] = item
                return acc
              }
            }, {})
          }
        }
      };
    }
    case ChatActionTypes.ADD_HELLO_MESSAGE: {
      const currentChatId = action?.payload?.message?.chat_id || state.subThreadId;
      // If the last message ID is the same, we don't add a new message
      // if (action.payload?.reponseType === 'assistant') {
        return {
          ...state,
          helloMsgIds: {
            ...state.helloMsgIds,
            [currentChatId]: Array.from(new Set([
              ...(state.helloMsgIds?.[currentChatId] || []), 
              action.payload?.message?.id
            ].filter(Boolean))) as string[]
          },
          helloMsgIdAndDataMap: {
            ...state.helloMsgIdAndDataMap,
            [currentChatId]: {
              ...state.helloMsgIdAndDataMap?.[currentChatId],
              [action.payload?.message?.id]: action?.payload?.message
            }
          }
        }
      // }
      // return {
      //   ...state,
      //   helloMsgIds: {
      //     ...state.helloMsgIds,
      //     [currentChatId]: [...state.helloMsgIds?.[currentChatId], action.payload?.message?.id]
      //   },
      //   helloMsgIdAndDataMap: {
      //     ...state.helloMsgIdAndDataMap,
      //     [currentChatId]: {
      //       ...state.helloMsgIdAndDataMap?.[currentChatId],
      //       [action.payload.message?.id]: action?.payload?.message
      //     }
      //   }
      // };
    }
    // case ChatActionTypes.ADD_HELLO_MESSAGE: {
    //   // const subThreadId = state.subThreadId
    //   // If the last message ID is the same, we don't add a new message
    //   // if (action.payload?.reponseType === 'assistant') {
    //   //   return {
    //   //     ...state,
    //   //     helloMsgIds: {
    //   //       ...state.helloMsgIds,
    //   //       [subThreadId]: Array.from(new Set([...state.helloMsgIds?.[subThreadId], action.payload?.message?.id])) as string[]
    //   //     },
    //   //     helloMsgIdAndDataMap: {
    //   //       ...state.helloMsgIdAndDataMap,
    //   //       [subThreadId]: {
    //   //         ...state.helloMsgIdAndDataMap?.[subThreadId],
    //   //         [action.payload?.message?.id]: action?.payload?.message
    //   //       }
    //   //     }
    //   //   }
    //   // }
    //   state.helloMessages.push(action.payload?.message)
    //   // return {
    //   //   ...state?.hello,
    //   //   helloMsgIds: {
    //   //     ...state.helloMsgIds,
    //   //     [subThreadId]: [...state.helloMsgIds?.[subThreadId], action.payload?.message?.id]
    //   //   },
    //   //   helloMsgIdAndDataMap: {
    //   //     ...state.helloMsgIdAndDataMap,
    //   //     [subThreadId]: {
    //   //       ...state.helloMsgIdAndDataMap?.[subThreadId],
    //   //       [action.payload.message?.id]: action?.payload?.message
    //   //     }
    //   //   }
    //   // };
    // }
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
    
    case ChatActionTypes.UPDATE_SINGLE_MESSAGE:{
      const subThreadId = state.subThreadId
      const {messageId,data} = action.payload
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