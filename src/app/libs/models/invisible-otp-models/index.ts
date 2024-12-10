export interface IInvisibleDialPlans {
    created_at: string;
    currency: string;
    id: number;
    is_active: boolean;
    name: string;
    country_dial_plan: IInvisibleDialPlanPricing[];
}

export interface IInvisibleCountry {
    code: number;
    currency: string;
    id: number;
    name: string;
    short_name: string;
}

export interface IInvisibleDialPlanRequest {
    currency: string;
    name: string;
    id?: number;
}

export interface IInvisibleDialPlanUpdateRequest {
    destination_country_id: number;
    price: number;
    id?: number;
}

interface ICountry {
    id: number;
    name: string;
    code: number;
}

export interface IInvisibleDialPlanPricing {
    is_edit?: boolean;
    id?: number;
    created_at: string;
    destination_country: ICountry[];
    destination_country_id: number;
    price: number;
    source_country: ICountry[];
}

export interface IOperatorPlan {
    destination_country_id: number;
    id: number;
    name: string;
    sekura_charge: {
        USD: number;
        INR: number;
        GBP: number;
    };
    zumigo_charge: {
        USD: number;
        INR: number;
        GBP: number;
    };
    series: {
        prefixes: number[];
    };
    is_edit?: boolean;
}

export interface ISekuraCredentials {
    id: number;
    username: string;
    password: string;
    refresh_token: string;
    company_id: number;
    is_active: true;
    is_default: false;
    created_at: string;
    updated_at: string;
    company: {
        msg91_user_id: number;
        name: string;
        email: string;
    };
}

export interface ICreateSekuraCredentials {
    username: string;
    password: string;
    refresh_token: string;
    company_id?: number;
}
