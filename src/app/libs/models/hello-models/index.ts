export interface IClient {
    id: number;
    username: string;
    name: string;
    email_id: string;
    mobile: string;
    agent_count: number;
    team_count: number;
    service_count: number;
    email: IModeActiveStatus;
    voice: IModeActiveStatus;
    cobrowse: ICobrowseModeActiveStatus;
    wa: IModeActiveStatus;
    rcs: IModeActiveStatus;
    video: IModeActiveStatus;
    kb: IModeActiveStatus;
    status: 'active' | 'blocked';
}

export interface IModeActiveStatus {
    active: boolean;
    status: boolean;
}

export interface ICobrowseModeActiveStatus extends IModeActiveStatus {
    cobrowse_vendor: 'cobrowse' | 'hellomedian';
}

export interface IClientReq {
    email?: boolean;
    voice?: boolean;
    cobrowse?: boolean;
    cobrowse_vendor?: 'cobrowse' | 'hellomedian';
    wa?: boolean;
    rcs?: boolean;
    video?: boolean;
    status?: 'active' | 'blocked';
}

export interface ICount {
    company_id: number;
    username: string;
    mail_count: number;
    chat_count: number;
    voice_in_count: number;
    voice_out_count: number;
    cobrowse_count: number;
    video_count: number;
    article_count: number;
    rcs_count: number;
    fb_count: number;
    wa_count?: number;
}

export interface IHelloDashboardData {
    ticket_count: number;
    clients_count: number;
}

export interface IHelloDashboardGraph {
    chat: { count: number; series: { value: number; name: string | Date }[] };
    cobrowse: {
        count: number;
        series: { value: number; name: string | Date }[];
    };
    video: { count: number; series: { value: number; name: string | Date }[] };
    voice: { count: number; series: { value: number; name: string | Date }[] };
}

export interface IHelloReportGraph {
    chat: { count: number; series: { value: number; name: string | Date }[] };
    cobrowse: {
        count: number;
        series: { value: number; name: string | Date }[];
    };
    video: { count: number; series: { value: number; name: string | Date }[] };
    voice: { count: number; series: { value: number; name: string | Date }[] };
}

export interface SlotValue {
    value: string;
}
export interface SlotTypeValue {
    sampleValue: SlotValue;
    synonyms: Array<SlotValue>;
}
export interface SlotTypeCreateRequest {
    name: string;
    description: string;
    values: Array<SlotTypeValue>;
    parentSlotTypeSignature: string;
    type: string;
}
export interface SlotTypeCreateModel extends Omit<SlotTypeCreateRequest, 'values'> {
    values: Array<{
        sampleValue: string;
        synonyms: [];
    }>;
}
export interface SlotMessage {
    message: {
        plainTextMessage: {
            value: string;
        };
    };
}
export interface Slot {
    slot_id: number;
    slot_type_id: number;
    bot_id: number;
    intent_id: number;
    name: string;
    description: string;
    priority: number;
    message: Array<SlotMessage>;
    lex_slot_id: string;
    max_retries: number;
    capture_conditional: {
        active?: boolean;
        conditional_branches?: ConditionalBranchValue[];
    };
}

export interface ConditionalBranchValue {
    name: string;
    condition: {
        expression_string: string;
    };
    next_step: {
        dialog_action?: {
            type: any;
            slot_to_elicit?: string;
        };
        intent?: {
            name: string;
        };
    };
    response: {
        message_groups: Array<{
            message: {
                custom_payload: {
                    value: {
                        type: string;
                        text: {
                            body: string;
                        };
                    };
                };
            };
        }>;
    };
}

export interface FulFillmentPayload {
    id: string | number;
    template_id: string | number;
    intent_id: string;
    slot_name: string;
    slot_id: string;
    variable_name: string;
    variable_id: string;
}

export interface FulFillment {
    fulfillment_enabled: boolean;
    fulfillment_response: string;
    failure_response: string;
    payload: Array<FulFillmentPayload>;
    template_id: number;
    success_conditional?: { [key: string]: any };
    failure_conditional?: { [key: string]: any };
}
export interface IntentDetail {
    intent_id: number;
    intent_name: string;
    description: string;
    confirmation_prompt: string;
    decline_response: string;
    closing_response?: { [key: string]: any };
    initial_response?: { [key: string]: any };
    sample_utterances: Array<{ utterance: string }>;
    slots: Array<Slot>;
    slot_priorities: Array<{ priority: number; slotId: string }>;
    fulfillment: FulFillment;
    initial_response_setting?: { [key: string]: any };
    intent_closing_setting?: { [key: string]: any };
}
export interface SlotType extends SlotTypeCreateRequest {
    id: number;
}
export interface GetSlotResponse extends Slot {
    slot_types: SlotType;
}

export interface BotApiTemplateVariable {
    id: number;
    variable_name: string;
    template_id: number;
}

export interface BotApiTemplateKeys {
    bot_id?: number;
    id?: number;
    key_name: string;
    template_id?: number;
}

export interface IIntentSession {
    name: string;
    value: string;
    session: boolean;
}

export interface BotApiTemplate {
    name: string;
    id?: number;
    request: string;
    url: string;
    payload: { [key: string]: string };
    headers: { [key: string]: string };
    keys: Array<BotApiTemplateKeys>;
    bot_id: number;
    template_id?: number;
    variables?: Array<BotApiTemplateVariable>;
    body_updated?: boolean;
}

export interface ILexWelcomMessageReq {
    bot_id: number;
    company_id: string;
    is_modify: boolean;
    initial_content: string;
}

export interface ILexWelcomMessageFetchReq {
    bot_id: number;
    company_id: string;
}

export interface IFallbackMessage {
    fallback_response: { [key: string]: any };
    enable_gpt: { gpt_bot_id: number };
    fallback_response_threshold: number;
}

export interface IUpdateFallbackMessage extends IFallbackMessage {
    bot_id: number;
    company_id: number;
}

export interface IKeyWord {
    word: string;
    weight: number;
}

export class AgentResponse {
    id: number;
    name: string;
    is_archived?: boolean;
    username: string;
    image_url: string;
    teams: number[];
    hasMessage?: boolean;
    unReadMessage: number;
    header?: string;
    keyword?: IKeyWord[];
    keywordForm?: any;
    email_id?: string;
    personal_number?: string;
    inboxes?: { id: number; name: string }[];
}

export class TeamResponse {
    id: number;
    team_id: number;
    name: string;
    agents?: number[];
    hasMessage?: boolean;
    unReadMessage: number;
    header?: string;
    keyword?: IKeyWord[];
    keywordForm?: any;
    inboxes?: { id: number; name: string }[];
}

export class AgentTeamResponse {
    agents: AgentResponse[] = [];
    teams: TeamResponse[] = [];
}

export interface IReceiveCallPayload {
    agent_id: number;
    longcode_number: string;
    incoming_call_from: string;
}

export interface IAcceptCallPayload {
    agent_id: number;
    longcode_number: string;
    incoming_call_from: string;
    start_time: number;
}

export interface IVoiceCallSetting {
    is_deleted: boolean;
    long_code_number: string;
    mute_status: boolean;
    ringtone_url: string;
    voice_inbox_status: boolean;
    voice_support: boolean;
}

export enum OtherAgentCallActions {
    Whisper = 'whisper',
    Shadow = 'shadow',
    Barge = 'barge',
}
