export type HeaderButtonType = Array<{ type: 'history' | 'setting' }>;
export type ModalConfigType = { aiServices: { service: "string", modals: string[] }[] , defaultSelected : {service:"string",modal:"string"} }
export type SelectedAiServicesType= {service:"string",modal:"string"}
export interface $InterfaceReduxType {
  selectedAiServiceAndModal : SelectedAiServicesType
  availableAiServicesToSwitch: string[]
  eventsSubscribedByParent: string[]
  headerButtons: HeaderButtonType
  modalConfig: ModalConfigType
  isLoading: boolean;
  threadId: string;
  subThreadId?: string;
  helloId?: string | null;
  version_id?: string | null;
  bridgeName: string;
  interfaceData: {
    [chatbotId: string]: InterFaceDataType;
  };
  interfaceContext: {
    [chatbotId: string]: { [bridgeName: string]: any };
  };
  currentSelectedComponent: {
    [key: string]: any;
  };
}
export interface InterFaceDataType {
  suggestionsArr: any;
  isLoading: boolean;
  _id: string;
  title: string;
  org_id: string;
  project_id: string;
  created_by: string;
  updated_by: string;
  createdAt: string;
  updatedAt: string;
  components: ComponentType;
  coordinates: CoordinateType;
  actions: ActionType;
  frontendActions: FrontendActionType;
  [key: string]: any;
  config: any;
  threadId: string;
  bridgeName: string;
}

export interface CoordinateType {
  [gridId: string]: {
    [componentId: string]: {
      x: number;
      y: number;
      h: number;
      w: number;
      id: string;
    };
  };
}

export interface ComponentType {
  [gridId: string]: {
    [componentId: string]: {
      type: string;
      key: string;
      props: any;
      action: any;
      children: ComponentType;
    };
  };
}
export interface ActionType {
  [componentId: string]: {
    [id: string]: any;
  };
}
export interface FrontendActionType {
  [componentId: string]: {
    [id: string]: any;
  };
}
