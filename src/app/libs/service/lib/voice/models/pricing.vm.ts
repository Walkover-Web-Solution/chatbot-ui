export interface IVoicePricingCountry {
    country_code: string;
    id: number;
    name: string;
    prefix: string;
}
export interface IVoicePricingResponse {
    cid: number;
    dialplan_id: number;
    currency: string;
    network: string;
    international_rates_min: number;
    international_rates_max: number;
    local_rates_min: number;
    local_rates_max: number;
}
