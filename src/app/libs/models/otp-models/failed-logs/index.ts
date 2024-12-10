export interface ISMSFailedLogsResModel {
    requestId: string;
    date: string;
    sender: string;
    mobile: string;
    message: string;
    errorCode: string;
    codeDesc: string;
    userIp: string;
}

export interface ISMSFailedLogs {
    data: ISMSFailedLogsResModel[];
}

export interface ISMSFailedLogRequestBody {
    startDate: string;
    endDate: string;
    pageNo: number;
    itemsPerPage: string;
    codes: string[];
}

export interface ISMSStatusCodeRes {
    count: number;
    status_code: number;
    message: string;
}

export interface ISMSFailedLogsCount {
    count: number;
    message: string;
    status_code: number;
}

export interface IWidgetLogsRes {
    data: IWidgetLogs[];
    metadata: Metadata;
}

export interface IWidgetLogs {
    id: string;
    widgetId: string;
    companyId: number;
    identifier: string;
    requestTime: string;
    token: string;
    verified: boolean;
    tokenVerified: boolean;
    verifyRetryCount: number;
    retryCount: number;
    report: string[];
}

export interface Metadata {
    total: number;
    datasetId: string;
    tableId: string;
    paginationToken: string;
}
