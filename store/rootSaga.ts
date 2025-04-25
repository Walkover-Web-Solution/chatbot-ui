import { all, fork } from "redux-saga/effects";
import InterfaceSaga from "./interface/interfaceSaga.ts";
import HelloSaga from "./hello/helloSaga.ts";

export default function* rootSaga() {
  yield all([fork(InterfaceSaga)]);
  yield all([fork(HelloSaga)]);
}
