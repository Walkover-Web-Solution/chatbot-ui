import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { getHelloDetailsApi } from "@/config/api";
import { errorToast } from "@/components/customToast";
import { getHelloDetailsSuccess } from "./helloSlice";
import { setAvailableModelsToSwitch } from "../interface/interfaceSlice";

export function* getHelloDetailsSaga(
  action: PayloadAction<{
    threadId: string;
    slugName: string;
    helloId?: string | null;
    versionId: string | null;
  }>
): SagaIterator {
  try {
    const {
      threadId,
      slugName,
      helloId = null,
      versionId = null,
    } = action.payload;
    const response: { [key: string]: any } = yield call(getHelloDetailsApi, {
      slugName,
      threadId,
      helloId,
      versionId,
    });
    const receivedHelloId = response?.widgetInfo?.helloId;
    const anonymousClientId = response?.ChannelList?.uuid;
    if (receivedHelloId && anonymousClientId) {
      localStorage.setItem(
        "HelloAgentAuth",
        `${receivedHelloId}:${anonymousClientId}`
      );
    }
    yield put(getHelloDetailsSuccess(response));
    yield put(setAvailableModelsToSwitch(response?.supportedServices))
  } catch (error) {
    errorToast(
      "Error occurred while fetching hello details, please try again later."
    );
  }
}
