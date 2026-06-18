import { all, fork } from "redux-saga/effects";
import InterfaceSaga from "./interface/interfaceSaga";

export default function* rootSaga() {
  yield all([fork(InterfaceSaga)]);
}
