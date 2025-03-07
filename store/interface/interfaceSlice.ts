import { createSlice } from "@reduxjs/toolkit";
import { initialState, reducers } from "@/store/interface/interfaceReducer";

const interfaceSlice = createSlice({
  name: "Interface",
  initialState,
  reducers,
});

export const {
  toggleNestedGridSliderOpen,
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
  setConfigModalState,
  updateComponentProps,
  deleteComponentStart,
  deleteComponentSuccess,
  deleteComponentError,
  updateInterfaceStart,
  updateInterfaceDetailsSuccess,
  updateInterfaceDetailsError,
  updateInterfaceDetailsStart,
  updateInterfaceSuccess,
  updateInterfaceError,
  getInterfaceDataByIdStart,
  getInterfaceDataByIdSuccess,
  getInterfaceDataByIdError,
  updateInterfaceActionStart,
  updateInterfaceActionSuccess,
  updateInterfaceActionError,
  updateInterfaceFrontendActionStart,
  updateInterfaceFrontendActionSuccess,
  updateInterfaceFrontendActionError,
  setConfigSlider,
  resetConfigModalState,
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
  setSelectedAIServiceAndModal

} = interfaceSlice.actions;
export default interfaceSlice.reducer;
