import { IDMARCDomain } from './dmarc/dmarc';

export * from './admin';
export * from './block-keywords/block-keyword';
export * from './domains/domain';
export * from './webhooks/webhook';
export * from './dashboard/dashboard';
export * from './reports/report';
export * from './log/log';
export * from './supression/supression';
export * from './file-upload/file-upload';
export * from './templates/template';
export * from './failed-logs/failed-logs';
export * from './operation-permission/operation-permission';
export * from './recipient-validation/recipient-validation';
export * from './dmarc/dmarc';
export * from './connections/connections';

export enum MailFromEnums {
    Both = 'Both',
    Smtp = 'SMTP',
    NonSmtp = 'NonSMTP',
}

export interface IEmailOnBoardingData {
    id: number;
    name: string;
    email: string;
    panel_user_id: number;
    panel_id: number;
    role_id: number;
    is_enabled: number;
    meta: {
        permissions: [];
        account_manager_details: {
            id: string;
            name: string;
            email: string;
            mobile: string;
            username: string;
        };
    };
    created_at: string;
    updated_at: string;
    deleted_at: string;
    user_gamification: {
        gamification_id: number;
        id: number;
        user_gamification_subcategory: IEmailGamificationSubCategory[];
    }[];
    knowledge_base?: IEmailKnowledgeBase[];
    dmarc_domains?: IDMARCDomain[];
}

export interface IEmailKnowledgeBase {
    id: number;
    name: string;
    link: string;
    type: string;
    created_at: string;
}

export interface IEmailGamification {
    id: number;
    gamification_type_id: number;
    name: string;
    points: number;
    created_at: string;
    gamification_subcategories: IEmailGamificationSubCategory[];
}

export interface IEmailGamificationSubCategory {
    id: number;
    gamification_id: number;
    name: string;
    points: number;
    created_at: string;
}
