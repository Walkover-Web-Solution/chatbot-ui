import Image from "next/image";
import { useDispatch } from "react-redux";

// App imports
import { AiIcon, UserAssistant } from "@/assests/assestsIndex";
import { setHuman } from "@/store/hello/helloSlice";
import type { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useContext } from "react";
import { MessageContext } from "./InterfaceChatbot";
import { ChatActionTypes } from "../Chatbot/hooks/chatTypes";

function ChatbotHeaderTab() {
  const { chatDispatch } = useContext(MessageContext);
  const dispatch = useDispatch();
  const { isHuman, mode } = useCustomSelector((state: $ReduxCoreType) => ({
    isHuman: state.Hello?.isHuman || false,
    mode: state.Hello?.mode || [],
  }));

  // Early return if feature not enabled
  if (!mode?.includes("human")) {
    return null;
  }

  const handleTabClick = (isHumanTab: boolean) => {
    dispatch(setHuman({ isHuman: isHumanTab }));
    chatDispatch({ type: ChatActionTypes.SET_OPTIONS, payload: [] })
  };

  const TabButton = ({ type, icon, label }: { type: 'AI' | 'Human', icon: any, label: string }) => {
    const isActive = type === 'Human' ? isHuman : !isHuman;

    return (
      <button
        className={`tab tab-sm gap-2 transition-all duration-300 ${isActive
          ? `tab-active ${type === 'Human' ? 'bg-secondary text-secondary-content' : 'text-primary-content'}`
          : 'hover:bg-base-300'
          }`}
        onClick={() => handleTabClick(type === 'Human')}
      >
        {isActive ? (
          <span className="font-medium">{label}</span>
        ) : (
          <>
            <div className="relative">
              <Image
                src={icon}
                width={20}
                height={20}
                alt={`${type} Icon`}
              />
            </div>
            <span className="font-medium">{label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg mx-auto max-w-xs shadow-md">
      <TabButton
        type="AI"
        icon={AiIcon}
        label="AI Assistant"
      />
      <TabButton
        type="Human"
        icon={UserAssistant}
        label="Human Support"
      />
    </div>
  );
}

export default ChatbotHeaderTab;