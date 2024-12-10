export interface IWhatsAppNumberResModel {
    id: number;
    whatsapp_number: string;
    team_id: string;
    inbound_setting: string;
    status: string;
    webhook?: string;
    header?: { [key: string]: string };
    outbound_webhook?: string;
    outbound_webhook_header?: { [key: string]: string };
    whatsapp_number_id?: string;
    permanent_access_token?: string;
    whatsapp_business_account_id?: string;
    vendor_id?: number;
    assign_subscription?: any;
}
export interface IWhatsAppReqModel {
    request: IWhatsAppUpdateReqModel;
    id?: number;
}

export interface IWhatsAppUpdateReqModel {
    team_id?: number | string;
    inbound_setting: string;
    webhook?: string;
    whatsapp_number?: string;
    header?: any;
}

export interface IWhatsAppHelloTeamResModel {
    name: string;
    official_numbers: unknown;
    team_id: number;
    agent: IWhatsAppHelloAgentResModel;
}

export interface IWhatsAppHelloAgentResModel {
    id: number;
    name: string;
    number: string;
}

export interface IWhatsappProfileResModel {
    address: string;
    email: string;
    description: string;
    websites: string[];
    vertical: string;
    about: string;
    profile_pic_url: string;
}

export interface IClientLogDropdown {
    delivery_report: string[];
    direction: string[];
    numbers: string[];
    timezone_list: string[];
    usage_type: string[];
}

export interface IBusinessDetailsData {
    details: {
        details_id: number;
        account_mode: string;
        company_id: number;
        eligibility_for_api_business_global_search: string;
        entities: {
            can_send_message: string;
            entity_type: string;
            errors: {
                error_code: number;
                error_description: string;
                possible_solution: string;
            }[];
            id: string;
        }[];
        integrated_number: string;
        is_official_business_account: boolean;
        is_pin_enabled: boolean;
        is_preverified_number: boolean;
        last_message_sent: number;
        last_onboarded_time: number;
        messages_in_a_month: number;
        messaging_limit_tier: number;
        name_status: string;
        new_name_status: string;
        quality_score: number;
        search_visibility: string;
        status: string;
        throughput_level: string;
        verified_name: string;
    }[];
    total_count: number;
}

export interface IClientNumberDropdown {
    inbound_setting: string[];
    vertical: string[];
}

export interface AssignFreePlanReq {
    minimum_spend_limit?: number;
    panel_user_id: number;
    microservice: string;
    integrated_no: string;
}
