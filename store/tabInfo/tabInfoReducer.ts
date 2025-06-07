import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { $TabInfoReduxType } from "../../types/reduxCore";

export const initialState: $TabInfoReduxType = {
  widgetToken: '',
  chatbotId: '',
  tabSessionId: '',
};

export const reducers: ValidateSliceCaseReducers<
  $TabInfoReduxType,
  SliceCaseReducers<$TabInfoReduxType>
> = {
  setDataInTabInfo:(state,action)=> {
    return {...state,...action.payload}
  }
};