// types for the chat reducer and actions
export interface MessageType {
  Id: string
  content: string;
  role: string;
  responseId?: string;
  wait?: boolean;
  timeOut?: boolean;
  createdAt?: string;
  function?: () => void;
  id?: string;
  images?: string[];
  urls?: string[];
  Name?: any[];
  mode?: string;
  isTyping?: boolean;
  time?: string | number;
}

export interface ChatState {
  messages: MessageType[];
  messageIds: { [subThreadId: string]: string[] };
  msgIdAndDataMap: { [subThreadId: string]: { [msgId: string]: MessageType } }
  helloMessages: any[];
  helloMsgIds: { [subThreadId: string]: string[] };
  helloMsgIdAndDataMap: { [subThreadId: string]: { [msgId: string]: any } }
  loading: boolean;
  chatsLoading: boolean;
  options: any[];
  images: string[];
  threadId: string;
  subThreadId: string;
  bridgeName: string;
  helloId: string | null;
  bridgeVersionId: string | null;
  headerButtons: any[];
  starterQuestions: string[];
  currentPage: number;
  hasMoreMessages: boolean;
  isFetching: boolean;
  newMessage: boolean;
  openHelloForm: boolean;
  isToggledrawer: boolean;
  isTyping: Record<string, boolean>;
  skip: number;
  isHuman: boolean;
}


export interface ReduxSetterActionType {
  messages?: MessageType[];
  messageIds?: { [subThreadId: string]: string[] };
  msgIdAndDataMap?: { [subThreadId: string]: { [msgId: string]: MessageType } }
  helloMessages?: any[];
  loading?: boolean;
  chatsLoading?: boolean;
  options?: any[];
  images?: string[] | Array<{ path: string }>;
  threadId?: string;
  subThreadId?: string;
  bridgeName?: string;
  helloId?: string | null;
  bridgeVersionId?: string | null;
  headerButtons?: any[];
  starterQuestions?: string[];
  currentPage?: number;
  hasMoreMessages?: boolean;
  isFetching?: boolean;
  newMessage?: boolean;
  openHelloForm?: boolean;
  isToggledrawer?: boolean;
}

export enum ChatActionTypes {

  ADD_USER_MESSAGE = 'ADD_USER_MESSAGE',
  REMOVE_MESSAGES = 'REMOVE_MESSAGES',
  UPDATE_LAST_ASSISTANT_MESSAGE = 'UPDATE_LAST_ASSISTANT_MESSAGE',
  SET_LOADING = 'SET_LOADING',
  SET_CHATS_LOADING = 'SET_CHATS_LOADING',
  SET_OPTIONS = 'SET_OPTIONS',
  SET_IMAGES = 'SET_IMAGES',
  CLEAR_IMAGES = 'CLEAR_IMAGES',
  SET_THREAD_ID = 'SET_THREAD_ID',
  SET_SUB_THREAD_ID = 'SET_SUB_THREAD_ID',
  SET_BRIDGE_NAME = 'SET_BRIDGE_NAME',
  SET_HELLO_ID = 'SET_HELLO_ID',
  SET_BRIDGE_VERSION_ID = 'SET_BRIDGE_VERSION_ID',
  SET_HEADER_BUTTONS = 'SET_HEADER_BUTTONS',
  SET_STARTER_QUESTIONS = 'SET_STARTER_QUESTIONS',
  SET_CURRENT_PAGE = 'SET_CURRENT_PAGE',
  SET_HAS_MORE_MESSAGES = 'SET_HAS_MORE_MESSAGES',
  SET_IS_FETCHING = 'SET_IS_FETCHING',
  SET_NEW_MESSAGE = 'SET_NEW_MESSAGE',
  SET_OPEN_HELLO_FORM = 'SET_OPEN_HELLO_FORM',
  SET_TOGGLE_DRAWER = 'SET_TOGGLE_DRAWER',
  ADD_HELLO_MESSAGE = 'ADD_HELLO_MESSAGE',
  SET_MESSAGE_TIMEOUT = 'SET_MESSAGE_TIMEOUT',
  RESET_STATE = 'RESET_STATE',
  SET_DATA = 'SET_DATA',
  SET_MESSAGE_FEEDBACK = 'SET_MESSAGE_FEEDBACK',
  UPDATE_SINGLE_MESSAGE = 'UPDATE_SINGLE_MESSAGE',
  SET_TYPING = 'SET_TYPING',
  SET_INTIAL_MESSAGES = 'SET_INTIAL_MESSAGES',
  SET_PAGINATE_MESSAGES = 'SET_PAGINATE_MESSAGES',
  SET_HELLO_EVENT_MESSAGE = 'SET_HELLO_EVENT_MESSAGE',
}

export type ChatAction =
  | { type: ChatActionTypes.ADD_USER_MESSAGE; payload: { content: string; urls?: string[] } }
  | { type: ChatActionTypes.REMOVE_MESSAGES; payload: { numberOfMessages: number } }
  | { type: ChatActionTypes.UPDATE_LAST_ASSISTANT_MESSAGE; payload: Partial<MessageType> }
  | { type: ChatActionTypes.SET_LOADING; payload: boolean }
  | { type: ChatActionTypes.SET_CHATS_LOADING; payload: boolean }
  | { type: ChatActionTypes.SET_OPTIONS; payload: any[] }
  | { type: ChatActionTypes.SET_IMAGES; payload: string[] }
  | { type: ChatActionTypes.CLEAR_IMAGES }
  | { type: ChatActionTypes.SET_THREAD_ID; payload: string }
  | { type: ChatActionTypes.SET_SUB_THREAD_ID; payload: string }
  | { type: ChatActionTypes.SET_BRIDGE_NAME; payload: string }
  | { type: ChatActionTypes.SET_HELLO_ID; payload: string | null }
  | { type: ChatActionTypes.SET_BRIDGE_VERSION_ID; payload: string | null }
  | { type: ChatActionTypes.SET_HEADER_BUTTONS; payload: any[] }
  | { type: ChatActionTypes.SET_STARTER_QUESTIONS; payload: string[] }
  | { type: ChatActionTypes.SET_CURRENT_PAGE; payload: number }
  | { type: ChatActionTypes.SET_HAS_MORE_MESSAGES; payload: boolean }
  | { type: ChatActionTypes.SET_IS_FETCHING; payload: boolean }
  | { type: ChatActionTypes.SET_NEW_MESSAGE; payload: boolean }
  | { type: ChatActionTypes.SET_OPEN_HELLO_FORM; payload: boolean }
  | { type: ChatActionTypes.SET_TOGGLE_DRAWER; payload: boolean }
  | { type: ChatActionTypes.ADD_HELLO_MESSAGE; payload: any, reponseType?: 'assistant' | null }
  | { type: ChatActionTypes.SET_MESSAGE_TIMEOUT }
  | { type: ChatActionTypes.RESET_STATE }
  | { type: ChatActionTypes.SET_DATA; payload: ReduxSetterActionType }
  | { type: ChatActionTypes.SET_MESSAGE_FEEDBACK; payload: any }
  | { type: ChatActionTypes.UPDATE_SINGLE_MESSAGE; payload: any }
  | { type: ChatActionTypes.SET_TYPING; payload: boolean }
  | { type: ChatActionTypes.SET_INTIAL_MESSAGES; payload: any }
  | { type: ChatActionTypes.SET_PAGINATE_MESSAGES; payload: any }
  | { type: ChatActionTypes.SET_HELLO_EVENT_MESSAGE; payload: any }
export interface ChatContextType extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (message: SendMessagePayloadType) => void;
  fetchMoreData: () => Promise<void>;
}

export interface SendMessagePayloadType { message?: string, customVariables?: Record<string, unknown>, customThreadId?: string, customBridgeSlug?: string, apiCall?: boolean }