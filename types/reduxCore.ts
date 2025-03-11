import { AppInfoReduxType } from "./AppInfoState.ts";
import { FlowJsonType, UsedVariableType } from "./FlowJson.ts";
import { ContextType, InvocationDataType } from "./Invocation.ts";
import { OrganizationInfoType } from "./Organization.ts";
import { ScriptsInfoType } from "./ScriptsInfo.ts";
import { PluginFields } from "./DHPlugin.ts";
import {
  ActionFields,
  ActionVersionFields,
  //  ActionVersionDataType, ActionVersionFields
} from "./DHAction.ts";
import {
  AuthFieldsType,
  // allAuthDataType
} from "./DHAuthentication.ts";
import { Projects } from "./Projects.ts";
import {
  ActionType,
  PluginButtonType,
  PluginInfoAirtableType,
  PluginInputDataType,
  PluginInputJsonType,
  PluginResponseType,
} from "./Plugin.ts";
import { $InterfaceReduxType } from "./interface/InterfaceReduxType.ts";
import { $HelloReduxType } from "./hello/HelloReduxType.ts";

export interface $ReduxCoreType {
  Hello: $HelloReduxType;
  Interface: $InterfaceReduxType;
}
export interface $UserInfoReduxType {
  first_name: string;
  last_name: string;
  email: string;
  profile_pic: string;
  id: string;
  isLoading: boolean;
  userId: string;
}
export interface $AllPluginsType {
  isLoading: boolean;
  isLoadingAction: boolean;
  allPluginList: PluginInfoAirtableType[];
  allTriggersList: PluginInfoAirtableType[];
  allActionOfSelectedPluginOrTriggerList: ActionType[];
  allActionOfTriggerList: ActionType[];
  pluginData: any;
}

// @auther sid chanhal anushka
export interface $CurrentSelectedPluginType {
  isLoading: boolean;
  isAuthLoading: boolean;
  isVerify: boolean;
  pluginInputJson: PluginInputJsonType; // Parsed code that come from pluginInfoAirtable
  pluginResponse: PluginResponseType; // response from BE
  pluginData: PluginInputDataType; // Parsed code that come from pluginResponse
  buttonStatus: PluginButtonType; // status of dry run and save
  requiredFieldsList: string[]; // string of key of required fields
  optionalFieldVisibility: {
    [flattenKey: string]: boolean;
  };
}
// @auther idiris
export interface $AllChipType {
  isSuggestionOpen: boolean;
  pathsObject: any;
  apiSnippet: any;
}
export interface $OrgReduxType {
  orgs: any;
  orgIdAndDataMapping: { [id: string]: OrganizationInfoType }; // orgsid and orgdata mapping
  orgsIdArr: string[]; // list of orgs
  isLoading: boolean;
}
export interface $ProjectReduxType {
  projects: { [id: string]: Projects };
  projectIdArr: string[];
  isLoading: boolean;
}
export interface $ScriptReduxType {
  scripts: { [id: string]: ScriptsInfoType };
  projectIdAndScriptArrMapping: { [id: string]: string[] };
  isLoading: boolean;
}
export interface $FlowJsonReduxType {
  [key: string]: {
    flowJson: FlowJsonType; // ******** FLOW JSON ******** :)
    publishedFlowJson: FlowJsonType;
    draftedFlowJson: FlowJsonType;
    isLoading: boolean;
    isCronEditable: boolean;
    isCronLoading: boolean;
    isTriggerEditable: boolean;
    isTriggerLoading: boolean;
    stepOrder: string[];
    showError: boolean;
    usedVariables: UsedVariableType;
    publishUsedVariables: UsedVariableType;
  };
}
export interface $InvocationReduxType {
  invocationData: InvocationDataType;
  groupedSuggestions: any;
  context: {
    context: ContextType;
  };
  usedVariables: UsedVariableType;
  isLoading: boolean;
  showUsedVariables: boolean;
}

export interface $StepsReduxTypeV3 {
  [scriptId: string]: {
    [stepId: string]: {
      dataFromBackend: {
        id: string;
        title: string;
        code: any;
        published_code: any;
        script_id: string;
        type: string;
        created_by: string;
        updated_by: string;
        auth_id: any;
        action_id: any;
        createdAt: string;
        updatedAt: string;
      };
      draft: { [key: string]: any };
      published: { [key: string]: any };
      isLoading: boolean;
      hasUnsavedCode: boolean;
    };
  };
}

export interface $DHPluginReduxType {
  [orgId: string]: {
    [pluginId: string]: PluginFields;
  };
}
// [pluginId: string]: PluginFields | boolean  this condition helps to create isLoading : true || false in state and will also handle pluginId to data mapping

// export interface $DHAuthenticationType {
//   allAuthData: allAuthDataType
//   fields: AuthFieldsType
//   isLoading: boolean
// }

export interface $DHAuthenticationType {
  [pluginId: string]:
  | {
    [authRowId: string]: AuthFieldsType | boolean;
  }
  | boolean;
}

export interface $DHActionReduxType {
  // allTriggersData: ActionFields[]
  // allActionsData: ActionFields[]
  // allCustomActionData: ActionFields[]
  // actionDetails: ActionFields
  // triggerDetails: ActionFields
  // actionVersionsData: ActionVersionDataType
  // actionVersionDetails: ActionVersionFields
  // isLoading: boolean
  [pluginId: string]: actionReduxObjectType;
}

export interface actionReduxObjectType {
  allActionsData: {
    [actionId: string]: ActionFields;
  };
  allTriggersData: {
    [actionId: string]: ActionFields;
  };
  allCustomActionData: {
    [actionId: string]: ActionFields;
  };
  isLoading: boolean;
}
export interface $DHActionVersionReduxType {
  [actionId: string]: {
    [actionVersionId: string]: ActionVersionFields;
  };
}
