import { createSlice } from "@reduxjs/toolkit";
import { initialState, reducers } from "@/store/interface/interfaceReducer";

const interfaceSlice = createSlice({
  name: "Interface",
  initialState,
  reducers,
});

export const {
  getAllInterfaceStart,
  getAllInterfaceSuccess,
  getAllInterfaceError,

  createInterfaceStart,
  createInterfaceSuccess,
  createInterfaceError,

  deleteInterfaceStart,
  deleteInterfaceSuccess,
  deleteInterfaceError,

  updateRenderingJson,
  deleteComponentStart,
  deleteComponentSuccess,
  deleteComponentError,
  updateInterfaceStart,
  updateInterfaceDetailsSuccess,
  updateInterfaceDetailsError,
  updateInterfaceDetailsStart,
  updateInterfaceSuccess,
  updateInterfaceError,
  updateInterfaceActionStart,
  updateInterfaceActionSuccess,
  updateInterfaceActionError,
  updateInterfaceFrontendActionStart,
  updateInterfaceFrontendActionSuccess,
  updateInterfaceFrontendActionError,
  addInterfaceContext,
  addDefaultContext,
  setThreadId,
  setThreads,
  setConfig,


  // chat bot 
  setHeaderActionButtons,
  setEventsSubsribedByParent,
  setAvailableModelsToSwitch,
  setModalConfig,
  setSelectedAIServiceAndModal,
  setDataInInterfaceRedux

} = interfaceSlice.actions;
export default interfaceSlice.reducer;
