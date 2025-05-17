'use client';

import { lighten, useMediaQuery, useTheme } from "@mui/material";
import { AlignLeft, ChevronRight, SquarePen, Users, X } from "lucide-react";
import { memo, useContext, useMemo } from "react";
import { useDispatch } from "react-redux";

// API and Services
import { deleteReadReceipt } from "@/config/helloApi";
import helloVoiceService from "../Chatbot/hooks/HelloVoiceService";

// HOCs and Hooks
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useCallUI } from "../Chatbot/hooks/useCallUI";
import { useReduxStateManagement } from "../Chatbot/hooks/useReduxManagement";

// Redux Actions
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setHelloKeysData, setUnReadCount } from "@/store/hello/helloSlice";
import { setThreadId, setThreads } from "@/store/interface/interfaceSlice";

// Utils and Types
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { ParamsEnums } from "@/utils/enums";
import { MessageContext } from "./InterfaceChatbot";
import { getLocalStorage } from "@/utils/utilities";

const createRandomId = () => Math.random().toString(36).substring(2, 15);

interface ChatbotDrawerProps {
  setLoading: (loading: boolean) => void;
  chatbotId: string;
  isToggledrawer: boolean;
  setToggleDrawer: (isOpen: boolean) => void;
  preview?: boolean;
}

const ChatbotDrawer = ({
  chatbotId,
  setToggleDrawer,
  isToggledrawer,
  preview = false
}: ChatbotDrawerProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery('(max-width:1023px)');

  // Context hooks
  const {
    setNewMessage,
    setOptions,
    chatDispatch,
    fetchHelloPreviousHistory,
    images,
    setImages,
    fetchChannels,
    allMessages,
    allMessagesData,
    messageRef,
    setLoading,
  } = useContext(MessageContext);

  const { currentChatId, currentTeamId } = useReduxStateManagement({ chatbotId, chatDispatch });
  const { callState } = useCallUI();

  // Consolidated Redux state selection
  const {
    reduxThreadId,
    subThreadList,
    reduxSubThreadId,
    reduxBridgeName,
    teamsList,
    channelList,
    isHuman,
    Name,
    tagline,
    hideCloseButton,
    voice_call_widget
  } = useCustomSelector((state: $ReduxCoreType) => {
    const bridgeName = GetSessionStorageData("bridgeName") || state.appInfo?.bridgeName || "root";
    const threadId = GetSessionStorageData("threadId") || state.appInfo?.threadId || "";

    return {
      reduxThreadId: threadId,
      reduxSubThreadId: state.appInfo?.subThreadId || "",
      reduxBridgeName: bridgeName,
      subThreadList: state.Interface?.interfaceContext?.[chatbotId]?.[bridgeName]?.threadList?.[threadId] || [],
      teamsList: state.Hello?.widgetInfo?.teams || [],
      channelList: state.Hello?.channelListData?.channels || [],
      isHuman: state.Hello?.isHuman || false,
      Name: JSON.parse(getLocalStorage("client") || '{}')?.name || state.Hello?.channelListData?.customer_name || '',
      tagline: state.Hello?.widgetInfo?.tagline || '',
      hideCloseButton: state.Interface.hideCloseButton || false,
      voice_call_widget: state.Hello?.widgetInfo?.voice_call_widget || false
    };
  });

  // Handlers
  const handleCreateNewSubThread = async () => {
    if (preview) return;
    if (subThreadList.find(thread => thread.display_name === "New Chat")) {
      return;
    }
    const newThreadData  = {
        sub_thread_id: createRandomId(),
        thread_id: reduxThreadId,
        display_name: "New Chat"
    }
    if (!subThreadList.find(thread => thread.displayName === "New Chat")) {
      dispatch(
        setThreads({
          newThreadData,
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
    dispatch(setDataInAppInfoReducer({ subThreadId: sub_thread_id }));
    setNewMessage(true);
    setOptions([]);
    focusTextField();

    if (isSmallScreen) {
      setToggleDrawer(false);
    }
  };

  const focusTextField = () => {
    if (messageRef.current) {
      messageRef.current?.focus();
    }
  }

  const handleChangeChannel = async (channelId: string, chatId: string, teamId: string, widget_unread_count: number) => {
    // Update redux state
    dispatch(setHelloKeysData({ currentChannelId: channelId, currentChatId: chatId, currentTeamId: teamId }));
    dispatch(setDataInAppInfoReducer({ subThreadId: channelId }));

    // Fetch history and cleanup
    fetchHelloPreviousHistory(channelId);
    if (isSmallScreen) setToggleDrawer(false);
    if (images?.length > 0) setImages([]);

    // Handle unread messages
    if (widget_unread_count > 0) {
      await deleteReadReceipt(channelId);
      dispatch(setUnReadCount({ channelId: channelId, resetCount: true }));
    }
    focusTextField();
    setLoading(false);
  };

  const handleChangeTeam = (teamId: string) => {
    dispatch(setHelloKeysData({ currentTeamId: teamId, currentChannelId: "", currentChatId: "" }));
    dispatch(setDataInAppInfoReducer({ subThreadId: '' }));

    if (isSmallScreen) setToggleDrawer(false);
    if (images?.length > 0) setImages([]);
    focusTextField();
    setLoading(false);
  };

  const closeToggleDrawer = (isOpen: boolean) => {
    setToggleDrawer(isOpen);
  };

  const handleVoiceCall = () => {
    helloVoiceService.initiateCall();
    if (isSmallScreen) setToggleDrawer(false);
  };

  const handleSendMessageWithNoTeam = () => {
    dispatch(setHelloKeysData({ currentTeamId: "", currentChannelId: "", currentChatId: "" }));
    dispatch(setDataInAppInfoReducer({ subThreadId: '' }));

    if (isSmallScreen) setToggleDrawer(false);
    if (images?.length > 0) setImages([]);
    focusTextField();
  };

  // Memoized components
  const DrawerList = useMemo(() => (
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
                className={`${thread?.sub_thread_id === reduxSubThreadId ? 'active' : ''}`}
                onClick={() => handleChangeSubThread(thread?.sub_thread_id)}
              >
                {thread?.display_name || thread?.sub_thread_id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  ), [subThreadList, reduxSubThreadId, handleChangeSubThread]);

  const TeamsList = useMemo(() => (
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
                  className={`conversation-card max-h-16 h-full overflow-hidden text-ellipsis p-3 ${channel?.id === currentChatId ? 'border-2 border-primary' : ''} bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center`}
                  style={{
                    borderColor: channel?.id === currentChatId ? theme.palette.primary.main : ''
                  }}
                  onClick={() => handleChangeChannel(channel?.channel, channel?.id, channel?.team_id, channel?.widget_unread_count)}
                >
                  <div className="w-9 h-9 flex items-center justify-center text-xs font-bold rounded-full mr-3" style={{ background: lighten(theme.palette.primary.main, 0.9), color: "#606060" }}>
                    {(() => {
                      if (channel?.assigned_to?.name) {
                        const name = channel.assigned_to.name.toString() || '';
                        const nameParts = name.split(' ');
                        if (nameParts.length > 1) {
                          // If there are multiple words, take first letter of first and second word
                          return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
                        } else {
                          // If there's only one word, take first two letters
                          return name.length > 1 ?
                            name.charAt(0).toUpperCase() + name.charAt(1).toUpperCase() :
                            name.charAt(0).toUpperCase();
                        }
                      } else {
                        return "A";
                      }
                    })()}
                  </div>
                  <div className="conversation-info flex-1 min-w-0 pr-1">
                    {/* <div className="conversation-name text-xs text-gray-400 break-words mb-1">
                      Conversation
                    </div> */}
                    {channel?.channel && allMessages && allMessagesData && (
                      <div className="last-message text-sm text-black font-medium truncate flex flex-row items-center gap-1 text-ellipsis overflow-hidden">
                        {(() => {
                          const channelMessages = allMessages[channel?.channel];
                          if (channelMessages && channelMessages?.length > 0) {
                            const lastMessageId = channelMessages[0];
                            const lastMessage = allMessagesData[channel?.channel]?.[lastMessageId];
                            if (lastMessage) {
                              const isUserMessage = lastMessage?.role == "user";
                              return (
                                <>
                                  {isUserMessage ? "You: " : "Sender: "}
                                  <div className="line-clamp-1" dangerouslySetInnerHTML={{
                                    __html: lastMessage?.message_type === 'pushNotification'
                                      ? "Custom Notification"
                                      : (lastMessage.messageJson?.text ||
                                        (lastMessage.messageJson?.attachment?.length > 0 ? "Attachment" :
                                          lastMessage.messageJson?.message_type ||
                                          "New conversation"))
                                  }}></div>
                                </>
                              );
                            }
                          }

                          // Fallback to channel.last_message if no message found in allMessagesData
                          if (channel?.last_message) {
                            return (
                              <>
                                {!channel?.last_message?.message?.sender_id ? "You: " : "Sender: "}
                                <div className="line-clamp-1" dangerouslySetInnerHTML={{
                                  __html: channel?.last_message?.message?.content?.text ||
                                    (channel?.last_message?.message?.content?.attachment?.length > 0 ? "Attachment" :
                                      channel?.last_message?.message?.message_type ||
                                      "New conversation")
                                }}></div>
                              </>
                            );
                          }

                          return "New conversation";
                        })()}
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
          <h3 className="text-lg font-semibold">Talk to our experts</h3>
        </div>
        <div className="teams-list space-y-0">
          {teamsList.length === 0 ? (
            <div className="flex">
              <button className="btn w-full" style={{ backgroundColor: theme.palette.primary.main, color: '#fff' }} onClick={handleSendMessageWithNoTeam}>Send us a message</button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {teamsList.map((team: any, index: number) => (
                <div
                  key={`${team?.id}-${index}`}
                  className={`team-card p-3 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer rounded-lg flex items-center justify-between`}
                  onClick={() => handleChangeTeam(team?.id)}
                >
                  <div className="flex items-center overflow-hidden">
                    <div className="team-avatar mr-3 bg-primary/10 p-2 rounded-md flex-shrink-0">
                      {team?.icon || <Users size={12} className="text-primary" />}
                    </div>
                    <div className="team-info overflow-hidden">
                      <div className="team-name font-medium truncate max-w-full">{team?.name}</div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <SquarePen size={16} color="#555555" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {voice_call_widget && <div className="marketing-banner mt-4 p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
        <p className="text-sm font-medium">Need specialized help?</p>
        <p className="text-xs">Our teams are ready to assist you with any questions</p>
        <button
          className={`mt-2 text-xs py-1 px-3 rounded-md transition-colors ${callState !== "idle" ? "bg-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/80"}`}
          onClick={handleVoiceCall}
          disabled={callState !== "idle"}
        >
          Call Us
        </button>
      </div>}
    </div>
  ), [
    channelList,
    teamsList,
    currentChatId,
    currentTeamId,
    callState,
    voice_call_widget,
    theme.palette.primary.main,
    handleChangeChannel,
    handleChangeTeam,
    handleSendMessageWithNoTeam,
    handleVoiceCall,
    allMessages,
    allMessagesData
  ]);

  const handleCloseChatbot = () => {
    if (!window?.parent) return;
    window.parent.postMessage({ type: "CLOSE_CHATBOT" }, "*");
  };

  const CloseButton = useMemo(() => {
    if (hideCloseButton === true || hideCloseButton === "true" || !isSmallScreen) return null;

    return (
      <div
        className="cursor-pointer p-2 hover:bg-gray-200 rounded-full transition-colors"
        onClick={handleCloseChatbot}
      >
        <X size={22} color="#555555" />
      </div>
    );
  }, [hideCloseButton, handleCloseChatbot]);

  return (
    <div className="drawer z-[999]">
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

      <div className={`drawer-side ${isHuman && isSmallScreen ? '100%' : 'max-w-[286px]'} ${isToggledrawer ? 'lg:translate-x-0' : 'lg:-translate-x-full'} transition-transform duration-100`}>
        <div className="w-full h-full text-base-content relative bg-base-200 border-r-base-300 border flex flex-col">
          {/* Header with padding */}
          <div className="px-4 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="w-10">
                {isToggledrawer && (
                  <button
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={() => closeToggleDrawer(!isToggledrawer)}
                  >
                    <AlignLeft size={22} color="#555555" />
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h2 className="text-lg font-bold text-center">
                  {Name ? `Hello ${Name.split(' ')[0]}` : 'Hello There!'}
                </h2>
                {tagline && Name && (
                  <p className="text-xs text-gray-500 text-center">{tagline}</p>
                )}
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
                {isHuman && CloseButton}
              </div>
            </div>
          </div>

          {/* Content area with overflow handling - the scrollbar will appear at the edge */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4">
              {!isHuman ? DrawerList : TeamsList}
            </div>
          </div>

          {/* Footer with branding - always stays at bottom */}
          <div className="px-4 pt-2 pb-2 flex items-center justify-center mt-auto">
            <div className="text-xs text-gray-500 flex items-baseline gap-1">
              Powered by
              {isHuman ? <a href="https://msg91.com" target="_blank" rel="noopener noreferrer" className="flex hover:opacity-80 transition-opacity ml-1">
                <img src="/msg91-logo.svg" alt="MSG91" className="h-4" />
              </a> : <a href="https://gtwy.ai" target="_blank" rel="noopener noreferrer" className="flex hover:opacity-80 transition-opacity"><span className="font-bold">GTWY</span></a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default addUrlDataHoc(memo(ChatbotDrawer), [ParamsEnums.chatbotId]);