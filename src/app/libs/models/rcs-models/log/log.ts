export interface ILogReqModel {
    receiver: string;
    from_date: Date;
    to_date: Date;
    status: string;
    failure_reason: string;
    page_number?: number;
    page_size?: number;
    direction?: string;
    whatsapp_number?: string;
    customer_number?: string;
    customerNumber?: string;
    order_type?: string;
    order_by?: string;
    time_zone?: string;
    usage_type?: string;
    client_name?: string;
    request_id?: string;
    requestId?: string;
    limit?: number;
    offset?: number;
    paginationToken?: string;
    startDate?: string;
    endDate?: string;
    integratedNumber?: string;
    timeZone?: string;
    message_type?: string;
    campaignName?: string;
}

export interface ILogModel {
    campaignName: string;
    campaignRequestId: string;
    content: string;
    customerNumber: string;
    deliveryTime: string;
    direction: number;
    integratedNumber: string;
    messageType: string;
    origin: string;
    pluginSource: string;
    price: string;
    readTime: string;
    reason: string;
    requestId: string;
    requestedAt: string;
    sentTime: string;
    status: string;
    statusUpdatedAt: string;
    templateName: string;
    uuid: string;
    vendorId: string;
}

export interface ILogRespModel {
    // log_count: number;
    // log_data: ILogModel[];
    // total_log_count: string | number;
    data: ILogModel[];
    metadata: {
        limit: number;
        paginationToken: string;
        stats: any;
        offset?: number;
        tableId: string;
        datasetId: string;
    };
}
