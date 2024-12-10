export interface IConnection {
    created_at: string;
    deleted_at: string;
    email: string;
    expired_at: string;
    id: number;
    meta: { [key: string]: any };
    name: string;
    provider: string;
    status: string;
    type: string;
    updated_at: string;
    user_id: string | number;
    username: string;
}

export interface ICreateConnection {
    type: string;
    provider: string;
    status: string;
    authorization_code: string;
    redirect_url: string;
}

export enum ProvidersEnum {
    Outlook = 'OUTLOOK',
    Gmail = 'GMAIL',
}

export const PROVIDERS_ICON_PATH = {
    [ProvidersEnum.Gmail]: 'assets/images/microservice-icon/gmail-api.svg',
    [ProvidersEnum.Outlook]: 'assets/images/microservice-icon/outlook.svg',
};
