import { $AppInfoReduxType } from "@/types/appInfo/appInfoReduxType";
import { PayloadAction } from "@reduxjs/toolkit";

export const initialState: $AppInfoReduxType = {
    threadId: '',
    bridgeName:'',
    subThreadId:'',
    userId: '',
    chatBotId: '',
    config:{}
};

export const reducers = {
    setDataInAppInfoReducer(state: $AppInfoReduxType, action: PayloadAction<Partial<$AppInfoReduxType>>) {
        return { ...state, ...action.payload }
    }
};
