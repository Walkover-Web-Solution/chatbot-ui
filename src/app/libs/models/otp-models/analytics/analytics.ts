export interface IGetAllAnalyticsRequest {
    startDate: string;
    endDate: string;
    groupBy: string;
    timeZone?: string;
}
export interface IGetAllAnalyticsUnitResponse {
    date: string;
    total: number;
    verified: number;
    tokenVerified: number;
    retry: number;
    sms: number;
    email: number;
    voice: number;
}
export interface IGetAllAnalyticsTotal {
    total: number;
    verified: number;
    tokenVerified: number;
    retry: number;
    sms: number;
    email: number;
    voice: number;
}
export interface IGetAllAnalyticsResponse {
    data: IGetAllAnalyticsUnitResponse[];
    total: IGetAllAnalyticsTotal;
    metadata: {
        paginationToken: string;
    };
}

export interface IExportWidgetAnalyticsRequest {
    startDate: string;
    endDate: string;
    companyId?: string;
    timeZone?: string;
    timeZoneName?: string;
}

export interface IExportWidgetLogsRequest extends IExportWidgetAnalyticsRequest {
    fields: string;
}
