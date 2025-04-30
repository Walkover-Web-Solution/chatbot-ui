'use client';
/* eslint-disable */
import { AiIcon, UserAssistant } from "@/assests/assestsIndex";
import InterfaceGrid from "@/components/Grid/Grid";
import { Anchor, Code } from "@/components/Interface-Chatbot/Interface-Markdown/MarkdownUtitily";
import { $ReduxCoreType } from "@/types/reduxCore";
import { supportsLookbehind } from "@/utils/appUtility";
import { isJSONString } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { ALLOWED_EVENTS_TO_SUBSCRIBE } from "@/utils/enums";
import { isColorLight } from "@/utils/themeUtility";
import {
  Box,
  Chip,
  Divider,
  lighten,
  useMediaQuery,
  useTheme
} from "@mui/material";
import copy from "copy-to-clipboard";
import { AlertCircle, Check, CircleCheckBig, Copy, Maximize2, ThumbsDown, ThumbsUp } from "lucide-react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import React, { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { MessageContext } from "../InterfaceChatbot";
import "./Message.css";
import RenderHelloInteractiveMessage from "../../Hello/RenderHelloInteractiveMessage";
import RenderHelloAttachmentMessage from "../../Hello/RenderHelloAttachmentMessage";
import RenderHelloFeedbackMessage from "../../Hello/RenderHelloFeedbackMessage";
import RenderHelloVedioCallMessage from "@/components/Hello/RenderHelloVedioCallMessage";
const remarkGfm = dynamic(() => import('remark-gfm'), { ssr: false });

const ResetHistoryLine = ({ text = "" }) => {
  return (
    <Divider className="mb-2">
      <Chip
        label={text || "History cleared"}
        size="small"
        color={!text ? "error" : "success"}
      />
    </Divider>
  );
};

const UserMessageCard = React.memo(({ message, theme, textColor }: any) => {
  const isSmallScreen = useMediaQuery('(max-width:1023px)');
  return (
    <>
      <div className="flex flex-col gap-2.5 items-end w-full mb-2.5 animate-slide-left mt-1">
        {Array.isArray(message?.urls) && message.urls.length > 0 && (
          <div className="flex flex-row-reverse flex-wrap gap-2.5 max-w-[80%] p-2.5 ">
            {message.urls.map((url: any, index: number) => {
              return (
                <Image
                  key={index}
                  src={typeof url === 'object' ? url?.path : url}
                  alt={`Image ${index + 1}`}
                  className={`block ${isSmallScreen ? 'max-w-[80%]' : 'max-w-[40%]'} h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => window.open(typeof url === 'object' ? url?.path : url, "_blank")}
                  width={20} // You should replace 0 with the actual width
                  height={20} // You should replace 0 with the actual height
                  layout="responsive"
                />
              )
            })}
          </div>
        )}
        {message?.content && <div
          className="p-2.5 min-w-[150px] sm:max-w-[80%] max-w-[90%] rounded-[10px_10px_1px_10px] break-words"
          style={{
            backgroundColor: theme.palette.primary.main,
            color: textColor
          }}
        >
          <div className="card-body p-0">
            <p className="whitespace-pre-wrap text-sm md:text-base">
              {message?.content}
            </p>
          </div>
        </div>}
      </div>

      {message?.is_reset && <ResetHistoryLine />}
    </>
  );
});

const AssistantMessageCard = React.memo(
  ({
    message,
    theme,
    isError = false,
    addMessage = () => { },
    sendEventToParentOnMessageClick
  }: any) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const handleCopy = () => {
      copy(message?.chatbot_message || message?.content);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    };

    const themePalette = {
      "--primary-main": lighten(theme.palette.secondary.main, 0.4),
    };

    const handleMessageClick = () => {
      if (sendEventToParentOnMessageClick) {
        emitEventToParent("MESSAGE_CLICK", message)
      }
    }

    return (
      <div className="flex flex-col" onClick={handleMessageClick}>
        <div className="flex items-end sm:max-w-[90%] max-w-[98%] animate-slide-left">
          <div className="flex flex-col items-center justify-end w-8 pb-3">
            <div className="sm:w-7 sm:h-7 w-6 h-6 rounded-full bg-primary/10 p-1 flex items-center justify-center">
              <Image
                src={AiIcon}
                width="28"
                height="28"
                alt="AI"
                style={{ color: "red" }}
              />
            </div>
          </div>

          {message?.wait ? (
            <div className="w-full">
              <div className="flex flex-wrap gap-2 items-center">
                {message?.Name && Array.isArray(message?.Name) && message.Name.map((name: string, index: number) => (
                  <p key={index} className="text-sm font-medium">{name}</p>
                ))}
                <p className="text-sm">{message?.content}</p>
              </div>
              <div className="loading-indicator" style={themePalette}>
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
                <div className="loading-bar"></div>
              </div>
            </div>
          ) : (
            <div className="min-w-[150px] w-full dark:bg-gray-800 rounded-lg p-3" style={{ backgroundColor: theme.palette.background.default }}>
              {message?.timeOut ? (
                <div className="flex items-center gap-2 text-error">
                  <AlertCircle className="w-4 h-4" />
                  <p>Timeout reached. Please try again later.</p>
                </div>
              ) : message.image_url ? (
                <div className="space-y-2">
                  <Image
                    src={message.image_url}
                    alt="Message Image"
                    width={400}
                    height={400}
                    className="w-full max-h-[400px] min-h-[100px] rounded-lg object-cover"
                  />
                  <a
                    href={message.image_url}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-ghost btn-sm w-full text-primary"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    View Full Image
                  </a>
                </div>
              ) : (
                <div className="prose dark:prose-invert break-words">
                  {Object.keys(message?.tools_data || {})?.length > 0 && (
                    <Box className="flex items-center gap-2 mb-2">
                      <CircleCheckBig color="green" size={20} />
                      <p className="text-base text-green-900">
                        {Object.keys(message?.tools_data || {}).length} Functions executed
                      </p>
                    </Box>
                  )}
                  {(() => {
                    const parsedContent = isJSONString(
                      isError
                        ? message?.error
                        : message?.chatbot_message || message?.content
                    )
                      ? JSON.parse(
                        isError
                          ? message.error
                          : message?.chatbot_message || message?.content
                      )
                      : null;

                    if (
                      parsedContent &&
                      (parsedContent.hasOwnProperty("isMarkdown") ||
                        parsedContent.hasOwnProperty("response") ||
                        parsedContent.hasOwnProperty("components"))
                    ) {
                      return parsedContent.isMarkdown ||
                        parsedContent?.response ? (
                        <>
                          <ReactMarkdown
                            {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}
                            components={{
                              code: Code,
                              a: Anchor,
                            }}
                          >
                            {parsedContent?.markdown ||
                              JSON.stringify(parsedContent?.response)}
                          </ReactMarkdown>
                          {parsedContent?.options && (
                            <div className="flex flex-col gap-2 mt-4">
                              {parsedContent.options.map(
                                (option: any, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => addMessage(option)}
                                    className="btn btn-outline btn-sm"
                                  >
                                    {option}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <InterfaceGrid
                          inpreview={false}
                          ingrid={false}
                          gridId={parsedContent?.responseId || "default"}
                          loadInterface={false}
                          componentJson={parsedContent}
                          msgId={message?.createdAt}
                        />
                      );
                    }
                    return (
                      <ReactMarkdown
                        {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}
                        components={{
                          code: Code,
                          a: Anchor,
                        }}
                      >
                        {!isError
                          ? message?.chatbot_message || message?.content
                          : message.error}
                      </ReactMarkdown>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-10">
          {!message?.wait && !message?.timeOut && !message?.error && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <button
                className="btn btn-ghost btn-xs tooltip"
                data-tip={isCopied ? "Copied!" : "Copy"}
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {message?.message_id && (
                <FeedBackButtons msgId={message?.Id || message?.id} />
              )}
            </div>
          )}
        </div>

        {message?.is_reset && <ResetHistoryLine />}
      </div>
    );
  }
);

const HumanOrBotMessageCard = React.memo(
  ({
    message,
    theme,
    backgroundColor,
    textColor,
    isBot = false,
    isError = false,
    handleFeedback = () => { },
    addMessage = () => { },
  }: any) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const handleCopy = () => {
      copy(message?.chatbot_message || message?.content);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    };

    const isSmallScreen = useMediaQuery('(max-width:1023px)');

    return (
      <div className="w-full mb-2 animate-fade-in animate-slide-left">
        <div className="flex items-start gap-2 max-w-[90%]">
          <div className="">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-base-200">
              {!isBot ? (
                <div className="rounded-full" style={{ backgroundColor: lighten(backgroundColor, 0.3) }}>
                  {message?.from_name ? (
                    <div className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full" style={{ color: textColor }}>
                      {message?.from_name?.charAt(0)?.toUpperCase()}
                    </div>
                  ) : (
                    <Image
                      width={24}
                      height={24}
                      src={UserAssistant}
                      alt="User"
                      className="opacity-70"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-full p-1 shadow-inner transform active:scale-95 transition-transform active:bg-primary/20">
                  <Image
                    width={24}
                    height={24}
                    src="https://img.icons8.com/ios/50/message-bot.png"
                    alt="Bot"
                    className="opacity-70"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex  whitespace-pre-wrap  break-words">
            <div className="text-base-content p-1  whitespace-pre-wrap w-full break-words">
              {message?.from_name && (
                <div className="text-sm font-medium mb-1">{message.from_name}</div>
              )}
         
              { message?.message_type === "video_call" ? <RenderHelloVedioCallMessage message={message} /> : message?.message_type === 'interactive' ? <RenderHelloInteractiveMessage message={message} /> : (message?.message_type === 'attachment' || message?.message_type === 'text-attachment') ? <RenderHelloAttachmentMessage message={message} /> : message?.message_type === 'feedback' ? <RenderHelloFeedbackMessage message={message} /> : <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: message?.content }}></div>
              </div>}
            </div>

            {/* <div className="flex items-center gap-2 mt-1 ml-1">
              <button
                className="btn btn-ghost btn-xs tooltip tooltip-top"
                data-tip={isCopied ? "Copied!" : "Copy message"}
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-base-content/70" />
                )}
              </button>
            </div> */}
          </div>
        </div>

        {message?.is_reset && (
          <div className="divider my-3">
            <div className="badge badge-warning badge-sm">Chat history cleared</div>
          </div>
        )}
      </div>
    );
  }
);

function Message({ testKey, message, addMessage }: any) {
  const theme = useTheme();
  const backgroundColor = theme.palette.primary.main;
  const textColor = isColorLight(backgroundColor) ? "#000000" : "#ffffff";
  const { sendEventToParentOnMessageClick } = useCustomSelector((state: $ReduxCoreType) => ({
    sendEventToParentOnMessageClick: state.Interface.eventsSubscribedByParent?.includes(ALLOWED_EVENTS_TO_SUBSCRIBE.MESSAGE_CLICK) || false
  }))

  return (
    <Box className="w-100">
      {message?.role === "user" ? (
        <>
          <UserMessageCard
            message={message}
            theme={theme}
            textColor={textColor}
          />
          {message?.error && (
            <AssistantMessageCard
              message={message}
              isError={true}
              theme={theme}
              textColor={textColor}
              addMessage={addMessage}
            />
          )}
        </>
      ) : message?.role === "assistant" ? (
        <AssistantMessageCard
          message={message}
          theme={theme}
          textColor={textColor}
          addMessage={addMessage}
          sendEventToParentOnMessageClick={sendEventToParentOnMessageClick}
        />
      ) : message?.role === "Human" ? (
        <HumanOrBotMessageCard
          message={message}
          theme={theme}
          textColor={textColor}
          backgroundColor={backgroundColor}
          addMessage={addMessage}
        />
      ) : message?.role === "Bot" ? (
        <HumanOrBotMessageCard
          message={message}
          theme={theme}
          isBot={true}
          textColor={textColor}
          addMessage={addMessage}
        />
      ) : message?.role === "tools_call" && Object.keys(message?.function) ? (
        <div className="flex gap-2 pl-3 items-center">
          <div className="collapse collapse-arrow w-full">
            <input type="checkbox" />
            <div className="collapse-title flex flex-row items-center w-full max-w-64">
              <CircleCheckBig color="green" size={20} />
              <p className="text-base text-green-900 ml-2">
                {Object.keys(message?.tools_call_data?.[0] || []).length} Functions executed
              </p>
            </div>
            <div className="collapse-content w-full gap-2">
              <div className="flex flex-col gap-2">
                {message?.tools_call_data && Object.entries(message.tools_call_data?.[0]).map(([key, funcData], index) => {
                  return (
                    <div key={key} className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Step {index + 1}: </span>
                        <span className="truncate  inline-block align-bottom" title={funcData?.name}>
                          {funcData?.name}
                        </span>
                        <span className="font-light"> (Functon executed)</span>
                      </p>
                    </div>
                  );
                })}

              </div>
              <div className="rounded-lg">
                <p className="text-sm text-green-700 font-medium">AI responded...</p>
              </div>
            </div>
          </div>
        </div>
      ) : message?.role === "reset" ? (
        <ResetHistoryLine text={message?.mode ? "Talk to human" : ""} />
      ) : null}
    </Box>
  );
}



function FeedBackButtons({ msgId }) {
  const { handleMessageFeedback, msgIdAndDataMap } = useContext(MessageContext)
  return <>
    <button
      className={`btn btn-ghost btn-xs tooltip ${msgIdAndDataMap?.[msgId]?.user_feedback === 1 ? "text-success" : ""
        }`}
      data-tip="Good response"
      onClick={() =>
        handleMessageFeedback({
          msgId: msgIdAndDataMap?.[msgId]?.message_id,
          reduxMsgId: msgIdAndDataMap?.[msgId]?.Id || msgIdAndDataMap?.[msgId]?.id,
          feedback: 1,
        })
      }
    >
      <ThumbsUp className="w-4 h-4" />
    </button>

    <button
      className={`btn btn-ghost btn-xs tooltip ${msgIdAndDataMap?.[msgId]?.user_feedback === 2 ? "text-error" : ""
        }`}
      data-tip="Bad response"
      onClick={() =>
        handleMessageFeedback({
          msgId: msgIdAndDataMap?.[msgId]?.message_id,
          reduxMsgId: msgIdAndDataMap?.[msgId]?.Id || msgIdAndDataMap?.[msgId]?.id,
          feedback: 2
        }
        )
      }
    >
      <ThumbsDown className="w-4 h-4" />
    </button>
  </>

  return null
}


export default React.memo(Message);
