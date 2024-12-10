import { Injectable } from '@angular/core';
import { getCookie } from '../utils';

@Injectable()
export class IdentityVerificationService {
    private _uniqueId: string;
    private _mail: string;
    private _userJwtToken: string;
    private _number: string;

    public set uniqueId(value: string) {
        this._uniqueId = value;
    }

    public set mail(value: string) {
        this._mail = value;
    }

    public set userJwtToken(value: string) {
        this._userJwtToken = value;
    }

    public set number(value: string) {
        this._number = value;
    }

    public getUserData(): {
        user_data: { mail?: string; unique_id?: string; user_jwt_token?: string; number?: string };
        is_anon: boolean;
    } {
        return {
            user_data: {
                ...(this._mail && { mail: this._mail }),
                ...(this._uniqueId && { unique_id: this._uniqueId }),
                ...(this._userJwtToken && { user_jwt_token: this._userJwtToken }),
                ...(this._number && { number: this._number }),
            },
            is_anon: Boolean(getCookie('hello-widget-anonymous-uuid')),
        };
    }
}
