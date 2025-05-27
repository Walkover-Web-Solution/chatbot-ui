import { SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { $HelloReduxType } from "../../types/hello/HelloReduxType";

export const initialState: $HelloReduxType = {};

export const reducers: ValidateSliceCaseReducers<
  $HelloReduxType,
  SliceCaseReducers<$HelloReduxType>
> = {
  setDataInTabInfo:(state,action)=> {
    return {...state,...action.payload}
  }
};