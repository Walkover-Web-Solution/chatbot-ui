// React and Redux imports
import React, { useState } from "react";
import { useDispatch } from "react-redux";

// App imports
import { AiIcon, UserAssistant } from "@/assests/assestsIndex";
import { setHuman } from "@/store/hello/helloSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import Image from "next/image";

function ChatbotHeaderTab() {
  const dispatch = useDispatch();
  const { IsHuman, mode } = useCustomSelector((state: $ReduxCoreType) => ({
    IsHuman: state.Hello?.isHuman || false,
    mode: state.Hello?.mode || [],
  }));

  const isHelloAssistantEnabled = mode?.length > 0 && mode?.includes("human");
  const [value, setValue] = useState(IsHuman ? "Human" : "AI"); // Set default tab based on IsHuman

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === "Human") dispatch(setHuman({}));
    else dispatch(setHuman({ isHuman: false }));
    setValue(newValue);
  };

  if (!isHelloAssistantEnabled) {
    return null;
  }
  return (
    <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg mx-auto max-w-xs shadow-md">
      <button
        className={`tab tab-sm gap-2 transition-all duration-300 ${value === "AI" ? "tab-active text-primary-content" : "hover:bg-base-300"}`}
        onClick={(e) => handleChange(e, "AI")}
      >
        {value === "AI" && <span className="font-medium">AI Assistant</span>}
        {value !== "AI" && (
          <>
            <div className="relative">
              <Image
                src={AiIcon}
                width={20}
                height={20}
                alt="AI Icon"
              />
            </div>
            <span className="font-medium">AI Assistant</span>
          </>
        )}
      </button>

      <button
        className={`tab tab-sm gap-2 transition-all duration-300 ${value === "Human" ? "tab-active bg-secondary text-secondary-content" : "hover:bg-base-300"}`}
        onClick={(e) => handleChange(e, "Human")}
      >
        {value === "Human" && <span className="font-medium">Human Support</span>}
        {value !== "Human" && (
          <>
            <div className="relative">
              <Image
                src={UserAssistant}
                width={20}
                height={20}
                alt="Human Icon"
              />
            </div>
            <span className="font-medium">Human Support</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ChatbotHeaderTab;
