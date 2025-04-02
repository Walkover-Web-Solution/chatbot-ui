// MUI Icons
import ChatIcon from "@mui/icons-material/Chat";
import { AlignLeft, EllipsisVertical, History, Maximize, PictureInPicture2, Settings, SquarePen, X } from "lucide-react";

// MUI Components
import { useTheme } from "@mui/material";

// Third-party libraries
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";

// App imports
import { successToast } from "@/components/customToast";
import { createNewThreadApi, performChatAction } from "@/config/api";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { createRandomId, DEFAULT_AI_SERVICE_MODALS, ParamsEnums } from "@/utils/enums";
import { isColorLight } from "@/utils/themeUtility";
import ChatbotDrawer from "./ChatbotDrawer";

// Styles
import { setDataInInterfaceRedux, setSelectedAIServiceAndModal, setThreads } from "@/store/interface/interfaceSlice";
import { HeaderButtonType, SelectedAiServicesType } from "@/types/interface/InterfaceReduxType";
import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { ChatbotContext } from "../context";
import { MessageContext } from "./InterfaceChatbot";
import "./InterfaceChatbot.css";

interface ChatbotHeaderProps {
  setLoading: (loading: boolean) => void;
  setChatsLoading: (loading: boolean) => void;
  setToggleDrawer: (isOpen: boolean) => void;
  isToggledrawer: boolean;
  headerButtons: HeaderButtonType
}

const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({ setLoading, setChatsLoading, setToggleDrawer, isToggledrawer, threadId, reduxBridgeName, headerButtons, preview = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { setOptions } = useContext(MessageContext);
  const { chatbotConfig: { chatbotTitle, chatbotSubtitle, width = '', widthUnit = '', allowBridgeSwitch = false, bridges = [] } } = useContext<any>(ChatbotContext);
  const [fullScreen, setFullScreen] = useState(false)
  const shouldToggleScreenSize = `${width}${widthUnit}` !== '1200%'
  const isLightBackground = theme.palette.mode === "light";
  const textColor = isLightBackground ? "black" : "white";
  const { allowModalSwitch, hideCloseButton, chatTitle, chatIcon, currentSelectedBridgeSlug, chatSubTitle, allowBridgeSwitchViaProp } = useCustomSelector((state: $ReduxCoreType) => ({
    allowModalSwitch: state.Interface.allowModalSwitch || false,
    hideCloseButton: state.Interface.hideCloseButton || false,
    chatTitle: state.Interface.chatTitle || "",
    chatSubTitle: state.Interface.chatSubTitle || "",
    chatIcon: state.Interface.chatIcon || "",
    currentSelectedBridgeSlug: state?.Interface?.bridgeName,
    allowBridgeSwitchViaProp: state?.Interface?.allowBridgeSwitch
  }))
  const handleCreateNewSubThread = async () => {
    if (preview) return;
    const result = await createNewThreadApi({
      threadId: threadId,
      subThreadId: createRandomId(),
    });
    if (result?.success) {
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
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-2 sm:py-4 py-2 w-full">
      <div className="flex items-center w-full relative">
        <div className="sm:absolute left-0 flex items-center">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            onClick={() => setToggleDrawer(!isToggledrawer)}
          >
            {isToggledrawer ? null : <AlignLeft size={22} color="#555555" />}
          </button>
          <div className={`tooltip tooltip-right ${isToggledrawer ? 'hidden' : ''}`} data-tip="Create new thread">
            <button
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              onClick={handleCreateNewSubThread}
            >
              <SquarePen size={22} color="#555555" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mx-auto">
          <div className="flex items-center sm:gap-3 gap-1 justify-center">
            {chatIcon ? <Image alt="headerIcon" width={24} height={24} src={chatIcon} className="rounded-full" /> : null}
            <h1 className="text-gray-800 text-center font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">
              {chatTitle || chatbotTitle || "AI Assistant"}
            </h1>
            {/* <ResetChatOption
              textColor={textColor}
              setChatsLoading={setChatsLoading}
            /> */}
          </div>
          {chatbotSubtitle && <p className="text-sm opacity-75 text-center whitespace-nowrap overflow-hidden overflow-ellipsis">
            {chatSubTitle || chatbotSubtitle || "Do you have any questions? Ask us!"}
          </p>}
        </div>
        <div className="sm:absolute right-0 flex justify-center items-center gap-1">
          {allowBridgeSwitchViaProp && allowBridgeSwitch && <BridgeSwitchDropdown currentSelectedBridgeSlug={currentSelectedBridgeSlug} bridges={bridges} />}
          {allowModalSwitch && <AiServicesToSwitch />}
          {headerButtons?.map((item, index) => {
            return <React.Fragment key={`header-button-${index}`}>
              {renderIconsByType(item)}
            </React.Fragment>
          })}
          <div className="flex items-center">
            {shouldToggleScreenSize ? (
              <div>
                {!fullScreen ? (
                  <div
                    className="cursor-pointer p-1 rounded-full"
                    onClick={() => {
                      if (window?.parent) {
                        setFullScreen(true);
                        window.parent.postMessage({ type: "ENTER_FULL_SCREEN_CHATBOT" }, "*");
                      }
                    }}
                  >
                    <Maximize size={22} color="#555555" />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer p-1 rounded-full"
                    onClick={() => {
                      if (window?.parent) {
                        setFullScreen(false);
                        window.parent.postMessage({ type: "EXIT_FULL_SCREEN_CHATBOT" }, "*");
                      }
                    }}
                  >
                    <PictureInPicture2 size={22} color="#555555" />
                  </div>
                )}
              </div>
            ) : null}
            {
              !hideCloseButton && <div className="cursor-pointer p-1 py-3" onClick={() => {
                if (window?.parent) {
                  window.parent.postMessage({ type: "CLOSE_CHATBOT" }, "*")
                }
              }}>
                <X size={22} color="#555555" />
              </div>
            }
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

    </div >
  );
};

export default ChatbotHeader;

const ResetChatOption = React.memo(
  addUrlDataHoc(
    ({
      textColor,
      setChatsLoading = () => { },
      preview = false,
      chatbotId,
    }) => {
      const [modalOpen, setModalOpen] = React.useState(false);
      const { threadId, bridgeName, IsHuman, subThreadId } = useCustomSelector(
        (state: $ReduxCoreType) => ({
          threadId: state.Interface?.threadId || "",
          subThreadId: state.Interface?.subThreadId || "",
          bridgeName: state.Interface?.bridgeName || "root",
          IsHuman: state.Hello?.isHuman,
        })
      );
      const userId = GetSessionStorageData("interfaceUserId");

      const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // Prevent event bubbling
      };

      const handleClose = async () => {
      };

      const resetHistory = async () => {
        if (preview) return;
        setChatsLoading(true);
        await performChatAction({
          userId,
          thread_id: threadId,
          slugName: bridgeName,
          chatBotId: chatbotId,
          sub_thread_id: subThreadId,
          purpose: "is_reset",
        });
        setChatsLoading(false);
      };

      return (
        <div className="dropdown dropdown-bottom z-[9]" onClick={(e) => e.stopPropagation()}>
          <div tabIndex={0} role="button" className=""><ChevronDown className="w-5" color={textColor} /></div>
          <ul className="dropdown-content menu shadow bg-base-100 rounded-box w-52">
            {/* <li>
              <button
                onClick={resetHistory}
                disabled={IsHuman}
                className="flex items-center gap-2"
              >
                <SyncIcon className="h-4 w-4" />
                Reset Chat
              </button>
            </li> */}
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <ChatIcon className="h-4 w-4" />
                Send feedback
              </button>
            </li>
          </ul>
          {modalOpen && (
            <ChatbotFeedbackForm open={modalOpen} setOpen={setModalOpen} />
          )}
        </div>
      );
    },
    [ParamsEnums.chatbotId]
  )
);

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

const ChatbotFeedbackForm = React.memo(function ChatbotFeedbackForm({
  open,
  setOpen,
}: ChatbotFeedbackFormProps) {
  const userId = GetSessionStorageData("interfaceUserId");
  const handleClose = () => {
    setOpen(false);
  };
  const [feedback, setFeedback] = React.useState("");

  const sendFeedback = async () => {
    const feedbackUrl = process.env.REACT_APP_CHATBOT_FEEDBACK_URL;
    if (feedbackUrl) {
      await axios.post(feedbackUrl, { message: feedback, userId });
      successToast("Feedback submitted successfully!");
      setFeedback("");
      handleClose();
    }
  };

  return (
    <div className={`modal ${open ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Submit Chatbot Feedback</h3>
        <p className="py-4">
          We value your feedback on our chatbot! Please share your thoughts to
          help us improve your experience.
        </p>
        <textarea
          className="textarea textarea-bordered w-full h-40"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
        />
        {feedback?.length < 10 && (
          <p className="text-error text-sm mt-1">
            Minimum 10 characters required
          </p>
        )}
        <div className="modal-action">
          <button className="btn" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={sendFeedback}
            disabled={feedback?.length < 10}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
});

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