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
  onReply?: (message: any) => void;
}

const ROLE_USER = "user";
const ROLE_ASSISTANT = "assistant";
const ROLE_HUMAN = "Human";
const ROLE_BOT = "Bot";
const ROLE_TOOLS_CALL = "tools_call";
const ROLE_VOICE_CALL = "voice_call";

function Message({ message, addMessage, prevTime, isLastMessage, onReply }: MessageProps) {
  const { backgroundColor, textColor } = useColor();

  /**
   * Memoize role-based rendering to prevent unnecessary re-computations
   */
  const messageContent = useMemo(() => {
    const role = message?.role;

    switch (role) {
      case ROLE_USER:
        return (
          <>
            <UserMessageCard
              message={message}
              textColor={textColor}
              backgroundColor={backgroundColor}
              onReply={onReply}
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
        return <HumanOrBotMessageCard message={message} isLastMessage={isLastMessage} onReply={onReply} />;

      case ROLE_BOT:
        return <HumanOrBotMessageCard message={message} isBot={true} isLastMessage={isLastMessage} onReply={onReply} />;

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