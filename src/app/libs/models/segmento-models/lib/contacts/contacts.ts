import { BaseFilterRequest } from '@msg91/models/root-models';
import { RuleSet } from '@msg91/shared';

export interface IAddContactReqModel {
    name: string;
    email: string;
    phone: string;
}

export interface IKeyValuePair<T> {
    [key: string]: T | number | boolean;
}

export interface IGetAllContactResModel extends IKeyValuePair<string> {
    id: string;
    contact_id: string;
}

export interface IGetAllContactsFilterReq extends BaseFilterRequest {
    query: RuleSet;
    columns: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface IUploadFileReq {
    file: any;
    is_first_column_header: boolean;
}

export interface IUploadContactsByFileRes {
    error: string;
    msg: string;
    name: string;
    filename: string;
    num: number;
    numcols: number;
    records: IGetAllContactResModel[];
}

export interface IMapContactAndFileReq {
    file_name: string;
    mappings: { [key: number]: string };
    is_first_column_header: boolean;
}

export interface IDownloadFileUrlModel {
    message: string;
}

export interface IGetSegmentFileUrlToDownloadModel {
    columns: string[];
    query?: any;
}

export interface IGetContactsById {
    _id: {
        $oid: string;
    };
    fields: {
        [key: string]: string;
    };
}

export interface IMessageResponse {
    contact?: IGetAllContactResModel;
    message: string;
}

export interface IDeleteBulkContactReqModel {
    objectIds?: string[];
}

export interface IDateTimeFormatAndDescription {
    description: { [key: string]: string };
    formats: IDateTimeFormat[];
}

export interface IDateTimeFormat {
    format: string;
    example: string;
}

export interface IDateTimeFormatResponse {
    date: IDateTimeFormatAndDescription;
    time: IDateTimeFormatAndDescription;
    Note: string;
}

export interface IMobileContacts {
    id: string;
    phonebookName: string;
    contactsCount: number;
    segments: IMobileSegment[];
    itemsPerPage: number;
    pageNo: number;
    totalPage: number;
}

export interface IMobileSegment {
    id: string;
    name: string;
    contactsCount: number;
}

export interface PhoneBookAutomationCountResModel {
    automation_count: number;
}
export interface ExportResponseModel {
    id: number;
    phonebook_id: number;
    segment_id: string;
    filename: string;
    recipient_email: string;
    exported_contacts: number;
    meta: {
        exportType: string;
    };
    type: number;
    created_at: string;
    updated_at: string;
}

export interface LogTypesModel {
    id: number;
    exportType: string;
}
