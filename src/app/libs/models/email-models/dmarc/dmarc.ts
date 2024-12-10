export interface IDMARCDomain {
    id: number;
    user_id: number;
    domain: string;
    dmarc_status_id: number;
    dmarc: IDomainDMARCData;
    meta: any;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    settings: IDMARCDomainSetting;
}

export interface IDomainDMARCData {
    key: string;
    value: string;
    record: string;
    current_value: string;
}

export interface IDMARCDomainSetting {
    id: number;
    dmarc_domain_id: number;
    cf_record_id: string;
    policy: string;
    percentage: number;
    aggregate_report_emails: string;
    forensic_report_emails: string;
    forensic_reporting_options: string;
    spf_aligned: string;
    dkim_aligned: string;
    reporting_interval: number;
    subdomain_policy: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface IVolumeDistributionData {
    compliant_count: string;
    date: string;
    forwarded_count: string;
    non_compliant_count: string;
    threat_unknown_count: string;
}

export interface ISenderData {
    count: number;
    sender_country: string;
}

export interface IReporterData {
    count: number;
    reporter: string;
}

export interface IGeoLocationData {
    count: number;
    sender_country: string;
}

export interface IGeoLocationTopData {
    [key: string]: { country: string; count: string }[];
}

export interface IDMARCFilterData {
    [key: string]: string[];
}

export interface IDMARCDomainUpdateReq {
    policy: string;
    percentage: number;
    aggregate_report_emails: string[];
    forensic_report_emails: string[];
    forensic_reporting_options: string;
    spf_aligned: string;
    dkim_aligned: string;
    reporting_interval: number;
    subdomain_policy: string;
}

export interface IDMARCComplianceTableData {
    compliant_count: string;
    count: string;
    dkim_pass_count: string;
    forwarded_count: string;
    from_domain: string;
    non_compliant_count: string;
    spf_pass_count: string;
    threat_count: string;
    total_volume: string;
}

export interface IDMARCComplianceSenderTableData {
    compliant_count: string;
    count: string;
    dkim_pass_count: string;
    forwarded_count: string;
    non_compliant_count: string;
    sender_name: string;
    spf_pass_count: string;
    threat_count: string;
    total_volume: string;
}

export interface IDMARCComplianceSenderData {
    count: string;
    created_at: string;
    delivery_status: string;
    dkim_aligned: string;
    dkim_auth_result: string;
    dmarc_compliance: string;
    dmarc_domain_id: string;
    dmarc_report_id: string;
    from_date: string;
    from_domain: string;
    id: string;
    policy_override_reason: string;
    reporter: string;
    sender_country: string;
    sender_ip: string;
    sender_name: string;
    sender_rdns: string;
    spf_aligned: string;
    spf_auth_result: string;
    to_date: string;
    updated_at: string;
}
