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
  Stack,
  useTheme
} from "@mui/material";
import copy from "copy-to-clipboard";
import { AlertCircle, Check, CircleCheckBig, Copy, Maximize2, ThumbsDown, ThumbsUp } from "lucide-react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";
import "./Message.css";
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
  return (
    <>
      <div className="flex flex-col gap-2.5 items-end w-full mb-2.5 animate-slide-left mt-1">
        {Array.isArray(message?.urls) && message.urls.length > 0 && (
          <div className="flex flex-row-reverse flex-wrap gap-2.5 max-w-[80%] p-2.5 rounded-[10px_10px_1px_10px]">
            {message.urls.map((url: string, index: number) => (
              <Image
                key={index}
                src={url}
                alt={`Image ${index + 1}`}
                className="block max-w-[40%] h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(url, "_blank")}
                width={10} // You should replace 0 with the actual width
                height={10} // You should replace 0 with the actual height
                layout="responsive"
              />
            ))}
          </div>
        )}
        <div
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
        </div>
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
    handleFeedback = () => { },
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
                <div className="prose dark:prose-invert">
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
                            // remarkPlugins={[remarkGfm]}
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
                <>
                  <button
                    className={`btn btn-ghost btn-xs tooltip ${message?.user_feedback === 1 ? "text-success" : ""
                      }`}
                    data-tip="Good response"
                    onClick={() =>
                      handleFeedback(
                        message?.message_id,
                        1,
                        message?.user_feedback
                      )
                    }
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>

                  <button
                    className={`btn btn-ghost btn-xs tooltip ${message?.user_feedback === 2 ? "text-error" : ""
                      }`}
                    data-tip="Bad response"
                    onClick={() =>
                      handleFeedback(
                        message?.message_id,
                        2,
                        message?.user_feedback
                      )
                    }
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </>
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

    return (
      <Box className="assistant_message_card">
        <Stack
          className="assistant-message-slide"
          sx={{
            alignItems: "flex-end",
            gap: "10px",
            maxWidth: "90%",
            "@media(max-width:479px)": {
              height: "fit-content",
              columnGap: "5px",
            },
            marginBottom: "10px",
          }}
          direction="row"
        >
          <Stack
            sx={{
              alignItems: "center",
              width: "30px",
              justifyContent: "flex-end",
              "@media(max-width:479px)": { width: "30px" },
            }}
            spacing="5px"
          >
            {!isBot ? (
              <Image
                src={UserAssistant}
                width={28}
                height={28}
                alt="AI"
                style={{ color: "red" }}
              />
            ) : (
              <Image
                width={24}
                height={24}
                src="https://img.icons8.com/ios/50/message-bot.png"
                alt="message-bot"
              />
            )}
          </Stack>

          <Box
            className="assistant-message-slide"
            sx={{
              backgroundColor: theme.palette.background.default,
              padding: "2px 10px",
              boxSizing: "border-box",
              height: "fit-content",
              minWidth: "150px",
              borderRadius: "10px 10px 10px 1px",
              boxShadow: "0 2px 1px rgba(0, 0, 0, 0.1)",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              maxWidth: "100%",
              color: "black",
              whiteSpace: "pre-wrap",
            }}
          >
            <Box className="assistant-message-slide">
              <div dangerouslySetInnerHTML={{ __html: message?.content }}></div>
            </Box>
          </Box>
        </Stack>
        <Box className="flex flex-row">
          <Box
            sx={{
              alignItems: "center",
              width: "30px",
              justifyContent: "flex-end",
              "@media(max-width:479px)": { width: "30px" },
            }}
          ></Box>
        </Box>
        {message?.is_reset && <ResetHistoryLine />}
      </Box>
    );
  }
);
function Message({ message, handleFeedback, addMessage }: any) {
  const theme = useTheme();
  const backgroundColor = theme.palette.primary.main;
  const textColor = isColorLight(backgroundColor) ? "black" : "white";
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
              handleFeedback={handleFeedback}
              addMessage={addMessage}
            />
          )}
        </>
      ) : message?.role === "assistant" ? (
        <AssistantMessageCard
          message={message}
          theme={theme}
          textColor={textColor}
          handleFeedback={handleFeedback}
          addMessage={addMessage}
          sendEventToParentOnMessageClick={sendEventToParentOnMessageClick}
        />
      ) : message?.role === "Human" ? (
        <HumanOrBotMessageCard
          message={message}
          theme={theme}
          textColor={textColor}
          handleFeedback={handleFeedback}
          addMessage={addMessage}
        />
      ) : message?.role === "Bot" ? (
        <HumanOrBotMessageCard
          message={message}
          theme={theme}
          isBot={true}
          textColor={textColor}
          handleFeedback={handleFeedback}
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

export default React.memo(Message);
