/* eslint-disable */
import { AiIcon } from "@/assests/assestsIndex";
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
import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";
import "./Message.css";
const remarkGfm = dynamic(() => import('remark-gfm'), { ssr: false });

function FeedBackButtons({ msgId }: { msgId: string }) {
    const handleMessageFeedback = useMessageFeedback();
    const { msgIdAndDataMap } = useCustomSelector((state) => ({
        msgIdAndDataMap: state.Chat.msgIdAndDataMap?.[state.Chat?.subThreadId] || {},
    }))
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

        return (
            <div className="flex flex-col">
                <div className="flex items-end sm:max-w-[90%] max-w-[98%] animate-slide-left">
                    <div className="flex flex-col items-center justify-end w-8 pb-2">
                        <div className="sm:w-8 sm:h-8 w-7 h-7 rounded-full p-1 flex items-center justify-center">
                            <Image
                                src={AiIcon}
                                width="33"
                                height="33"
                                alt="AI"
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
                        <div className="min-w-[150px] w-full rounded-lg p-3">
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
            </div>
        );
    }
);

export default AssistantMessageCard