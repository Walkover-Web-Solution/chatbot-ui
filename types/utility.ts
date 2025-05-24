export default interface actionType<T> {
  payload: T;
  type?: string;
  urlData?: UrlDataType;
}

export interface UrlDataType {
  orgId: string;
  projectId: string;
  stepId: string;
  slugName: string;
  scriptId: string;
  tabName: "draft" | "published";
  pluginId: string;
  actionId: string;
  sectionKey: string;
  sectionId: string;
  inviteId: string;
  clientId: string;
  sectionIdOrScriptId: string;
  versionIdOrStepId: string;
  versionId: string;
  chatSessionId:String
}
