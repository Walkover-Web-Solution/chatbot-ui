const EmbedVerificationStatus = {
  VERIFIED: "verified",
  NOT_VERIFIED: "notVerified",
  VERIFYING: "verifying",
};

const ParamsEnums = {
  orgId: "orgId",
  flowhitid: "flowhitid",
  projectId: "projectId",
  stepId: "stepId",
  slugName: "slugName",
  scriptId: "scriptId",
  tabName: "tabName",
  pluginId: "pluginId",
  actionId: "actionId",
  sectionKey: "sectionKey",
  sectionId: "sectionId",
  inviteId: "inviteId",
  clientId: "clientId",
  sectionIdOrScriptId: "sectionIdOrScriptId",
  versionIdOrStepId: "versionIdOrStepId",
  isPublishedTab: "isPublishedTab",
  versionId: "versionId",
  isTemplate: "isTemplate",
  chatbotId: "chatbotId",
  isConfiguration: "isConfiguration",
  isLogs: "isLogs",
  isSetup: "isSetup",
  embedding: "embedding",
  search: "search",
  serviceId: "serviceId",
  triggerId: "triggerId",
  stepName: "stepName",
  eventId: "eventId",
  chatBotId: "chatBotId",
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
    "gpt-4o",
    "gpt-4o-mini",
    "o1-preview",
    "o1-mini"
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

export { EmbedVerificationStatus, ParamsEnums };
