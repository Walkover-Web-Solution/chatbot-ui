export interface $HelloReduxType {
  isHuman: boolean;
  widgetInfo: any;
  anonymousClientId: any;
  socketJwt: { jwt: string };
  ChannelList: any;
  Channel?: any;
  isLoading?: boolean;
  mode?: Array<string | null>;
  helloConfig?: HelloData;
  vision?: boolean;
  channelListData: any;
  currentChannelId?: string;
  currentTeamId?: string;
  currentChatId?: string;
  greeting?: object;
}


export interface HelloData {
  widgetToken: string;
  hide_launcher?: boolean;
  show_widget_form?: boolean;
  show_close_button?: boolean;
  launch_widget?: boolean;
  show_send_button?: boolean;
  unique_id?: string;
  name?: string;
  number?: string;
  mail?: string;
  country?: string;
  city?: string;
  region?: string;
}