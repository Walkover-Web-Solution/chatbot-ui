/* eslint-disable */
import { errorToast } from "@/components/customToast";
import FormComponent from "@/components/FormComponent";
import {
  getAllThreadsApi,
  getHelloChatsApi,
  getPreviousMessage,
  sendDataToAction,
} from "@/config/api";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import useSocket from "@/hooks/socket";
import {
  getHelloDetailsStart,
  setChannel,
} from "@/store/hello/helloSlice";
import { setThreads } from "@/store/interface/interfaceSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ParamsEnums } from "@/utils/enums";
import { lighten, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import WebSocketClient from "rtlayer-client";
import ChatbotHeader from "./ChatbotHeader";
import ChatbotHeaderTab from "./ChatbotHeaderTab";
import ChatbotTextField from "./ChatbotTextField";
import "./InterfaceChatbot.css";
import MessageList from "./MessageList";
import ChatbotDrawer from "./ChatbotDrawer";
import { HeaderButtonType } from "@/types/interface/InterfaceReduxType";

const client = WebSocketClient("lyvSfW7uPPolwax0BHMC", "DprvynUwAdFwkE91V5Jj");

interface InterfaceChatbotProps {
  props: any;
  inpreview: boolean;
  chatbotId: string;
  componentId: string;
  gridId: string;
  dragRef: any;
}

interface MessageType {
  content: string;
  role: string;
  responseId?: string;
  wait?: boolean;
  timeOut?: boolean;
  createdAt?: string;
  function?: () => void;
  id?: string;
  images?: string[]; // Added images property to MessageType
}
export const MessageContext = createContext<{
  messages: MessageType[] | [];
  helloMessages: any;
  addMessage?: (message: string) => void;
  setMessages?: (message: MessageType[]) => void;
  threadId?: string;
  bridgeName?: string;
  fetchMoreData?: () => void;
  hasMoreMessages?: boolean;
  setNewMessage?: (newMessage: boolean) => void;
  newMessage?: boolean;
  currentPage?: Number;
  starterQuestions?: string[];
  headerButtons?: HeaderButtonType
}>({
  messages: [],
  helloMessages: [],
  headerButtons: []
});

function InterfaceChatbot({
  props,
  inpreview = true,
  chatbotId,
}: InterfaceChatbotProps) {
  const theme = useTheme();
  const {
    interfaceContextData,
    reduxThreadId,
    reduxSubThreadId,
    reduxBridgeName,
    reduxHelloId,
    reduxBridgeVersionId,
    IsHuman,
    uuid,
    unique_id,
    presence_channel,
    team_id,
    chat_id,
    channelId,
    mode,
    reduxHeaderButtons,
    selectedAiServiceAndModal
  } = useCustomSelector((state: $ReduxCoreType) => ({
    interfaceContextData:
      state.Interface?.interfaceContext?.[chatbotId]?.[
        state.Interface?.bridgeName || "root"
      ]?.interfaceData,
    reduxThreadId: state.Interface?.threadId || "",
    reduxSubThreadId: state.Interface?.subThreadId || "",
    reduxHeaderButtons: state.Interface?.headerButtons || [],
    reduxBridgeName: state.Interface?.bridgeName || "root",
    reduxHelloId: state.Interface?.helloId || null,
    reduxBridgeVersionId: state.Interface?.version_id || null,
    IsHuman: state.Hello?.isHuman || false,
    uuid: state.Hello?.ChannelList?.uuid,
    unique_id: state.Hello?.ChannelList?.unique_id,
    presence_channel: state.Hello?.ChannelList?.presence_channel,
    team_id: state.Hello?.widgetInfo?.team?.[0]?.id,
    chat_id: state.Hello?.Channel?.id,
    channelId: state.Hello?.Channel?.channel || null,
    mode: state.Hello?.mode || [],
    selectedAiServiceAndModal: state.Interface?.selectedAiServiceAndModal || null
  }));

  const [chatsLoading, setChatsLoading] = useState(false);
  const timeoutIdRef = useRef<any>(null);
  const userId = GetSessionStorageData("interfaceUserId");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const messageRef = useRef<any>();
  const [options, setOptions] = useState<any>([]);
  const [images, setImages] = useState<string[]>([]); // Ensure images are string URLs
  const socket = useSocket();
  const channelIdRef = useRef<string | null>(null);
  const listenerRef = useRef<string | null>(null);
  const containerRef = useRef<any>(null);
  const themePalette = {
    "--primary-main": lighten(theme.palette.secondary.main, 0.4),
  };

  const isLargeScreen = useMediaQuery('(max-width: 1024px)')
  const [isToggledrawer, setToggleDrawer] = useState<boolean>(!isLargeScreen);

  useEffect(() => {
    setToggleDrawer(!isLargeScreen);
  }, [isLargeScreen]);

  const [threadId, setThreadId] = useState(
    GetSessionStorageData("threadId") || reduxThreadId
  );
  const [subThreadId, setSubThreadId] = useState(reduxSubThreadId);
  const [bridgeName, setBridgeName] = useState(
    GetSessionStorageData("bridgeName") || reduxBridgeName
  );
  const [helloId, setHelloId] = useState(
    GetSessionStorageData("helloId") || reduxHelloId
  );
  const [bridgeVersionId, setBridgeVersionId] = useState(
    GetSessionStorageData("version_id") || reduxBridgeVersionId
  );

  const [headerButtons, setHeaderButtons] = useState<HeaderButtonType>(
    JSON.parse(GetSessionStorageData("headerButtons") || '[]') || reduxHeaderButtons
  );

  useEffect(() => {
    setThreadId(GetSessionStorageData("threadId") || reduxThreadId);
  }, [reduxThreadId]);

  useEffect(() => {
    setSubThreadId(reduxSubThreadId);
  }, [reduxSubThreadId]);

  useEffect(() => {
    setBridgeName(GetSessionStorageData("bridgeName") || reduxBridgeName);
  }, [reduxBridgeName]);

  useEffect(() => {
    setHeaderButtons(JSON.parse(GetSessionStorageData("headerButtons") || '[]') || reduxHeaderButtons);
  }, [reduxHeaderButtons]);

  useEffect(() => {
    setHelloId(GetSessionStorageData("helloId"));
  }, [reduxHelloId]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [newMessage, setNewMessage] = useState(false);

  useEffect(() => {
    setBridgeVersionId(GetSessionStorageData("version_id"));
  }, [reduxBridgeVersionId]);

  const [messages, setMessages] = useState<MessageType[]>(
    useMemo(
      () =>
        !inpreview
          ? [
            { content: "hello how are you ", role: "user" },
            {
              responseId: "Response24131",
              content:
                '{\n  "response": "Our AI services are available for you anytime, Feel free to ask anything"\n}',
              role: "assistant",
            },
          ]
          : [],
      [inpreview]
    )
  );

  const [helloMessages, setHelloMessages] = useState<any>([]);
  const [starterQuestions, setStarterQuestions] = useState<any>([]);

  useEffect(() => {
    getHelloPreviousHistory(messages);
  }, [channelId, uuid]);

  const dispatch = useDispatch();

  const fetchMoreData = async () => {
    if (isFetching || !hasMoreMessages) return;
    setIsFetching(true);
    try {
      const nextPage = currentPage + 1;
      const { previousChats } = await getPreviousMessage(
        threadId,
        bridgeName,
        nextPage
      );

      if (Array.isArray(previousChats) && previousChats.length > 0) {
        setMessages((prevMessages) => [...previousChats, ...prevMessages]); // Prepend older messages
        setCurrentPage(nextPage);

        if (previousChats.length < 40) {
          setHasMoreMessages(false);
        }
      } else {
        setHasMoreMessages(false); // No more messages to load
      }
    } catch (error) {
      console.warn("Error fetching more messages:", error);
      errorToast("Failed to load more messages.");
    } finally {
      setIsFetching(false);
    }
  };


  const addMessage = (message: string) => {
    onSend(message);
  };

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event?.data?.type === "refresh") {
        getallPreviousHistory();
      }
      if (event?.data?.type === "askAi") {
        if (!loading) {
          const data = event?.data?.data;
          if (typeof data === "string") {
            // this is for when direct sending message through window.askAi("hello")
            onSend(data);
          } else {
            // this is for when sending from SendDataToChatbot method window.SendDataToChatbot({bridgeName: 'asdlfj', askAi: "hello"})
            sendMessage(
              data.askAi || "",
              data?.variables || {},
              data?.threadId || null,
              data?.bridgeName || null
            );
            setTimeout(() => {
              onSend(data.askAi || "", false);
            }, 1000);
          }
        } else {
          errorToast("Please wait for the response from AI");
          return;
        }
      }
    },
    [loading]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  useEffect(() => {
    if (!socket) return;
    socket.on("NewPublish", (data) => {
      const { response } = data;
      const { message } = response || {};
      const { content, chat_id, from_name, sender_id } = message || {};
      const text = content?.text;
      if (text && !chat_id) {
        setLoading(false);
        clearTimeout(timeoutIdRef.current);
        setHelloMessages((prevMessages) => {
          const lastMessageId = prevMessages[prevMessages.length - 1]?.id;
          if (lastMessageId !== response?.id) {
            return [
              ...prevMessages,
              {
                role: sender_id === "bot" ? "Bot" : "Human",
                from_name,
                content: text,
                id: response?.id,
              },
            ];
          }
          return prevMessages;
        });
      }
    });
    socket.on("message", (data) => {
      // console.log("New message in channel message", data);
    });

    return () => {
      socket.off("NewPublish");
      socket.off("message");
    };
  }, [socket]);

  const startTimeoutTimer = () => {
    timeoutIdRef.current = setTimeout(() => {
      setMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages.slice(0, -1),
          { role: "assistant", wait: false, timeOut: true },
        ];
        setLoading(false);
        return updatedMessages;
      });
    }, 240000);
  };

  const getallPreviousHistory = async () => {
    if (threadId && chatbotId) {
      setChatsLoading(true);
      try {
        const { previousChats, starterQuestion } = await getPreviousMessage(
          threadId,
          bridgeName,
          1,
          subThreadId
        );
        if (Array.isArray(previousChats)) {
          setMessages(previousChats?.length === 0 ? [] : [...previousChats]);
          setCurrentPage(1);
          setHasMoreMessages(previousChats?.length >= 40);
        } else {
          setMessages([]);
          setHasMoreMessages(false);
          console.warn("previousChats is not an array");
        }
        if (Array.isArray(starterQuestion)) {
          setStarterQuestions(starterQuestion.slice(0, 4));
        }
      } catch (error) {
        console.warn("Error fetching previous chats:", error);
        setMessages([]);
        setHasMoreMessages(false);
      } finally {
        setChatsLoading(false);
      }
    }
  };

  const getHelloPreviousHistory = async () => {
    if (channelId && uuid) {
      const helloChats = (await getHelloChatsApi({ channelId: channelId }))
        ?.data?.data;
      let filterChats = helloChats
        .map((chat) => {
          let role;

          if (chat?.message?.from_name) {
            role = "Human";
          } else if (
            !chat?.message?.from_name &&
            chat?.message?.sender_id === "bot"
          ) {
            role = "Bot";
          } else {
            role = "user";
          }

          return {
            role: role,
            message_id: chat?.id,
            from_name: chat?.message?.from_name,
            content: chat?.message?.content?.text,
          };
        })
        .reverse();
      setHelloMessages(filterChats);
    } else {
      console.warn("helloChats is not an array or empty");
    }
  };

  const subscribeToChannel = () => {
    if (bridgeName && threadId) {
      dispatch(
        getHelloDetailsStart({
          slugName: bridgeName,
          threadId: threadId,
          helloId: helloId || null,
          versionId: reduxBridgeVersionId || null,
        })
      );
    }
  };

  const fetchAllThreads = async () => {
    const result = await getAllThreadsApi({ threadId });
    if (result?.success) {
      dispatch(
        setThreads({ bridgeName, threadId, threadList: result?.threads })
      );
    }
  };

  useEffect(() => {
    fetchAllThreads();
  }, [threadId, bridgeName]);

  useEffect(() => {
    subscribeToChannel();
  }, [bridgeName, threadId, helloId]);

  useEffect(() => {
    getallPreviousHistory();
  }, [threadId, bridgeName, subThreadId]);

  useEffect(() => {
    const newChannelId = (
      chatbotId +
      (threadId || userId) +
      (subThreadId || userId)
    )?.replace(/ /g, "_");

    const handleMessageRTLayer = (message: string) => {
      // Parse the incoming message string into an object
      const parsedMessage = JSON.parse(message || "{}");
      // Check if the status is "connected"
      if (parsedMessage?.status === "connected") {
        return;
      }
      // Check if the function call is present
      if (
        parsedMessage?.response?.function_call &&
        !parsedMessage?.response?.message
      ) {
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { role: "assistant", wait: true, content: "Function Calling" },
        ]);
      } else if (
        parsedMessage?.response?.function_call &&
        parsedMessage?.response?.message
      ) {
        // Check if the function call is false and no response is provided
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { role: "assistant", wait: true, content: "Talking with AI" },
        ]);
      } else if (!parsedMessage?.response?.data && parsedMessage?.error) {
        // Check if there is an error and no response data
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            role: "assistant",
            content: `${parsedMessage?.error || "Error in AI"}`,
          },
        ]);
        setLoading(false);
        clearTimeout(timeoutIdRef.current);
      } else if (
        parsedMessage?.response?.data?.role === "reset" &&
        !parsedMessage?.response?.data?.mode
      ) {
        // all previous message and new object inserted
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "reset",
            mode: parsedMessage?.response?.data?.mode,
            content: "Resetting the chat",
          },
        ]);
      } else if (parsedMessage?.response?.data?.suggestions !== undefined) {
        setOptions(parsedMessage.response?.data?.suggestions || []);
      } else if (parsedMessage?.response?.data) {
        // Handle the new structure with response data
        // const content = parsedMessage.response.data.content;
        setLoading(false);
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            role: parsedMessage.response?.data?.role || "assistant",
            ...(parsedMessage.response.data || {}),
          },
        ]);
        clearTimeout(timeoutIdRef.current);
      } else {
        console.warn("Some error occurred in the message", parsedMessage);
      }
    };

    // if (newChannelId !== channelIdRef.current) {
    //   channelIdRef.current = newChannelId;

    const listener = client.on(newChannelId, handleMessageRTLayer);

    // Cleanup on effect re-run or unmount
    return () => {
      listener.remove();
      clearTimeout(timeoutIdRef.current);
    };
    // }
  }, [chatbotId, userId, threadId, subThreadId]);

  const sendMessage = async (
    message: string,
    imageUrls: string[], // Now expecting image URLs
    variables = {},
    thread = "",
    bridge = ""
  ) => {
    const response = await sendDataToAction({
      message,
      images: imageUrls, // Send image URLs
      userId,
      interfaceContextData: { ...interfaceContextData, ...variables } || {},
      threadId: thread || threadId,
      subThreadId: subThreadId,
      slugName: bridge || bridgeName,
      chatBotId: chatbotId,
      version_id: bridgeVersionId,
      ...((selectedAiServiceAndModal?.modal && selectedAiServiceAndModal?.service) ? {
        configuration: { model: selectedAiServiceAndModal?.modal },
        service: selectedAiServiceAndModal?.service
      } : {})
    });
    if (!response?.success) {
      setMessages((prevMessages) => prevMessages.slice(0, -1));
      setLoading(false);
    }
  };

  const onSend = async (msg?: string, apiCall: boolean = true) => {
    const textMessage = msg || messageRef.current.value;
    if (!textMessage && images.length === 0) return;

    setNewMessage(true);
    startTimeoutTimer();

    if (apiCall) sendMessage(textMessage, images);
    setLoading(true);
    setOptions([]);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: textMessage, urls: images },
      { role: "assistant", wait: true, content: "Talking with AI" },
    ]);
    setImages([]); // Clear images after sending
    messageRef.current.value = "";
  };

  const sendMessageToHello = async (message: string) => {
    const channelDetail = {
      call_enabled: null,
      uuid: uuid,
      country: null,
      pseudo_name: null,
      unique_id: unique_id,
      presence_channel: presence_channel,
      country_iso2: null,
      chatInputSubmitted: false,
      is_blocked: null,
      customer_name: null,
      customer_number: null,
      customer_mail: null,
      team_id: team_id,
      new: true,
    };
    if (!channelId) setOpen(true);

    const response = (
      await axios.post(
        "https://api.phone91.com/v2/send/",
        {
          type: "widget",
          message_type: "text",
          content: {
            text: message,
            attachment: [],
          },
          ...(!channelId ? { channelDetail: channelDetail } : {}),
          chat_id: !channelId ? null : chat_id,
          session_id: null,
          user_data: {},
          is_anon: true,
        },
        {
          headers: {
            accept: "application/json",
            authorization: localStorage.getItem("HelloAgentAuth"),
          },
        }
      )
    )?.data?.data;
    if (!channelId) dispatch(setChannel({ Channel: response }));
  };

  const onSendHello = (msg?: string, apiCall: boolean = true) => {
    const textMessage = msg || messageRef.current.value;
    if (!textMessage) return;
    apiCall && sendMessageToHello(textMessage);
    setOptions([]);
    setHelloMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: textMessage },
    ]);
    messageRef.current.value = "";
  };

  return (
    <MessageContext.Provider
      value={{
        messages: messages,
        helloMessages: helloMessages,
        addMessage,
        setMessages,
        threadId,
        bridgeName,
        fetchMoreData,
        hasMoreMessages,
        setNewMessage,
        newMessage,
        currentPage,
        starterQuestions,
        headerButtons
      }}
    >
      <FormComponent open={open} setOpen={setOpen} />
      <div className="flex h-screen w-full overflow-hidden relative">
        {/* Sidebar - always visible on large screens */}
        <div className={`hidden lg:block bg-base-100 border-r overflow-y-auto transition-all duration-300 ease-in-out ${isToggledrawer ? ' w-64' : 'w-0'}`}>
          <ChatbotDrawer setToggleDrawer={setToggleDrawer} isToggledrawer={isToggledrawer} />
        </div>

        {/* Main content area */}

        <div className="flex flex-col flex-1 w-full">
          {/* Mobile header - hidden on large screens */}
          <ChatbotHeader
            setLoading={setLoading}
            setChatsLoading={setChatsLoading}
            setToggleDrawer={setToggleDrawer}
            isToggledrawer={isToggledrawer}
            threadId={threadId}
            reduxBridgeName={reduxBridgeName}
            headerButtons={headerButtons}
          />
          <ChatbotHeaderTab />

          {chatsLoading && (
            <div className="h-[0.8] animate-pulse" style={{ backgroundColor: theme.palette.primary.main }} />
          )}

          {/* Messages container with flex layout */}
          <div
            className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 ${messages.length === 0 ? 'flex items-center justify-center' : 'pb-10'}`}
            id="message-container"
            ref={containerRef}
          >
            <div className="w-full max-w-5xl mx-auto px-4">
              <MessageList containerRef={containerRef} />
            </div>
          </div>

          {/* Text input at bottom */}
          <div className="max-w-5xl mx-auto px-4 py-3 w-full">
            <ChatbotTextField
              loading={loading}
              options={options}
              setChatsLoading={setChatsLoading}
              onSend={() => {
                IsHuman ? onSendHello() : onSend();
              }}
              messageRef={messageRef}
              setImages={setImages}
              images={images}
            />
          </div>
        </div>
      </div>
    </MessageContext.Provider>
  );
}

export default React.memo(
  addUrlDataHoc(React.memo(InterfaceChatbot), [ParamsEnums.chatbotId])
);
