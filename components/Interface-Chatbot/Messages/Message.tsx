'use client';
/* eslint-disable */
import { useColor } from "@/components/Chatbot/hooks/useColor";
import React, { useMemo } from "react";
import AssistantMessageCard from "./AssistantMessage";
import DateGroup from "./DateGroup";
import HumanOrBotMessageCard from "./HumanOrBotMessage";
import "./Message.css";
import ToolsCallMessage from "./ToolsCallMessage";
import UserMessageCard from "./UserMessage";
import VoiceCallMessage from "./VoiceCallMessage";

/**
 * A component that displays a message.
 * It includes a message card, date group, and tools call message.
 */

interface MessageProps {
  message: any;
  addMessage?: any;
  prevTime?: string | number | null;
  isLastMessage?: boolean;
}

const ROLE_USER = "user";
const ROLE_ASSISTANT = "assistant";
const ROLE_HUMAN = "Human";
const ROLE_BOT = "Bot";
const ROLE_TOOLS_CALL = "tools_call";
const ROLE_VOICE_CALL = "voice_call";

// Plan-mode user echoes look like "q1: Monday\nq2: Slack" — answers to the
// previous assistant message's questions, already shown in its historical
// Q&A card. Hoisted to module scope: a regex literal in the middle of a
// multi-line `const` expression caused Turbopack to mis-emit `<invalid>`
// in the Edge SSR bundle (parser confused `<` for JSX).
const PLAN_ANSWER_PREFIX_RE = /^\s*q\d+\s*:/i;

function Message({ message, addMessage, prevTime, isLastMessage }: MessageProps) {
  const { backgroundColor, textColor } = useColor();

  /**
   * Memoize role-based rendering to prevent unnecessary re-computations
   */
  const messageContent = useMemo(() => {
    const role = message?.role;

    // Handle combined message format (new backend format with user and llm_message in same object)
    if (message?.user || message?.llm_message) {
      const hasPlanning = Boolean(message?.planning);
      const userText = typeof message?.user === "string" ? message.user : "";
      const isPlanAnswerEcho = hasPlanning && userText !== "" && PLAN_ANSWER_PREFIX_RE.test(userText);
      const showUser = Boolean(message?.user) && !isPlanAnswerEcho;
      return (
        <>
          {showUser && (
            <UserMessageCard
              message={{
                ...message,
                content: message?.user,
                role: 'user',
                urls: message?.user_urls || [],
                image_urls: message?.user_urls || [],
              }}
              textColor={textColor}
              backgroundColor={backgroundColor}
            />
          )}
          {(message?.llm_message || message?.error || hasPlanning) && (
            <AssistantMessageCard
              message={{
                ...message,
                content: hasPlanning ? "" : (message?.chatbot_message || message?.llm_message || message?.error),
                role: 'assistant',
                urls: message?.llm_urls || [],
                image_urls: message?.llm_urls || [],
              }}
              textColor={textColor}
              backgroundColor={backgroundColor}
            />
          )}
        </>
      );
    }

    // Handle legacy message format (for backward compatibility)
    switch (role) {
      case ROLE_USER:
        return (
          <>
            <UserMessageCard
              message={message}
              textColor={textColor}
              backgroundColor={backgroundColor}
            />
            {message?.error && (
              <AssistantMessageCard
                message={message}
                isError={true}
                textColor={textColor}
                backgroundColor={backgroundColor}
              />
            )}
          </>
        );

      case ROLE_ASSISTANT:
        return (
          <AssistantMessageCard
            message={message}
            textColor={textColor}
            backgroundColor={backgroundColor}
          />
        );

      case ROLE_HUMAN:
        return <HumanOrBotMessageCard message={message} isLastMessage={isLastMessage} />;

      case ROLE_BOT:
        return <HumanOrBotMessageCard message={message} isBot={true} isLastMessage={isLastMessage} />;

      case ROLE_TOOLS_CALL:
        return <ToolsCallMessage message={message} />;

      case ROLE_VOICE_CALL:
        return <VoiceCallMessage message={message} />;

      default:
        return null;
    }
  }, [message, textColor, backgroundColor, addMessage]);

  return (
    <div className="w-full">
      {message?.time && (
        <DateGroup
          prevTime={prevTime}
          messageTime={message.time}
          key={message.time}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      )}
      {messageContent}
    </div>
  );
}

export default React.memo(Message);