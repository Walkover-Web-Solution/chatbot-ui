export interface TemplateContent {
    text?: string;
    title?: string;
    description?: string;
    media_url?: string;
    location_query?: string;
    url?: string;
    text_to_show?: string;
    end_time?: string;
    start_time?: string;
    replies_list?: string[];
    actions?: Action[];
    image_urls?: string[];
    titles?: string[];
    descriptions?: string[];
    actions_list_of_list?: Action[][];
    replies_list_of_list?: string[][];
}

export interface Action {
    type: 'dial' | 'open_url';
    dial_number?: string;
    url?: string;
    text_to_show: string;
}

export interface Template {
    id: number;
    project_id: string;
    name: string;
    namespace: string;
    status: 'approved' | 'rejected' | 'pending';
    function_name: string;
    content: TemplateContent;
    payload: Payload;
}

export interface Payload {
    customer_number: string;
    project_id: string;
    function_name: string;
    name: string;
    namespace: string;
    variables?: string[];
}

export interface RcsTemplateDataResponse {
    templates: Template[];
    template_count: number;
    total_template_count: number;
    page_size: number;
    page_number: number;
    total_page_count: number;
    errors: any | null;
    hasError?: boolean;
    request: {
        min_monthly_usage: string;
        max_monthly_usage: string;
        from_date: string;
        to_date: string;
        page_number: number;
        page_size: number;
        company_id: string;
    };
}

export interface RcsTemplateRequest {
    min_monthly_usage: string;
    max_monthly_usage: string;
    from_date: string;
    to_date: string;
    page_number: number;
    page_size: number;
    company_id: string;
}

export interface PutRcsTemplateRequest {
    id: number;
    status: string | null; 
}

export interface PutRcsTemplateResponse {
    status: string | null; 
    hasError: boolean;
    data: string;
    errors: any; 
    request: PutRcsTemplateRequest; 
}
