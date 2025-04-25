// MUI Icons
import { useTheme } from "@mui/material";
import {
  AlignLeft,
  ChevronDown,
  EllipsisVertical,
  History,
  Maximize,
  Phone,
  PictureInPicture2,
  Settings,
  SquarePen,
  X
} from "lucide-react";

// Third-party libraries
import Image from "next/image";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

// App imports
import { createNewThreadApi } from "@/config/api";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setDataInInterfaceRedux, setSelectedAIServiceAndModal, setThreads } from "@/store/interface/interfaceSlice";
import { SelectedAiServicesType } from "@/types/interface/InterfaceReduxType";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { createRandomId, DEFAULT_AI_SERVICE_MODALS, ParamsEnums } from "@/utils/enums";
import { isColorLight } from "@/utils/themeUtility";
import helloVoiceService from "../Chatbot/hooks/HelloVoiceService";
import { useCallUI } from "../Chatbot/hooks/useCallUI";
import { ChatbotContext } from "../context";
import ChatbotDrawer from "./ChatbotDrawer";
import { MessageContext } from "./InterfaceChatbot";
import "./InterfaceChatbot.css";

interface ChatbotHeaderProps {
  chatbotId: string;
  preview?: boolean;
}

const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({ preview = false, chatbotId }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    setOptions,
    setLoading,
    setChatsLoading,
    setToggleDrawer,
    isToggledrawer,
    threadId,
    bridgeName: reduxBridgeName,
    headerButtons,
    messageIds
  } = useContext(MessageContext);

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
  const isLightBackground = theme.palette.mode === "light";
  const textColor = isLightBackground ? "black" : "white";
  const { callState } = useCallUI();

  const {
    allowModalSwitch,
    hideCloseButton,
    chatTitle,
    chatIcon,
    currentSelectedBridgeSlug,
    chatSubTitle,
    allowBridgeSwitchViaProp,
    subThreadList,
    hideFullScreenButton,
    isHuman,
    teams,
    currentTeamId
  } = useCustomSelector((state: $ReduxCoreType) => ({
    allowModalSwitch: state.Interface.allowModalSwitch || false,
    hideCloseButton: state.Interface.hideCloseButton || false,
    hideFullScreenButton: state.Interface.hideFullScreenButton || false,
    chatTitle: state.Interface.chatTitle || "",
    chatSubTitle: state.Interface.chatSubTitle || "",
    chatIcon: state.Interface.chatIcon || "",
    currentSelectedBridgeSlug: state?.Interface?.bridgeName,
    allowBridgeSwitchViaProp: state?.Interface?.allowBridgeSwitch,
    teams: state.Hello?.widgetInfo?.teams || [],
    currentTeamId: state.Hello?.currentTeamId || "",
    subThreadList:
      state.Interface?.interfaceContext?.[chatbotId]?.[
        GetSessionStorageData("bridgeName") ||
        state.appInfo?.bridgeName ||
        "root"
      ]?.threadList?.[
      GetSessionStorageData("threadId") || state.appInfo?.threadId
      ] || [],
    isHuman: state.Hello?.isHuman || false,
  }));

  // Determine if we should show the create thread button
  const showCreateThreadButton = useMemo(() => {
    return !isHuman && !(subThreadList?.length < 2 && (!messageIds || messageIds.length === 0));
  }, [subThreadList?.length, messageIds?.length, isHuman]);

  // Handler for creating a new thread
  const handleCreateNewSubThread = async () => {
    if (preview) return;

    const subThreadId = createRandomId();
    const result = await createNewThreadApi({
      threadId: threadId,
      subThreadId,
    });

    if (result?.success) {
      dispatch(setDataInAppInfoReducer({ subThreadId }));
      dispatch(
        setThreads({
          newThreadData: result?.thread,
          bridgeName: GetSessionStorageData("bridgeName") || reduxBridgeName,
          threadId: threadId,
        })
      );
      setOptions([]);
    }
  };

  // Handler for voice call
  const handleVoiceCall = () => {
    helloVoiceService.initiateCall();
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
  const handleCloseChatbot = () => {
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
    if (!(subThreadList?.length > 1 || isHuman)) return null;

    return (
      <button
        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        onClick={() => setToggleDrawer(!isToggledrawer)}
      >
        {isToggledrawer ? null : <AlignLeft size={22} color="#555555" />}
      </button>
    );
  }, [subThreadList?.length, isHuman, isToggledrawer, setToggleDrawer]);

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
    const displayTitle = chatTitle || chatbotTitle || teamName || "AI Assistant";
    const displaySubtitle = chatSubTitle || chatbotSubtitle || "Do you have any questions? Ask us!";

    return (
      <div className="flex flex-col items-center mx-auto">
        <div className="flex items-center sm:gap-3 gap-1 justify-center">
          {chatIcon && (
            <Image
              alt="headerIcon"
              width={24}
              height={24}
              src={chatIcon}
              className="rounded-full"
            />
          )}
          <h1 className="text-gray-800 text-center font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">
            {displayTitle}
          </h1>
        </div>
        {chatbotSubtitle && (
          <p className="text-sm opacity-75 text-center whitespace-nowrap overflow-hidden overflow-ellipsis">
            {displaySubtitle}
          </p>
        )}
      </div>
    );
  }, [chatIcon, chatTitle, chatbotTitle, teamName, chatSubTitle, chatbotSubtitle]);

  // Memoized fullscreen toggle button
  const ScreenSizeToggleButton = useMemo(() => {
    if (!shouldToggleScreenSize || hideFullScreenButton === true || hideFullScreenButton === "true") {
      return null;
    }

    return fullScreen ? (
      <div
        className="cursor-pointer p-1 rounded-full"
        onClick={() => toggleFullScreen(false)}
      >
        <PictureInPicture2 size={22} color="#555555" />
      </div>
    ) : (
      <div
        className="cursor-pointer p-1 rounded-full"
        onClick={() => toggleFullScreen(true)}
      >
        <Maximize size={22} color="#555555" />
      </div>
    );
  }, [shouldToggleScreenSize, hideFullScreenButton, fullScreen, toggleFullScreen]);

  // Memoized close button
  const CloseButton = useMemo(() => {
    if (hideCloseButton === true || hideCloseButton === "true") return null;

    return (
      <div
        className="cursor-pointer p-1 py-3"
        onClick={handleCloseChatbot}
      >
        <X size={22} color="#555555" />
      </div>
    );
  }, [hideCloseButton, handleCloseChatbot]);

  // Memoized call button
  const CallButton = useMemo(() => {
    if (!isHuman) return null;

    const isCallDisabled = callState !== "idle";

    return (
      <div className="tooltip tooltip-bottom" data-tip="Call">
        <div
          className={`p-2 mx-2 rounded-full transition-colors ${isCallDisabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-gray-200"
            }`}
          onClick={() => { if (!isCallDisabled) handleVoiceCall() }}
        >
          <Phone size={22} color="#555555" />
        </div>
      </div>
    );
  }, [isHuman, callState, handleVoiceCall]);

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-2 sm:py-2 py-1 w-full">
      <div className="flex items-center w-full relative">
        {/* Left side buttons */}
        <div className="sm:absolute left-0 flex items-center">
          {DrawerToggleButton}
          {CreateThreadButton}
        </div>

        {/* Center title section */}
        {HeaderTitleSection}

        {/* Right side buttons */}
        <div className="sm:absolute right-0 flex justify-center items-center gap-1">
          {allowBridgeSwitchViaProp && allowBridgeSwitch && (
            <BridgeSwitchDropdown
              currentSelectedBridgeSlug={currentSelectedBridgeSlug}
              bridges={bridges}
            />
          )}

          {allowModalSwitch && <AiServicesToSwitch />}

          {headerButtons?.map((item, index) => (
            <React.Fragment key={`header-button-${index}`}>
              {renderIconsByType(item)}
            </React.Fragment>
          ))}

          <div className="flex items-center">
            {CallButton}
            {ScreenSizeToggleButton}
            {CloseButton}
          </div>
        </div>
      </div>

      <ChatbotDrawer
        setLoading={setLoading}
        chatbotId="chatbotId"
        isToggledrawer={isToggledrawer}
        setToggleDrawer={setToggleDrawer}
        preview={preview}
      />
    </div>
  );
};

export default React.memo(addUrlDataHoc(React.memo(ChatbotHeader), [ParamsEnums.chatbotId]));
interface ChatbotFeedbackFormProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChatbotHeaderPreview() {
  const theme = useTheme();
  const isLightBackground = isColorLight(theme.palette.primary.main);
  const textColor = isLightBackground ? "black" : "white";

  return (
    <div className="navbar bg-base-100 shadow-lg rounded-box">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">AI Assistant</h2>
              <ResetChatOption textColor={textColor} preview />
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


const AiServicesToSwitch = () => {
  const { currentSelectedModal, aiServiceAndModalOptions, defaultModal } = useCustomSelector((state: $ReduxCoreType) => {
    const selectedAiServiceAndModal = state.Interface?.selectedAiServiceAndModal || {};
    const modalConfig = state.Interface?.modalConfig || {};
    const availableAiServicesToSwitch = state.Interface?.availableAiServicesToSwitch || [];
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
  }, [defaultModal, currentSelectedModal, aiServiceAndModalOptions]);

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
        dispatch(setDataInInterfaceRedux({ bridgeName: e.target.value }))
        sessionStorage.setItem("bridgeName", e.target.value);
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