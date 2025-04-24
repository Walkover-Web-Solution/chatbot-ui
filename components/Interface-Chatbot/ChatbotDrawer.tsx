'use client';

import { createNewThreadApi } from "@/config/api";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setHelloKeysData } from "@/store/hello/helloSlice";
import { setThreadId, setThreads } from "@/store/interface/interfaceSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ParamsEnums } from "@/utils/enums";
import { useMediaQuery, useTheme } from "@mui/material";
import { AlignLeft, ChevronRight, SquarePen, Users } from "lucide-react";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { ChatActionTypes } from "../Chatbot/hooks/chatTypes";
import helloVoiceService from "../Chatbot/hooks/HelloVoiceService";
import { useCallUI } from "../Chatbot/hooks/useCallUI";
import { useReduxStateManagement } from "../Chatbot/hooks/useReduxManagement";
import { ChatbotContext } from "../context";
import { MessageContext } from "./InterfaceChatbot";
import { deleteReadReceipt } from "@/config/helloApi";

const createRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

interface ChatbotDrawerProps {
  setLoading: (loading: boolean) => void;
  chatbotId: string;
  isToggledrawer: boolean;
  setToggleDrawer: (isOpen: boolean) => void;
  preview?: boolean;
}

const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({ setLoading, chatbotId, setToggleDrawer, isToggledrawer, preview = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { setNewMessage } = useContext(MessageContext);
  const isSmallScreen = useMediaQuery('(max-width:1023px)');
  const { setOptions, chatDispatch, fetchHelloPreviousHistory, images, setImages ,fetchChannels} = useContext(MessageContext);
  const { currentChatId, currentTeamId, } = useReduxStateManagement({ chatbotId, chatDispatch });
  const { callState } = useCallUI();
  const { reduxThreadId, subThreadList, reduxSubThreadId, reduxBridgeName, teamsList, channelList, isHuman, Name, tagline } =
    useCustomSelector((state: $ReduxCoreType) => ({
      reduxThreadId: GetSessionStorageData("threadId") || state.appInfo?.threadId || "",
      reduxSubThreadId: state.appInfo?.subThreadId || "",
      reduxBridgeName:
        GetSessionStorageData("bridgeName") ||
        state.appInfo?.bridgeName ||
        "root",
      subThreadList:
        state.Interface?.interfaceContext?.[chatbotId]?.[
          GetSessionStorageData("bridgeName") ||
          state.appInfo?.bridgeName ||
          "root"
        ]?.threadList?.[
        GetSessionStorageData("threadId") || state.appInfo?.threadId
        ] || [],
      teamsList: state.Hello?.widgetInfo?.teams || [],
      channelList: state.Hello?.channelListData?.channels || [],
      isHuman: state.Hello?.isHuman || false,
      Name: state.Hello?.channelListData?.customer_name || '',
      tagline: state.Hello?.widgetInfo?.tagline || ''
    }));


  const selectedSubThreadId = reduxSubThreadId;

  const handleCreateNewSubThread = async () => {
    if (preview) return;
    const result = await createNewThreadApi({
      threadId: reduxThreadId,
      subThreadId: createRandomId(),
    });
    if (result?.success) {
      dispatch(
        setThreads({
          newThreadData: result?.thread,
          bridgeName: GetSessionStorageData("bridgeName") || reduxBridgeName,
          threadId: reduxThreadId,
        })
      );
      setOptions([]);
    }
  };
  const handleChangeSubThread = (sub_thread_id: string) => {
    setLoading(false);
    dispatch(setThreadId({ subThreadId: sub_thread_id }));
    dispatch(setDataInAppInfoReducer({ subThreadId: sub_thread_id }))
    setNewMessage(true);
    setOptions([]);
    if (isSmallScreen) {
      setToggleDrawer(false);
    }
  };

  const DrawerList = (
    <div className="menu p-0 w-full h-full bg-base-200 text-base-content">
      {(subThreadList || []).length === 0 ? (
        <div className="flex justify-center items-center mt-5">
          <span>No Conversations</span>
        </div>
      ) : (
        <ul>
          {subThreadList.map((thread: any, index: number) => (
            <li key={`${thread?._id}-${index}`}>
              <a
                className={`${thread?.sub_thread_id === selectedSubThreadId ? 'active' : ''}`}
                onClick={() => handleChangeSubThread(thread?.sub_thread_id)}
              >
                {thread?.display_name || thread?.sub_thread_id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const handleChangeChannel = async (channelId: string, chatId: string, teamId: string, widget_unread_count: number) => {
    dispatch(setHelloKeysData({ currentChannelId: channelId, currentChatId: chatId, currentTeamId: teamId }));
    dispatch(setDataInAppInfoReducer({ subThreadId: channelId }));
    fetchHelloPreviousHistory(channelId);
    isSmallScreen && setToggleDrawer(false)
    images?.length > 0 && setImages([])
    if (widget_unread_count > 0) {
      await deleteReadReceipt(channelId);
      fetchChannels()
    }

  }
  const handleChangeTeam = (teamId: string) => {
    dispatch(setHelloKeysData({ currentTeamId: teamId, currentChannelId: "", currentChatId: "" }));
    dispatch(setDataInAppInfoReducer({ subThreadId: '' }));
    chatDispatch({ type: ChatActionTypes.SET_HELLO_MESSAGES, payload: { teamId: teamId, data: [] } });
    isSmallScreen && setToggleDrawer(false)
    images?.length > 0 && setImages([])
  }

  const closeToggleDrawer = (isOpen: boolean) => {
    if (isHuman) {
      if (currentTeamId)
        setToggleDrawer(isOpen)
    }
    else {
      setToggleDrawer(isOpen)
    }
  }


  const handleVoiceCall = () => {
    helloVoiceService.initiateCall();
  }

  const TeamsList = (
    <div className="teams-container p-2 relative gap-6 flex flex-col">
      {/* Conversations Section */}
      {(channelList || []).length > 0 && channelList.some((thread: any) => thread?.id) && (
        <div className="conversations-section border-b">
          <div className="conversations-header mb-1 pb-2">
            <h3 className="text-md font-semibold">Continue Conversations</h3>
          </div>
          <div className="conversations-list space-y-2">
            {channelList
              .filter((channel: any) => channel?.id)
              .map((channel: any, index: number) => (
                <div
                  key={`${channel?._id}-${index}`}
                  className={`conversation-card overflow-hidden text-ellipsis p-3 ${channel?.id === currentChatId ? 'border-2 border-primary' : ''} bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center`}
                  style={{
                    borderColor: channel?.id === currentChatId ? theme.palette.primary.main : ''
                  }}
                  onClick={() => handleChangeChannel(channel?.channel, channel?.id, channel?.team_id, channel?.widget_unread_count)}
                >
                  <div className="conversation-info flex-1 min-w-0 pr-2">
                    <div className="conversation-name text-xs text-gray-400 break-words">
                      Conversation
                    </div>
                    {channel?.last_message && (
                      <div className="last-message text-sm text-black font-medium mt-1 truncate flex flex-row items-center gap-1">
                        {!channel.last_message?.message?.sender_id ? "You: " : "Sender: "}
                        <div dangerouslySetInnerHTML={{
                          __html: channel.last_message.message?.content?.text ||
                            (channel.last_message.message?.content?.attachment?.length > 0 ? "Attachment" :
                              channel.last_message.message?.message_type ||
                              "New conversation")
                        }}></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    {channel?.widget_unread_count > 0 && (
                      <div className="text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2" style={{ backgroundColor: theme.palette.primary.main }}>
                        {channel?.widget_unread_count}
                      </div>
                    )}
                    <ChevronRight size={16} className="text-gray-800" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Teams Section */}
      <div className="teams-section">
        <div className="teams-header mb-1 border-b pb-2 flex items-center">
          <SquarePen size={22} color="#555555" className="mr-2" />
          <h3 className="text-lg font-semibold">Talk to our experts</h3>
          {/* <p className="text-xs text-gray-500">Connect with our experts</p> */}
        </div>
        <div className="teams-list space-y-0">
          {teamsList.map((team: any, index: number) => (
            <div
              key={`${team?.id}-${index}`}
              className={`team-card overflow-hidden text-ellipsis p-3 bg-white  shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start ${currentTeamId === team?.id ? '' : ''}`}
              onClick={() => handleChangeTeam(team?.id)}
            >
              <div className="team-avatar mr-3 bg-primary/10 p-2 rounded-md flex-shrink-0">
                {team?.icon || <Users size={12} className="text-primary" />}
              </div>
              <div className="team-info">
                <div className="team-name font-medium break-words">{team?.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="marketing-banner mt-4 p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
        <p className="text-sm font-medium">Need specialized help?</p>
        <p className="text-xs">Our teams are ready to assist you with any questions</p>
        <button
          className={`mt-2 text-xs py-1 px-3 rounded-md transition-colors ${callState !== "idle" ? "bg-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/80"}`}
          onClick={handleVoiceCall}
          disabled={callState !== "idle"}
        >
          Call Us
        </button>
      </div>
    </div>
  )

  return (
    <div className="drawer z-[10]">
      <input
        id="chatbot-drawer"
        type="checkbox"
        className="drawer-toggle lg:hidden"
        checked={isToggledrawer}
        onChange={(e) => setToggleDrawer(e.target.checked)}
      />

      {/* Backdrop overlay for mobile */}
      {isToggledrawer && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => closeToggleDrawer(false)}
        />
      )}

      <div className={`drawer-side ${isHuman && isSmallScreen ? '100%' : 'max-w-[265px]'} ${isToggledrawer ? 'lg:translate-x-0' : 'lg:-translate-x-full'} transition-transform duration-100`}>
        <div className="p-4 w-full min-h-full text-base-content relative bg-base-200 border-r-base-300 border overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10">
              {isToggledrawer && <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" onClick={() => { closeToggleDrawer(!isToggledrawer) }}> <AlignLeft size={22} color="#555555" /></button>}
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <h2 className="text-lg font-bold text-center">{Name ? `Hello ${Name}` : 'Hello There!'}</h2>
              {tagline && Name && <p className="text-xs text-gray-500 text-center">{tagline}</p>}
            </div>
            <div className="w-10 flex items-center justify-end">
              {isToggledrawer && !isHuman && (
                <div className="tooltip tooltip-bottom z-[9999]" data-tip="New Chat">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={handleCreateNewSubThread}
                  >
                    <SquarePen size={22} color="#555555" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {!isHuman ? DrawerList : TeamsList}
        </div>
      </div>
    </div>
  );
};

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotDrawer), [ParamsEnums.chatbotId])
);
