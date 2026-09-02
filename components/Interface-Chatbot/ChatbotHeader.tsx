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
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material";

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
import { useComponentOverride } from "./ChatbotDrawerParts/useComponentOverride";
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

const SendEventOnComponentPress = ({ item, iconColor, children }: { item: { type: string }, iconColor: string, children: React.ReactNode }) => (
  <button
    className="p-2 rounded-full transition-colors hover:bg-base-200 dark:hover:bg-slate-700"
    style={{ color: iconColor }}
    onClick={() => emitEventToParent("HEADER_BUTTON_PRESS", item)}
    data-testid={`chatbot-header-button-${item.type}`}
  >
    {children}
  </button>
);

const renderIconsByType = (item: { type: string }, iconColor: string) => {
  switch (item.type) {
    case 'setting':
      return (
        <SendEventOnComponentPress item={item} iconColor={iconColor}>
          <Settings />
        </SendEventOnComponentPress>
      );
    case 'history':
      return (
        <SendEventOnComponentPress item={item} iconColor={iconColor}>
          <History />
        </SendEventOnComponentPress>
      );
    case 'verticalThreeDots':
      return (
        <SendEventOnComponentPress item={item} iconColor={iconColor}>
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
              className="inline-flex items-center justify-between w-full rounded-md border border-base-200 dark:border-slate-600 shadow-sm px-4 py-2 bg-base-100 dark:bg-slate-800 text-sm font-medium text-base-content hover:bg-base-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              id="menu-button"
              aria-expanded={dropdownIsOpen}
              aria-haspopup="true"
              onClick={() => setDropdownIsOpen(!dropdownIsOpen)}
              style={{ color: iconColor }}
              data-testid="chatbot-header-dropdown-button"
            >
              <span className={selectedOption?.value ? "font-bold" : ""}>{selectedOption?.value || "Select"}</span>
              <ChevronDown className="w-4 h-4 ml-2" color={iconColor} />
            </button>
          </div>

          {dropdownIsOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-base-100 dark:bg-slate-800 border border-base-200 dark:border-slate-700 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="py-1" role="none">
                {item?.options && Array.isArray(item?.options) && item?.options.map((item, sectionIndex) => (
                  item?.section && (
                    <div key={sectionIndex}>
                      <h4 className="px-4 py-2 font-semibold text-base-content">{item?.section}</h4>
                      <div className="pl-4">
                        {Array.isArray(item?.options) && item?.options.map((optionValue, optionIndex) => (
                          <a
                            key={optionIndex}
                            href="#"
                            className="block px-4 py-2 text-sm text-base-content hover:bg-base-200 dark:hover:bg-slate-700 rounded-md"
                            role="menuitem"
                            tabIndex={-1}
                            id={`menu-item-${sectionIndex}-${optionIndex}`}
                            onClick={() => {
                              setSelectedOption({ value: optionValue, section: item?.section });
                              setDropdownIsOpen(false);
                            }}
                            data-testid={`chatbot-header-dropdown-option-${sectionIndex}-${optionIndex}`}
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


export const AiServicesToSwitch = ({ chatSessionId, tabSessionId }: { chatSessionId: string; tabSessionId: string }) => {
  const { currentSelectedModal, aiServiceAndModalOptions, defaultModal } = useCustomSelector((state: $ReduxCoreType) => {
    const selectedAiServiceAndModal = state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.selectedAiServiceAndModal || {};
    const modalConfig = state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.modalConfig || {};
    const serviceModels = state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.serviceModels || {};
    const modelVisibilityConfig = state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.modelVisibilityConfig || {};
    const adminDefaultAiServiceAndModal = state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.adminDefaultAiServiceAndModal || {};
    const configuredAiServicesToSwitch = state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.availableAiServicesToSwitch || [];
    const availableAiServicesToSwitch = configuredAiServicesToSwitch.length > 0
      ? configuredAiServicesToSwitch
      : Object.keys(serviceModels).length > 0
        ? Object.keys(serviceModels)
        : Object.keys(modelVisibilityConfig);
    const { defaultSelected = {}, aiServices = [] } = modalConfig;
    const typesForService = (service: string, configuredModals: string[] = []): Record<string, { id: string; label: string }[]> => {
      let rawTypes: Record<string, string[]> = {};
      if (serviceModels[service] && typeof serviceModels[service] === 'object' && Object.keys(serviceModels[service]).length > 0) {
        rawTypes = serviceModels[service];
      } else if (modelVisibilityConfig[service] && Object.keys(modelVisibilityConfig[service]).length > 0) {
        rawTypes = { chat: Object.keys(modelVisibilityConfig[service]) };
      } else {
        const fallbackModals = Array.from(new Set([
          ...(Array.isArray(configuredModals) ? configuredModals : []),
          ...(Array.isArray((DEFAULT_AI_SERVICE_MODALS as Record<string, string[]>)[service]) ? (DEFAULT_AI_SERVICE_MODALS as Record<string, string[]>)[service] : [])
        ]));
        if (fallbackModals.length > 0) rawTypes = { chat: fallbackModals };
      }

      const visibilityForService = modelVisibilityConfig[service] || {};
      const result: Record<string, { id: string; label: string }[]> = {};
      Object.entries(rawTypes).forEach(([modelType, modelNames]) => {
        const visibleModels = modelNames
          .filter((modelName) => !visibilityForService[modelName]?.hide)
          .map((modelName) => ({ id: modelName, label: visibilityForService[modelName]?.value || modelName }));
        if (visibleModels.length > 0) result[modelType] = visibleModels;
      });
      return result;
    };

    const filteredUserRequestedOptions = aiServices.filter((item: any) =>
      availableAiServicesToSwitch.includes(item.service)
    ).map((item: any) => ({
      service: item.service,
      types: typesForService(item.service, item.modals)
    }));

    const aiServiceAndModalOptions = (filteredUserRequestedOptions.length > 0
      ? filteredUserRequestedOptions
      : availableAiServicesToSwitch.map((service) => ({
        service,
        types: typesForService(service)
      }))
    ).filter((item) => Object.keys(item.types).length > 0);

    const isValidSelection = (selection: SelectedAiServicesType) =>
      selection.service && selection.modal && aiServiceAndModalOptions.some((item) =>
        item.service === selection.service && (Object.values(item.types) as { id: string; label: string }[][]).some((models) => models.some((m) => m.id === selection.modal))
      );

    const currentSelectedModal = isValidSelection(selectedAiServiceAndModal)
      ? selectedAiServiceAndModal
      : { service: "", modal: "" };

    const defaultModal = isValidSelection(defaultSelected)
      ? defaultSelected
      : isValidSelection(adminDefaultAiServiceAndModal as SelectedAiServicesType)
        ? adminDefaultAiServiceAndModal
        : null

    return { currentSelectedModal, aiServiceAndModalOptions, defaultModal };
  });

  const dispatch = useDispatch();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const firstAvailableModal = useMemo(() => {
    const firstService = aiServiceAndModalOptions?.[0];
    const firstType = firstService && Object.keys(firstService.types)[0];
    const firstModel = firstType && firstService.types[firstType]?.[0];
    return firstService && firstModel ? { service: firstService.service, modal: firstModel.id } : null;
  }, [aiServiceAndModalOptions]);

  const currentSelectedModalLabel = useMemo(() => {
    for (const item of aiServiceAndModalOptions || []) {
      if (item.service !== currentSelectedModal.service) continue;
      for (const models of Object.values(item.types) as { id: string; label: string }[][]) {
        const match = models.find((m) => m.id === currentSelectedModal.modal);
        if (match) return match.label;
      }
    }
    return currentSelectedModal.modal;
  }, [aiServiceAndModalOptions, currentSelectedModal]);

  useEffect(() => {
    const shouldSetDefaultModal = defaultModal && (!currentSelectedModal?.modal || !currentSelectedModal?.service);
    const shouldSetFirstAvailableOption = !defaultModal && (!currentSelectedModal?.modal || !currentSelectedModal?.service) && firstAvailableModal;

    if (shouldSetDefaultModal) {
      dispatch(setSelectedAIServiceAndModal(defaultModal));
    } else if (shouldSetFirstAvailableOption) {
      dispatch(setSelectedAIServiceAndModal(firstAvailableModal));
    }
  }, [defaultModal, currentSelectedModal, firstAvailableModal, chatSessionId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (service: string, modal: string) => {
    dispatch(setSelectedAIServiceAndModal({ service, modal }));
    setIsOpen(false);
  };

  const borderColor = theme.palette.mode === 'dark' ? '#2a2a2a' : '#e5e7eb';
  const panelBg = theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff';

  if (!Array.isArray(aiServiceAndModalOptions) || aiServiceAndModalOptions.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v); }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors hover:bg-base-200/60"
        style={{ borderColor, color: theme.palette.text.primary }}
        data-testid="ai-service-switch-trigger"
      >
        <span>{currentSelectedModalLabel || "Select model"}</span>
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 w-64 max-h-80 overflow-y-auto rounded-xl border shadow-xl"
          style={{ backgroundColor: panelBg, borderColor }}
          data-testid="ai-service-switch-menu"
        >
          {aiServiceAndModalOptions.map((item, sectionIndex) => (
            <div key={`group_${sectionIndex}`}>
              {sectionIndex > 0 && (
                <div className="my-1 border-t" style={{ borderColor }} />
              )}
              <p className="px-3 pt-2 pb-1 text-xs font-semibold" style={{ color: theme.palette.text.primary }}>
                {item.service}
              </p>
              {Object.entries(item.types).map(([modelType, models], typeIndex) => (
                <div key={`type_${sectionIndex}_${typeIndex}`}>
                  <p className="px-4 pt-1 pb-0.5 text-[10px] uppercase tracking-widest opacity-50 font-semibold" style={{ color: theme.palette.text.primary }}>
                    {modelType}
                  </p>
                  {(models as { id: string; label: string }[]).map((model, optionIndex: number) => {
                    const isSelected = currentSelectedModal.service === item.service && currentSelectedModal.modal === model.id;
                    return (
                      <button
                        key={`option_${sectionIndex}_${typeIndex}_${optionIndex}`}
                        type="button"
                        onClick={() => handleSelect(item.service, model.id)}
                        className={`w-full text-left pl-6 pr-3 py-1.5 text-sm transition-colors ${isSelected ? 'bg-base-200/70' : 'hover:bg-base-200/40'}`}
                        style={{ color: theme.palette.text.primary }}
                        data-testid={`ai-service-switch-option-${sectionIndex}-${typeIndex}-${optionIndex}`}
                      >
                        {model.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
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
  const Override = useComponentOverride(["chatbotHeader"]);
  const TitleOverride = useComponentOverride(["chatbotHeader", "title"]);
  const CloseButtonOverride = useComponentOverride(["chatbotHeader", "closeButton"]);
  const MinimizeButtonOverride = useComponentOverride(["chatbotHeader", "minimizeButton"]);
  const dispatch = useDispatch();
  const theme = useTheme();
  const iconColor = theme.palette.text.primary;
  const {
    setOptions,
    setToggleDrawer,
  } = useChatActions();

  const { isToggledrawer, bridgeName: reduxBridgeName, headerButtons, messageIds, lastMessage, isChatbotMinimized, currentSubThreadId } = useCustomSelector((state) => ({
    isToggledrawer: state.Chat?.isToggledrawer,
    bridgeName: state.Chat.bridgeName || [],
    headerButtons: state.Chat?.headerButtons || [],
    messageIds: state.Chat?.messageIds?.[state.Chat.subThreadId] || [],
    lastMessage: (() => {
      const lastMessageId = state.Chat?.messageIds?.[currentChannelId]?.[0]
      return state.Chat?.msgIdAndDataMap?.[currentChannelId]?.[lastMessageId]
    })(),
    isChatbotMinimized: state.draftData?.isChatbotMinimized || false,
    currentSubThreadId: state.appInfo?.[tabSessionId]?.subThreadId || state.Chat?.subThreadId,
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

  const shouldToggleScreenSize = `${width}${widthUnit}` !== '1200%';

  const handleMinimizeChatbot = (value: boolean) => {
    dispatch(setDataInDraftReducer({ isChatbotMinimized: value }));
  }

  const {
    hideCloseButton,
    chatTitle,
    chatIcon,
    chatSubTitle,
    allowBridgeSwitchViaProp,
    subThreadList,
    hideFullScreenButton,
    isMobileSDK,
  } = useCustomSelector((state: $ReduxCoreType) => {
    return ({
      hideCloseButton: state.appInfo?.[tabSessionId]?.hideCloseButton || false,
      hideFullScreenButton: state.appInfo?.[tabSessionId]?.hideFullScreenButton || false,
      chatTitle: state.Interface?.[chatSessionId]?.chatTitle || "",
      chatSubTitle: state.Interface?.[chatSessionId]?.chatSubTitle || "",
      chatIcon: state.Interface?.[chatSessionId]?.chatIcon || "",
      allowBridgeSwitchViaProp: state?.Interface?.[chatSessionId]?.allowBridgeSwitch,
      subThreadList: state.Interface?.[`${chatSessionId}_${tabSessionId}`]?.interfaceContext?.[bridgeName]?.threadList?.[threadId] || [],
      isMobileSDK: state.appInfo?.[tabSessionId]?.isMobileSDK || false,
    })
  });
  // Determine if we should show the create thread button
  const showCreateThreadButton = useMemo(() => {
    return !(subThreadList?.length < 2 && (!messageIds || messageIds.length === 0));
  }, [subThreadList?.length, messageIds?.length]);

  // Handler for creating a new thread
  const handleCreateNewSubThread = async () => {
    if (preview) return;
    // Reuse the unused empty "New Chat" instead of creating another / no-op
    if (subThreadList?.[0]?.newChat) {
      const emptySubThreadId = subThreadList[0].sub_thread_id;
      if (currentSubThreadId !== emptySubThreadId) {
        dispatch(setDataInAppInfoReducer({ subThreadId: emptySubThreadId }));
        setOptions([]);
      }
      return;
    }

    const newThreadData = {
      sub_thread_id: createRandomId(),
      thread_id: threadId,
      display_name: "New Chat",
      newChat: true
    }

    dispatch(
      setThreads({
        newThreadData,
        bridgeName: reduxBridgeName,
        threadId: threadId,
      })
    );
    setOptions([]);
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


  const MenuIconOverride = useComponentOverride(["chatbotHeader", "menuIcon"]);
  const EditIconOverride = useComponentOverride(["chatbotHeader", "editIcon"]);

  // Memoized drawer toggle button
  const DrawerToggleButton = useMemo(() => {
    if (!(subThreadList?.length > 1)) return null;

    return (
      <button
        className="p-2 hover:bg-base-200 dark:hover:bg-slate-700 rounded-full transition-colors"
        onClick={() => setToggleDrawer(!isToggledrawer)}
        data-testid="chatbot-drawer-toggle-button"
      >
        {isToggledrawer ? null : (
          MenuIconOverride ? (
            <MenuIconOverride />
          ) : (
            <AlignLeft size={22} color={iconColor} />
          )
        )}
      </button>
    );
  }, [subThreadList?.length, isToggledrawer, setToggleDrawer, iconColor, MenuIconOverride]);

  // Memoized create thread button
  const CreateThreadButton = useMemo(() => {
    if (!showCreateThreadButton || isToggledrawer) return null;

    return (
      <div className="tooltip tooltip-right" data-tip="New Chat">
        <button
          className="p-2 hover:bg-base-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          onClick={handleCreateNewSubThread}
          data-testid="chatbot-create-thread-button"
        >
          {EditIconOverride ? (
            <EditIconOverride />
          ) : (
            <SquarePen size={22} color={iconColor} />
          )}
        </button>
      </div>
    );
  }, [showCreateThreadButton, isToggledrawer, handleCreateNewSubThread, iconColor, EditIconOverride]);

  // Memoized header title section
  const HeaderTitleSection = useMemo(() => {
    const displayTitle = isChatbotMinimized && lastMessage?.role === 'user' ? 'You' : chatTitle || chatbotTitle || "AI Assistant";
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
              <h1 className="text-base-content text-center font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis text-sm">
                {displayTitle}
              </h1>
            </div>
            {lastMessage && (
              <div className="flex items-center gap-1 ml-2">
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
              <h1 className="text-base-content text-center font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis text-base">
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
    chatSubTitle,
    chatbotSubtitle,
    isChatbotMinimized,
    lastMessage,
  ]);

  // Memoized fullscreen toggle button
  const ScreenSizeToggleButton = useMemo(() => {
    if (!shouldToggleScreenSize || hideFullScreenButton === true || hideFullScreenButton === "true" || isMobileSDK) {
      return null;
    }

    return fullScreen ? (
      <div
        className="cursor-pointer p-2 rounded-full hover:bg-base-200 dark:hover:bg-slate-700 transition-colors"
        onClick={() => toggleFullScreen(false)}
        data-testid="chatbot-minimize-button"
      >
        {/* <PictureInPicture2 size={22} color="#555555" /> */}
        <Minimize2 size={22} color={iconColor} style={{ transform: 'rotate(90deg)' }} />
      </div>
    ) : (
      <div
        className="cursor-pointer p-2 rounded-full transition-colors hover:bg-base-200 dark:hover:bg-slate-700"
        onClick={() => toggleFullScreen(true)}
        data-testid="chatbot-maximize-button"
      >
        {/* <Maximize size={22} color="#555555" /> */}
        <Maximize2 size={22} color={iconColor} style={{ transform: 'rotate(90deg)' }} />
      </div>
    );
  }, [shouldToggleScreenSize, hideFullScreenButton, fullScreen, toggleFullScreen, iconColor]);

  // Memoized close button
  const CloseButton = useMemo(() => {
    if (hideCloseButton === true || hideCloseButton === "true") return null;

    return (
      <div
        className="cursor-pointer p-2 py-2 rounded-full hover:bg-base-200 dark:hover:bg-slate-700 transition-colors"
        onClick={handleCloseChatbot}
        data-testid="chatbot-close-button"
      >
        <X size={22} color={iconColor} />
      </div>
    );
  }, [hideCloseButton, handleCloseChatbot, iconColor]);

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
    return (
      <div
        className="cursor-pointer p-2 py-2 rounded-full hover:bg-base-200 dark:hover:bg-slate-700 transition-colors"
        onClick={handleToggleMinimize}
        data-testid="chatbot-minimize-toggle-button"
      >
        {isChatbotMinimized ? <Maximize2 size={22} color={iconColor} style={{ transform: 'rotate(90deg)' }} /> : <Minus size={22} color={iconColor} />}
      </div>
    );
  }, [isChatbotMinimized, fullScreen, toggleFullScreen, iconColor])

  if (Override) return <Override preview={preview} chatSessionId={chatSessionId} tabSessionId={tabSessionId} currentTeamId={currentTeamId} currentChannelId={currentChannelId} threadId={threadId} bridgeName={bridgeName} />;

  const TitleNode = TitleOverride
    ? <TitleOverride title={chatTitle || chatbotTitle || "AI Assistant"} subtitle={chatSubTitle || chatbotSubtitle} chatIcon={chatIcon} isChatbotMinimized={isChatbotMinimized} lastMessage={lastMessage} />
    : HeaderTitleSection;

  const CloseBtnNode = CloseButtonOverride
    ? <CloseButtonOverride onClose={handleCloseChatbot} iconColor={iconColor} />
    : CloseButton;

  const MinimizeBtnNode = MinimizeButtonOverride
    ? <MinimizeButtonOverride onToggle={handleToggleMinimize} isMinimized={isChatbotMinimized} iconColor={iconColor} />
    : MinimizeButton;

  return isChatbotMinimized ?
    <div className="px-2 sm:py-4 py-3 w-full cursor-pointer" onClick={handleToggleMinimize}>
      <div className="flex items-center w-full relative px-2">
        {TitleNode}
        <div className="flex justify-end items-center gap-1 flex-1 sm:absolute sm:right-0">
          <div className="flex items-center">
            {MinimizeBtnNode}
            {CloseBtnNode}
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
          {TitleNode}
        </div>

        {/* Right side buttons */}
        <div className="flex justify-end items-center gap-1 flex-1 sm:absolute sm:right-0">
          {allowBridgeSwitchViaProp && allowBridgeSwitch && (
            <BridgeSwitchDropdown
              currentSelectedBridgeSlug={bridgeName}
              bridges={bridges}
            />
          )}

          {headerButtons?.map((item, index) => (
            <React.Fragment key={`header-button-${index}`}>
              {renderIconsByType(item, iconColor)}
            </React.Fragment>
          ))}

          <div className="flex items-center">
            {ScreenSizeToggleButton}
            {(!isMobileSDK) ? CloseBtnNode : MinimizeBtnNode}
          </div>
        </div>
      </div>
    </div>
};

export default React.memo(addUrlDataHoc(ChatbotHeader, [ParamsEnums.currentTeamId, ParamsEnums.currentChannelId, ParamsEnums.threadId, ParamsEnums.bridgeName]));