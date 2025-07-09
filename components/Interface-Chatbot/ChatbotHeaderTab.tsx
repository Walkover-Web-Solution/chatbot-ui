import Image from "next/image";
import { useDispatch } from "react-redux";

// App imports
import { AiIcon, UserAssistant } from "@/assests/assestsIndex";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setOptions } from "@/store/chat/chatSlice";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import React from "react";

function ChatbotHeaderTab({ chatSessionId }: { chatSessionId: string }) {
  const dispatch = useDispatch();
  const { isHelloUser, mode } = useCustomSelector((state) => ({
    isHelloUser: state.draftData?.isHelloUser || false,
    mode: state.Hello?.[chatSessionId]?.mode || [],
  }));

  // Early return if feature not enabled
  if (!mode?.includes("human")) {
    return null;
  }

  const handleTabClick = (isHumanTab: boolean) => {
    dispatch(setOptions([]));
  };

  const TabButton = ({ type, icon, label }: { type: 'AI' | 'Human', icon: any, label: string }) => {
    const isActive = type === 'Human' ? isHelloUser : !isHelloUser;

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

export default React.memo(addUrlDataHoc(ChatbotHeaderTab));