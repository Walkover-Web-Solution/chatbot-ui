// types/chatTypes.ts
export type MessageType = {
    content: string;
    role: 'user' | 'assistant' | 'system' | 'Bot' | 'Human';
    responseId?: string;
    wait?: boolean;
    timeOut?: boolean;
    createdAt?: string;
    id?: string;
    images?: string[];
    urls?: string[];
    from_name?: string;
  };
  
  export type HeaderButtonType = Array<{
    label: string;
    action: () => void;
    variant: 'text' | 'contained' | 'outlined';
  }>;
  
  export type ChatState = {
    messages: MessageType[];
    helloMessages: MessageType[];
    loading: boolean;
    hasMoreMessages: boolean;
    currentPage: number;
    threadId: string;
    subThreadId: string;
    bridgeName: string;
    helloId: string | null;
    bridgeVersionId: string | null;
    starterQuestions: string[];
    headerButtons: HeaderButtonType;
    options: any[];
    images: string[];
    chatsLoading: boolean;
    newMessage: boolean;
    isToggledrawer: boolean;
    IsHuman: boolean;
  };
  
  export type ChatAction =
    | { type: 'SET_MESSAGES'; payload: MessageType[] }
    | { type: 'ADD_MESSAGE'; payload: MessageType }
    | { type: 'SET_HELLO_MESSAGES'; payload: MessageType[] }
    | { type: 'ADD_HELLO_MESSAGE'; payload: MessageType }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_CHATS_LOADING'; payload: boolean }
    | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
    | { type: 'INCREMENT_PAGE' }
    | { type: 'SET_THREAD_ID'; payload: string }
    | { type: 'SET_SUB_THREAD_ID'; payload: string }
    | { type: 'SET_BRIDGE_NAME'; payload: string }
    | { type: 'SET_HELLO_ID'; payload: string | null }
    | { type: 'SET_BRIDGE_VERSION_ID'; payload: string | null }
    | { type: 'SET_STARTER_QUESTIONS'; payload: string[] }
    | { type: 'SET_HEADER_BUTTONS'; payload: HeaderButtonType }
    | { type: 'SET_OPTIONS'; payload: any[] }
    | { type: 'SET_IMAGES'; payload: string[] }
    | { type: 'SET_NEW_MESSAGE'; payload: boolean }
    | { type: 'TOGGLE_DRAWER' };