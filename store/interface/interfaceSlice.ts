import { reducers } from "@/store/interface/interfaceReducer";
import { $InterfaceReduxType } from "@/types/interface/InterfaceReduxType";
import { createSlice } from "@reduxjs/toolkit";

const interfaceSlice = createSlice({
  name: "Interface",
  initialState: {} as $InterfaceReduxType,
  reducers
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
  setThreads,


  // chat bot 
  setHeaderActionButtons,
  setEventsSubsribedByParent,
  setAvailableModelsToSwitch,
  setModalConfig,
  setSelectedAIServiceAndModal,
  setDataInInterfaceRedux

} = interfaceSlice.actions;
export default interfaceSlice.reducer;
