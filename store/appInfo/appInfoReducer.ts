import { $AppInfoReduxType } from "@/types/appInfo/appInfoReduxType";
import { PayloadAction } from "@reduxjs/toolkit";

export const initialState: $AppInfoReduxType = {};

export const reducers = {
    setDataInAppInfoReducer(state: $AppInfoReduxType, action: PayloadAction<Partial<$AppInfoReduxType>>) {
        const chatSessionId = action.urlData?.chatSessionId
        return {
            ...state,
            [chatSessionId]: {
                ...state[chatSessionId],
                ...action.payload
            }
        }
    }
};
