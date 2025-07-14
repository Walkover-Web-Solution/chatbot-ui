export interface $HelloReduxType {
  [chatSessionId: string]: {
    widgetInfo: any;
    anonymousClientId: any;
    socketJwt: { jwt: string };
    ChannelList: any;
    Channel?: any;
    isLoading?: boolean;
    mode?: Array<string | null>;
    helloConfig?: HelloData;
    vision?: boolean;
    channelListData: ChannelListData;
    greeting?: object;
    showWidgetForm?: boolean | null;
    is_anon?: boolean | string;
    agent_teams?: { teams?: Record<string, string>, agents?: Record<string, string> };
  }
}


export interface HelloData {
  isMobileSDK?: boolean;
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
  user_jwt_token?: string;
  pushConfig?: Record<string, any>
  sdkConfig: {
    customTheme?: string
  }
}

export interface ChannelListData {
  customer_name: string;
  customer_number: string | null;
  customer_mail: string | null;
  unique_id: string;
  uuid: string;
  channels: Channel[];
  call_enabled: boolean;
  country: string;
  country_iso2: string | null;
  presence_channel: string;
  pseudo_name: boolean;
  city: string;
  region: string;
  ip: string;
}

export interface Channel {
  id: number;
  channel: string;
  team_id: string | null;
  assigned_to: string | null;
  is_closed: boolean;
  unread_count: number;
  widget_unread_count: number;
  cc_unread_count: number;
  assigned_id: number;
  assigned_type: string;
  last_message: LastMessage;
  total_message_count: number;
}

export interface LastMessage {
  message: Message;
  timetoken: number;
}

export interface Message {
  _id: string;
  type: string;
  message_type: string;
  content: {
    text: string;
    attachment: any | null;
  };
  origin: any | null;
  chat_id: number;
  state: string;
  company_id: number;
  channel: string;
  timetoken: number;
}
