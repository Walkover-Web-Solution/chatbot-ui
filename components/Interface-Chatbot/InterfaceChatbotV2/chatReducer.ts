// reducers/chatReducer.ts
import { ChatState, ChatAction } from './chatTypes';

export const initialState: ChatState = {
  messages: [],
  helloMessages: [],
  loading: false,
  hasMoreMessages: true,
  currentPage: 1,
  threadId: '',
  subThreadId: '',
  bridgeName: 'root',
  helloId: null,
  bridgeVersionId: null,
  starterQuestions: [],
  headerButtons: [],
  options: [],
  images: [],
  chatsLoading: false,
  newMessage: false,
  isToggledrawer: true,
};

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'SET_HELLO_MESSAGES':
      return { ...state, helloMessages: action.payload };
    
    case 'ADD_HELLO_MESSAGE':
      return { ...state, helloMessages: [...state.helloMessages, action.payload] };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CHATS_LOADING':
      return { ...state, chatsLoading: action.payload };
    
    case 'SET_HAS_MORE_MESSAGES':
      return { ...state, hasMoreMessages: action.payload };
    
    case 'INCREMENT_PAGE':
      return { ...state, currentPage: state.currentPage + 1 };
    
    case 'SET_THREAD_ID':
      return { ...state, threadId: action.payload };
    
    case 'SET_SUB_THREAD_ID':
      return { ...state, subThreadId: action.payload };
    
    case 'SET_BRIDGE_NAME':
      return { ...state, bridgeName: action.payload };
    
    case 'SET_HELLO_ID':
      return { ...state, helloId: action.payload };
    
    case 'SET_BRIDGE_VERSION_ID':
      return { ...state, bridgeVersionId: action.payload };
    
    case 'SET_STARTER_QUESTIONS':
      return { ...state, starterQuestions: action.payload };
    
    case 'SET_HEADER_BUTTONS':
      return { ...state, headerButtons: action.payload };
    
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    
    case 'SET_IMAGES':
      return { ...state, images: action.payload };
    
    case 'SET_NEW_MESSAGE':
      return { ...state, newMessage: action.payload };
    
    case 'TOGGLE_DRAWER':
      return { ...state, isToggledrawer: !state.isToggledrawer };
    
    default:
      return state;
  }
};