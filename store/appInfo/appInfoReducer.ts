import { $AppInfoReduxType } from "@/types/appInfo/appInfoReduxType";
import { PayloadAction } from "@reduxjs/toolkit";

export const initialState: $AppInfoReduxType = {};

export const reducers = {
    setDataInAppInfoReducer(state: $AppInfoReduxType, action: PayloadAction<Record<string, any>>) {
        const tabSessionId = action.urlData?.tabSessionId;
        if (tabSessionId) {
            return {
                ...state,
                [tabSessionId]: {
                    ...state[tabSessionId],
                    ...action.payload
                }
            }
        }
    }
};
