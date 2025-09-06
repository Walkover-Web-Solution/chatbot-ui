// MUI Icons
import {
  AlignLeft,
  ChevronDown,
  EllipsisVertical,
  History,
  Maximize2,
  Minimize2,
  Minus,
  Settings,
  SquarePen,
  X
} from "lucide-react";

// Third-party libraries
import Image from "next/image";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

// App imports
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setDataInDraftReducer } from "@/store/draftData/draftDataSlice";
import { setSelectedAIServiceAndModal, setThreads } from "@/store/interface/interfaceSlice";
import { SelectedAiServicesType } from "@/types/interface/InterfaceReduxType";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { createRandomId, DEFAULT_AI_SERVICE_MODALS, ParamsEnums } from "@/utils/enums";
import { useChatActions } from "../Chatbot/hooks/useChatActions";
import { ChatbotContext } from "../context";
import "./InterfaceChatbot.css";

export function ChatbotHeaderPreview() {

  return (
    <div className="navbar bg-base-100 shadow-lg rounded-box">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">AI Assistant</h2>
            </div>
            <p className="text-sm opacity-75">
              Do you have any questions? Ask us!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const SendEventOnComponentPress = ({ item, children }: { item: { type: string }, children: React.ReactNode }) => (
  <button
    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
    onClick={() => emitEventToParent("HEADER_BUTTON_PRESS", item)}
  >
    {children}
  </button>
);

const renderIconsByType = (item: { type: string }) => {
  switch (item.type) {
    case 'setting':
      return (
        <SendEventOnComponentPress item={item}>
          <Settings />
        </SendEventOnComponentPress>
      );
    case 'history':
      return (
        <SendEventOnComponentPress item={item}>
          <History />
        </SendEventOnComponentPress>
      );
    case 'verticalThreeDots':
      return (
        <SendEventOnComponentPress item={item}>
          <EllipsisVertical />
        </SendEventOnComponentPress>
      );
    case 'sectionDropdown':
      const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
      const [selectedOption, setSelectedOption] = useState({ value: item?.defaultSelected || '', section: "" });

      useEffect(() => {
        if (selectedOption?.value) {
          emitEventToParent("HEADER_BUTTON_PRESS", { ...item, selectedOption });
        }
      }, [selectedOption?.value]);

      return (
        <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              id="menu-button"
              aria-expanded={dropdownIsOpen}
              aria-haspopup="true"
              onClick={() => setDropdownIsOpen(!dropdownIsOpen)}
            >
              <span className={selectedOption?.value ? "font-bold" : ""}>{selectedOption?.value || "Select"}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
          </div>

          {dropdownIsOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="py-1" role="none">
                {item?.options && Array.isArray(item?.options) && item?.options.map((item, sectionIndex) => (
                  item?.section && (
                    <div key={sectionIndex}>
                      <h4 className="text-gray-900 font-semibold px-4 py-2">{item?.section}</h4>
                      <div className="pl-4">
                        {Array.isArray(item?.options) && item?.options.map((optionValue, optionIndex) => (
                          <a
                            key={optionIndex}
                            href="#"
                            className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                            role="menuitem"
                            tabIndex={-1}
                            id={`menu-item-${sectionIndex}-${optionIndex}`}
                            onClick={() => {
                              setSelectedOption({ value: optionValue, section: item?.section });
                              setDropdownIsOpen(false);
                            }}
                          >
                            {optionValue}
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
}


const AiServicesToSwitch = ({ chatSessionId }: { chatSessionId: string }) => {
  const { currentSelectedModal, aiServiceAndModalOptions, defaultModal } = useCustomSelector((state: $ReduxCoreType) => {
    const selectedAiServiceAndModal = state.Interface?.[chatSessionId]?.selectedAiServiceAndModal || {};
    const modalConfig = state.Interface?.[chatSessionId]?.modalConfig || {};
    const availableAiServicesToSwitch = state.Interface?.[chatSessionId]?.availableAiServicesToSwitch || [];
    const { defaultSelected = {}, aiServices = [] } = modalConfig;

    const filteredUserRequestedOptions = aiServices.filter((item: any) =>
      availableAiServicesToSwitch.includes(item.service)
    ).map((item: any) => ({
      ...item,
      modals: Array.from(new Set([
        ...(Array.isArray(item.modals) ? item.modals : []),
        ...(Array.isArray(DEFAULT_AI_SERVICE_MODALS[item.service]) ? DEFAULT_AI_SERVICE_MODALS[item.service] : [])
      ]))
    }));

    const aiServiceAndModalOptions = filteredUserRequestedOptions.length > 0
      ? filteredUserRequestedOptions
      : availableAiServicesToSwitch.map((service) => ({
        service,
        modals: DEFAULT_AI_SERVICE_MODALS[service] || []
      }));

    const isValidSelection = (selection: SelectedAiServicesType) =>
      selection.service && selection.modal && aiServiceAndModalOptions.some((item) =>
        item.service === selection.service && item.modals.includes(selection.modal)
      );

    const currentSelectedModal = isValidSelection(selectedAiServiceAndModal)
      ? selectedAiServiceAndModal
      : { service: "", modal: "" };

    const defaultModal = isValidSelection(defaultSelected)
      ? defaultSelected : null

    return { currentSelectedModal, aiServiceAndModalOptions, defaultModal };
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const shouldSetDefaultModal = defaultModal && (!currentSelectedModal?.modal || !currentSelectedModal?.service);
    const shouldSetFirstAvailableOption = !defaultModal && (!currentSelectedModal?.modal || !currentSelectedModal?.service) && aiServiceAndModalOptions?.[0]?.service && aiServiceAndModalOptions?.[0]?.modals?.[0];

    if (shouldSetDefaultModal) {
      dispatch(setSelectedAIServiceAndModal(defaultModal));
    } else if (shouldSetFirstAvailableOption) {
      const firstOption = aiServiceAndModalOptions[0];
      dispatch(setSelectedAIServiceAndModal({ service: firstOption.service, modal: firstOption.modals[0] }));
    }
  }, [defaultModal, currentSelectedModal, aiServiceAndModalOptions, chatSessionId]);

  const handleSelectedModalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [service, modal] = event.target.value.split('|');
    dispatch(setSelectedAIServiceAndModal({ service, modal }));
  };

  return (
    <label className="form-control w-full max-w-fit">
      <select
        value={`${currentSelectedModal.service}|${currentSelectedModal.modal}`}
        onChange={handleSelectedModalChange}
        className="select select-sm w-full select-bordered"
      >
        <option disabled>Select an AI Service</option>
        {Array.isArray(aiServiceAndModalOptions) && aiServiceAndModalOptions.map((item, sectionIndex) => (
          <optgroup label={item.service} key={`group_${sectionIndex}`}>
            {item.modals.map((modal, optionIndex) => (
              <option key={`option_${sectionIndex}_${optionIndex}`} value={`${item.service}|${modal}`}>
                {modal}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function BridgeSwitchDropdown({ currentSelectedBridgeSlug, bridges }: { currentSelectedBridgeSlug: string, bridges: { slugName: string, displayName: string, name: string, id: string }[] }) {
  const dispatch = useDispatch()
  let allBridges = bridges
  if (!bridges?.some((bridge) => bridge.slugName === currentSelectedBridgeSlug)) {
    allBridges.push({ slugName: currentSelectedBridgeSlug, displayName: currentSelectedBridgeSlug, id: "defaultBridge", name: currentSelectedBridgeSlug })
  }

  useEffect(() => {
    if (currentSelectedBridgeSlug) {
      emitEventToParent("BRIDGE_SWITCH", allBridges?.find(item => item?.slugName === currentSelectedBridgeSlug))
    }
  }, [currentSelectedBridgeSlug])

  return <label className="form-control max-w-xs">
    <select
      value={currentSelectedBridgeSlug}
      onChange={(e) => {
        dispatch(setDataInAppInfoReducer({ bridgeName: e.target.value }))
      }}
      className="select select-sm select-bordered"
    >
      <option disabled>Available Bridges</option>
      {Array.isArray(allBridges) && allBridges.map((item, sectionIndex) => (
        <option key={item?.id} value={item?.slugName}>
          {item?.displayName || item?.name}
        </option>
      ))}
    </select>
  </label>
}

function getAgentTeamName(state: $ReduxCoreType, chatSessionId: string, currentChannelId: string = "") {
  const agent_teams = state.Hello?.[chatSessionId]?.agent_teams || {};
  const channel = state.Hello?.[chatSessionId]?.channelListData?.channels?.find(
    (channel: any) => channel?.channel === currentChannelId
  );
  const assigned_type = channel?.assigned_type;
  const assigned_id = channel?.assigned_id;
  if (assigned_type === "team" && assigned_id) {
    return agent_teams?.teams?.[assigned_id] || "";
  } else if (assigned_type === "agent" && assigned_id) {
    return agent_teams?.agents?.[assigned_id] || "";
  } else {
    return null;
  }
}

interface ChatbotHeaderProps {
  preview?: boolean;
  chatSessionId: string
  tabSessionId: string
  currentTeamId: string
  currentChannelId: string
  threadId: string
  bridgeName: string
}

const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({ preview = false, chatSessionId, tabSessionId, currentTeamId = "", currentChannelId = "", threadId = "", bridgeName = "" }) => {
  console.log('header')
  const dispatch = useDispatch();
  const {
    setOptions,
    setToggleDrawer,
  } = useChatActions();

  const { isToggledrawer, bridgeName: reduxBridgeName, headerButtons, messageIds, lastMessage, unReadCount, isChatbotMinimized } = useCustomSelector((state) => ({
    isToggledrawer: state.Chat?.isToggledrawer,
    bridgeName: state.Chat.bridgeName || [],
    headerButtons: state.Chat?.headerButtons || [],
    messageIds: state.Chat?.messageIds?.[state.Chat.subThreadId] || [],
    lastMessage: (() => {
      const lastMessageId = state.Chat?.messageIds?.[currentChannelId]?.[0]
      return state.Chat?.msgIdAndDataMap?.[currentChannelId]?.[lastMessageId]
    })(),
    unReadCount: state.Hello?.[chatSessionId]?.channelListData?.channels?.find(
      (channel: any) => channel?.channel === currentChannelId
    )?.widget_unread_count || 0,
    isChatbotMinimized: state.draftData?.isChatbotMinimized || false
  }))

  const { chatbotConfig } = useContext<any>(ChatbotContext);
  const {
    chatbotTitle,
    chatbotSubtitle,
    width = '',
    widthUnit = '',
    allowBridgeSwitch = false,
    bridges = []
  } = chatbotConfig || {};

  const [fullScreen, setFullScreen] = useState(false);
  const [teamName, setTeamName] = useState(false);

  const shouldToggleScreenSize = `${width}${widthUnit}` !== '1200%';

  const handleMinimizeChatbot = (value: boolean) => {
    dispatch(setDataInDraftReducer({ isChatbotMinimized: value }));
  }

  const {
    allowModalSwitch,
    hideCloseButton,
    chatTitle,
    chatIcon,
    chatSubTitle,
    allowBridgeSwitchViaProp,
    subThreadList,
    hideFullScreenButton,
    isHelloUser,
    teams,
    agentTeamName,
    isMobileSDK
  } = useCustomSelector((state: $ReduxCoreType) => {
    const show_close_button = state.Hello?.[chatSessionId]?.helloConfig?.show_close_button
    return ({
      isMobileSDK: state.Hello?.[chatSessionId]?.helloConfig?.isMobileSDK || false,
      allowModalSwitch: state.Interface?.[chatSessionId]?.allowModalSwitch || false,
      hideCloseButton: typeof show_close_button === 'boolean' ? !show_close_button : state.appInfo?.[tabSessionId]?.hideCloseButton || false,
      hideFullScreenButton: state.appInfo?.[tabSessionId]?.hideFullScreenButton || false,
      chatTitle: state.Interface?.[chatSessionId]?.chatTitle || "",
      chatSubTitle: state.Interface?.[chatSessionId]?.chatSubTitle || "",
      chatIcon: state.Interface?.[chatSessionId]?.chatIcon || "",
      allowBridgeSwitchViaProp: state?.Interface?.[chatSessionId]?.allowBridgeSwitch,
      teams: state.Hello?.[chatSessionId]?.widgetInfo?.teams || [],
      agentTeamName: getAgentTeamName(state, chatSessionId, currentChannelId),
      subThreadList: state.Interface?.[chatSessionId]?.interfaceContext?.[bridgeName]?.threadList?.[threadId] || [],
      isHelloUser: state.draftData?.isHelloUser || false,
      voice_call_widget: state.Hello?.[chatSessionId]?.widgetInfo?.voice_call_widget || false
    })
  });
  // Determine if we should show the create thread button
  const showCreateThreadButton = useMemo(() => {
    return !isHelloUser && !(subThreadList?.length < 2 && (!messageIds || messageIds.length === 0));
  }, [subThreadList?.length, messageIds?.length, isHelloUser]);

  // Handler for creating a new thread
  const handleCreateNewSubThread = async () => {
    if (preview) return;
    if (subThreadList?.[0]?.newChat) {
      return;
    }

    const newThreadData = {
      sub_thread_id: createRandomId(),
      thread_id: threadId,
      display_name: "New Chat",
      newChat: true
    }

    if (!subThreadList?.[0]?.newChat) {
      dispatch(
        setThreads({
          newThreadData,
          bridgeName: reduxBridgeName,
          threadId: threadId,
        })
      );
      setOptions([]);
    }
  };

  // Handle fullscreen toggle
  const toggleFullScreen = (enter: boolean) => {
    if (!window?.parent) return;

    setFullScreen(enter);
    const message = enter
      ? { type: "ENTER_FULL_SCREEN_CHATBOT" }
      : { type: "EXIT_FULL_SCREEN_CHATBOT" };

    window.parent.postMessage(message, "*");
  };

  // Close chatbot handler
  const handleCloseChatbot = (e: any) => {
    e.stopPropagation();
    if (!window?.parent) return;
    window.parent.postMessage({ type: "CLOSE_CHATBOT" }, "*");
  };

  // Set team name when teams or currentTeamId changes
  useEffect(() => {
    if (!teams?.length || !currentTeamId) return;

    const team = teams.find((item: any) => item?.id === currentTeamId);
    if (team) {
      setTeamName(team.name);
    }
  }, [teams, currentTeamId]);

  // Memoized drawer toggle button
  const DrawerToggleButton = useMemo(() => {
    if (!(subThreadList?.length > 1 || isHelloUser)) return null;

    return (
      <button
        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        onClick={() => setToggleDrawer(!isToggledrawer)}
      >
        {isToggledrawer ? null : <AlignLeft size={22} color="#555555" />}
      </button>
    );
  }, [subThreadList?.length, isHelloUser, isToggledrawer, setToggleDrawer]);

  // Memoized create thread button
  const CreateThreadButton = useMemo(() => {
    if (!showCreateThreadButton || isToggledrawer) return null;

    return (
      <div className="tooltip tooltip-right" data-tip="Create new thread">
        <button
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          onClick={handleCreateNewSubThread}
        >
          <SquarePen size={22} color="#555555" />
        </button>
      </div>
    );
  }, [showCreateThreadButton, isToggledrawer, handleCreateNewSubThread]);

  // Memoized header title section
  const HeaderTitleSection = useMemo(() => {
    const displayTitle = isChatbotMinimized && lastMessage?.role === 'user' ? 'You' : chatTitle || chatbotTitle || (isHelloUser ? (agentTeamName || teamName || "Conversation")?.toString().split(" ")?.[0] : "AI Assistant");
    const displaySubtitle = chatSubTitle || chatbotSubtitle || "Do you have any questions? Ask us!";

    // Minimized version of the header
    const MinimizedHeaderTitle = () => (
      <div className="flex flex-col items-center mx-auto">
        <div className="flex items-center sm:gap-3 gap-1 justify-center relative">
          {chatIcon && (
            <Image
              alt="headerIcon"
              width={24}
              height={24}
              src={chatIcon}
              className="rounded-full"
            />
          )}
          <div className="flex items-center">
            <div className="relative">
              <h1 className="text-gray-800 text-center font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis text-sm">
                {displayTitle}
              </h1>
              {unReadCount > 0 && (
                <sup className="absolute -top-3 -right-3 text-[10px] min-w-[16px] h-[16px] px-1 bg-red-500 text-white font-bold rounded-full flex items-center justify-center shadow-md">
                  {unReadCount}
                </sup>
              )}
            </div>
            {lastMessage && (
              <div className="flex items-center gap-1">
                <p>:</p>
                <div className="line-clamp-1 text-sm md:text-base" dangerouslySetInnerHTML={{
                  __html: lastMessage?.message_type === 'pushNotification'
                    ? "Custom Notification"
                    : (lastMessage.messageJson?.text ||
                      (lastMessage.messageJson?.attachment?.length > 0 ? "Attachment" :
                        lastMessage.messageJson?.message_type ||
                        "New conversation"))
                }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // Full-size version of the header
    const FullSizeHeaderTitle = () => (
      <div className="flex flex-col items-center mx-auto">
        <div className="flex items-center sm:gap-3 gap-1 justify-center relative">
          {chatIcon && (
            <Image
              alt="headerIcon"
              width={24}
              height={24}
              src={chatIcon}
              className="rounded-full"
            />
          )}
          <div className="flex items-center">
            <div className="relative">
              <h1 className="text-gray-800 text-center font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis text-base">
                {displayTitle}
              </h1>
            </div>
          </div>
        </div>
        {chatbotSubtitle && (
          <p className="text-sm opacity-75 text-center whitespace-nowrap overflow-hidden overflow-ellipsis">
            {displaySubtitle}
          </p>
        )}
      </div>
    );

    return isChatbotMinimized ? <MinimizedHeaderTitle /> : <FullSizeHeaderTitle />;
  }, [
    chatIcon,
    chatTitle,
    chatbotTitle,
    isHelloUser,
    teamName,
    chatSubTitle,
    chatbotSubtitle,
    agentTeamName,
    isChatbotMinimized,
    lastMessage,
    unReadCount
  ]);

  // Memoized fullscreen toggle button
  const ScreenSizeToggleButton = useMemo(() => {
    if (!shouldToggleScreenSize || hideFullScreenButton === true || hideFullScreenButton === "true" || isMobileSDK) {
      return null;
    }

    return fullScreen ? (
      <div
        className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors"
        onClick={() => toggleFullScreen(false)}
      >
        {/* <PictureInPicture2 size={22} color="#555555" /> */}
        <Minimize2 size={22} color="#555555" style={{ transform: 'rotate(90deg)' }} />
      </div>
    ) : (
      <div
        className="cursor-pointer p-2 rounded-full transition-colors hover:bg-gray-200"
        onClick={() => toggleFullScreen(true)}
      >
        {/* <Maximize size={22} color="#555555" /> */}
        <Maximize2 size={22} color="#555555" style={{ transform: 'rotate(90deg)' }} />
      </div>
    );
  }, [shouldToggleScreenSize, hideFullScreenButton, fullScreen, toggleFullScreen]);

  // Memoized close button
  const CloseButton = useMemo(() => {
    if (hideCloseButton === true || hideCloseButton === "true") return null;

    return (
      <div
        className="cursor-pointer p-2 py-2 rounded-full hover:bg-gray-200 transition-colors"
        onClick={handleCloseChatbot}
      >
        <X size={22} color="#555555" />
      </div>
    );
  }, [hideCloseButton, handleCloseChatbot]);

  const handleToggleMinimize = () => {
    if (!isChatbotMinimized && fullScreen) {
      toggleFullScreen(false)
    }
    handleMinimizeChatbot(!isChatbotMinimized)
    if (!isChatbotMinimized) {
      emitEventToParent('MINIMIZE_CHATBOT')
    } else {
      toggleFullScreen(false)
    }
  }

  const MinimizeButton = useMemo(() => {
    if (!isHelloUser) return null;
    return (
      <div
        className="cursor-pointer p-2 py-2 rounded-full hover:bg-gray-200 transition-colors"
        onClick={handleToggleMinimize}
      >
        {isChatbotMinimized ? <Maximize2 size={22} color="#555555" style={{ transform: 'rotate(90deg)' }} /> : <Minus size={22} color="#555555" />}
      </div>
    );
  }, [isHelloUser, isChatbotMinimized, fullScreen, toggleFullScreen])

  return isChatbotMinimized ?
    <div className="px-2 sm:py-4 py-3 w-full cursor-pointer" onClick={handleToggleMinimize}>
      <div className="flex items-center w-full relative px-2">
        {HeaderTitleSection}
        <div className="flex justify-end items-center gap-1 flex-1 sm:absolute sm:right-0">
          <div className="flex items-center">
            {MinimizeButton}
            {CloseButton}
          </div>
        </div>
      </div>
    </div>
    :
    <div className="px-2 sm:py-4 py-3 w-full">
      <div className="flex items-center w-full relative">
        {/* Left side buttons */}
        <div className="flex items-center flex-1 sm:absolute sm:left-0 sm:flex sm:items-center">
          {DrawerToggleButton}
          {CreateThreadButton}
        </div>

        {/* Center title section */}
        <div className="flex justify-center items-center flex-1">
          {HeaderTitleSection}
        </div>

        {/* Right side buttons */}
        <div className="flex justify-end items-center gap-1 flex-1 sm:absolute sm:right-0">
          {allowBridgeSwitchViaProp && allowBridgeSwitch && (
            <BridgeSwitchDropdown
              currentSelectedBridgeSlug={bridgeName}
              bridges={bridges}
            />
          )}

          {allowModalSwitch && <AiServicesToSwitch chatSessionId={chatSessionId} />}

          {headerButtons?.map((item, index) => (
            <React.Fragment key={`header-button-${index}`}>
              {renderIconsByType(item)}
            </React.Fragment>
          ))}

          <div className="flex items-center">
            {ScreenSizeToggleButton}
            {(isMobileSDK || !isHelloUser) ? CloseButton : MinimizeButton}
          </div>
        </div>
      </div>
    </div>
};

export default React.memo(addUrlDataHoc(ChatbotHeader, [ParamsEnums.currentTeamId, ParamsEnums.currentChannelId, ParamsEnums.threadId, ParamsEnums.bridgeName]));