export interface IUniqueRecipientsMonthly {
    id: number;
    recipients_count_current_scope: number;
    recipients_count_previous_scope: number;
    unique_recipients_count: number;
    scope: string;
}

export interface IUniqueRecipientsCustom {
    countDateRange1: number;
    countDateRange2: number;
    uniqueEmails: number;
}
