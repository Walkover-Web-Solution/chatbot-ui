/* eslint-disable */
import { useMessageFeedback } from "@/components/Chatbot/hooks/useChatActions";
import InterfaceGrid from "@/components/Grid/Grid";
import { Anchor, Code } from "@/components/Interface-Chatbot/Interface-Markdown/MarkdownUtitily";
import { supportsLookbehind } from "@/utils/appUtility";
import { isJSONString } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import {
    Box,
    lighten
} from "@mui/material";
import copy from "copy-to-clipboard";
import { AlertCircle, Check, CircleCheckBig, Copy, Maximize2, ThumbsDown, ThumbsUp } from "lucide-react";
import dynamic from 'next/dynamic';
import React from "react";
import ReactMarkdown from "react-markdown";
import ImageWithFallback from "./ImageWithFallback";
import "./Message.css";
const remarkGfm = dynamic(() => import('remark-gfm'), { ssr: false });

function FeedBackButtons({ msgId }: { msgId: string }) {
    const handleMessageFeedback = useMessageFeedback();
    const { msgIdAndDataMap } = useCustomSelector((state) => ({
        msgIdAndDataMap: state.Chat.msgIdAndDataMap?.[state.Chat?.subThreadId] || {},
    }))

    // Function to clean message_id by removing _user or _llm suffix
    const cleanMessageId = (messageId: string) => {
        if (messageId?.endsWith('_user') || messageId?.endsWith('_llm')) {
            return messageId.replace(/(_user|_llm)$/, '');
        }
        return messageId;
    };

    return <>
        <button
            className={`btn btn-ghost btn-xs tooltip tooltip-bottom ${msgIdAndDataMap?.[msgId]?.user_feedback === 1 ? "text-success" : ""
                }`}
            data-tip="Good response"
            onClick={() =>
                handleMessageFeedback({
                    msgId: cleanMessageId(msgIdAndDataMap?.[msgId]?.message_id),
                    reduxMsgId: msgIdAndDataMap?.[msgId]?.Id || msgIdAndDataMap?.[msgId]?.id,
                    feedback: 1,
                })
            }
        >
            <ThumbsUp className="w-4 h-4" />
        </button>

        <button
            className={`btn btn-ghost btn-xs tooltip tooltip-bottom ${msgIdAndDataMap?.[msgId]?.user_feedback === 2 ? "text-error" : ""
                }`}
            data-tip="Bad response"
            onClick={() =>
                handleMessageFeedback({
                    msgId: cleanMessageId(msgIdAndDataMap?.[msgId]?.message_id),
                    reduxMsgId: msgIdAndDataMap?.[msgId]?.Id || msgIdAndDataMap?.[msgId]?.id,
                    feedback: 2
                }
                )
            }
        >
            <ThumbsDown className="w-4 h-4" />
        </button>
    </>
}

const AssistantMessageCard = React.memo(
    ({
        message,
        backgroundColor,
        isError = false,
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
            "--primary-main": lighten(backgroundColor, 0.4),
        };

        const toolsData = Object.keys(message?.tools_data || {});

        return (
            <div className="flex w-full pb-1">
                {/* <div className="flex flex-col items-center w-8 pb-2">
                    <div className="sm:w-8 sm:h-8 w-7 h-7 rounded-full px-1">
                        <Image
                            src={AiIcon}
                            width="33"
                            height="33"
                            alt="AI"
                        />
                    </div>
                </div> */}
                <div className="flex flex-col max-w-[90%] animate-slide-left w-full ">
                    <div className="p-2.5">

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
                            <div className="min-w-[150px] w-full rounded-lg">
                                {message?.timeOut ? (
                                    <div className="flex items-center gap-2 text-error">
                                        <AlertCircle className="w-4 h-4" />
                                        <p>Timeout reached. Please try again later.</p>
                                    </div>
                                ) : message.image_urls?.length > 0 ? (
                                    message?.image_urls?.map((image: any) => (
                                        <div className="space-y-2" key={image}>
                                            <ImageWithFallback
                                                src={image?.image_url || image?.permanent_url}
                                                permanentUrl={image?.permanent_url}
                                                alt="Loading image, please wait..."
                                                width={400}
                                                height={400}
                                                loading="lazy"
                                                className="w-full max-h-[400px] min-h-[100px] rounded-lg object-cover"
                                            />
                                            <a
                                                href={image?.image_url || image?.permanent_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost btn-sm w-full text-primary flex items-center justify-center"
                                            >
                                                <Maximize2 className="w-4 h-4 mr-2" />
                                                View Full Image
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="prose dark:prose-invert break-words">
                                        {toolsData?.length > 0 &&
                                            (
                                                <Box className="flex items-center gap-2 mb-2">
                                                    <CircleCheckBig color="green" size={18} className="font-bold" strokeWidth={3} />
                                                    <p className="text-green-800 font-semibold">
                                                        {toolsData?.length}  {toolsData?.length === 1 ? "Function" : "Functions"} executed
                                                    </p>
                                                </Box>
                                            )
                                        }
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


                    <div className="flex items-center gap-2">
                        {!message?.wait && !message?.timeOut && !message?.error && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                {(() => {
                                    const parsedContent = isJSONString(message?.content)? JSON.parse(message?.content): null
                                    const shouldHideCopyButton = (message.chatbot_message || (parsedContent && Object.prototype.hasOwnProperty.call(parsedContent, 'components') && Object.prototype.hasOwnProperty.call(parsedContent, 'variables')));
                                    return !shouldHideCopyButton && (
                                        <button
                                            className="btn btn-ghost btn-xs tooltip tooltip-right"
                                            data-tip={isCopied ? "Copied!" : "Copy"}
                                            onClick={handleCopy}
                                        >
                                            {isCopied ? (
                                                <Check className="w-4 h-4 text-success" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    );
                                })()}
                                {message?.message_id && (
                                    <FeedBackButtons msgId={message?.Id || message?.id} />
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        );
    }
);

export default AssistantMessageCard