const EmbedVerificationStatus = {
  VERIFIED: "verified",
  NOT_VERIFIED: "notVerified",
  VERIFYING: "verifying",
};

const ParamsEnums = {
  chatSessionId: "chatSessionId",
  subThreadId: "subThreadId",
  bridgeName: "bridgeName",
  threadId: "threadId",
  versionId: "versionId",
  userId: "userId",
  config: "config",
  currentChannelId: "currentChannelId",
  currentChatId: "currentChatId",
  currentTeamId: "currentTeamId",
  isVision: "isVision",
};

export const KNOWLEDGE_BASE_SECTION_TYPES = [
  { value: "default", label: "Default" },
  { value: "custom", label: "Custom" },
];

export const KNOWLEDGE_BASE_CUSTOM_SECTION = [
  { value: "auto", label: "Auto Detect" },
  { value: "semantic", label: "Semantic Chunking" },
  { value: "manual", label: "Manual Chunking" },
  { value: "recursive", label: "Recursive Chunking" },
];

export const createRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

export const EMIT_EVENTS = {
  FRONT_END_ACTION: 'frontEndAction',
  HEADER_BUTTON_PRESS: 'headerButtonPress'
}

export const ALLOWED_EVENTS_TO_SUBSCRIBE: Record<'MESSAGE_CLICK' | 'USER_TYPING', 'MESSAGE_CLICK' | 'USER_TYPING'> = {
  "MESSAGE_CLICK": "MESSAGE_CLICK",
  "USER_TYPING": "USER_TYPING"
}

export const DEFAULT_AI_SERVICE_MODALS = {
  "openai": [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
    "o1-preview",
    "o1-mini",
    "o3-mini"
  ],
  "anthropic": [
    "claude-3-opus-20240229",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022"
  ],
  "groq": [
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "llama3-70b-8192"
  ]
}


Object.freeze(EmbedVerificationStatus);
Object.freeze(ParamsEnums);

const FeedbackRatings = {
  terrible: 'terrible',
  bad: 'bad',
  ok: 'ok',
  good: 'good',
  amazing: 'amazing',
}

export const PAGE_SIZE = {
  gtwy: 40,
  hello: 30
}

export { EmbedVerificationStatus, ParamsEnums, FeedbackRatings };
