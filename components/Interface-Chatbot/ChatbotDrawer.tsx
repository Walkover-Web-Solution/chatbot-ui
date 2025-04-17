'use client';

import { createNewThreadApi } from "@/config/api";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setThreadId, setThreads } from "@/store/interface/interfaceSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { ParamsEnums } from "@/utils/enums";
import { useMediaQuery } from "@mui/material";
import { AlignLeft, SquarePen } from "lucide-react";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { MessageContext } from "./InterfaceChatbot";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { ChatbotContext } from "../context";


const createRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

interface ChatbotDrawerProps {
  setLoading: (loading: boolean) => void;
  chatbotId: string;
  isToggledrawer: boolean;
  setToggleDrawer: (isOpen: boolean) => void;
}

const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({ setLoading, chatbotId, setToggleDrawer, isToggledrawer, preview = false }) => {
  const dispatch = useDispatch();
  const isSmallScreen = useMediaQuery('(max-width:1023px)');
  const { setOptions } = useContext(MessageContext);

  const { reduxThreadId, subThreadList, reduxSubThreadId, reduxBridgeName } =
    useCustomSelector((state: $ReduxCoreType) => ({
      reduxThreadId: GetSessionStorageData("threadId") || state.appInfo?.threadId || "",
      reduxSubThreadId: state.appInfo?.subThreadId || "",
      reduxBridgeName:
        GetSessionStorageData("bridgeName") ||
        state.appInfo?.bridgeName ||
        "root",
      subThreadList:
        state.Interface?.interfaceContext?.[chatbotId]?.[
          GetSessionStorageData("bridgeName") ||
          state.appInfo?.bridgeName ||
          "root"
        ]?.threadList?.[
        GetSessionStorageData("threadId") || state.appInfo?.threadId
        ] || [],
    }));
    const { isHelloUser } = useContext(ChatbotContext);

  const selectedSubThreadId = reduxSubThreadId;

  const handleCreateNewSubThread = async () => {
    if (preview) return;
    const result = await createNewThreadApi({
      threadId: reduxThreadId,
      subThreadId: createRandomId(),
    });
    if (result?.success) {
      dispatch(
        setThreads({
          newThreadData: result?.thread,
          bridgeName: GetSessionStorageData("bridgeName") || reduxBridgeName,
          threadId: reduxThreadId,
        })
      );
      setOptions([]);
    }
  };

  const handleChangeSubThread = (sub_thread_id: string) => {
    setLoading(false);
    dispatch(setThreadId({ subThreadId: sub_thread_id }));
    dispatch(setDataInAppInfoReducer({subThreadId: sub_thread_id}))
    setOptions([]);
    if (isSmallScreen) {
      setToggleDrawer(false);
    }
  };

  const DrawerList = (
    <div className="menu p-0 w-full h-full bg-base-200 text-base-content">
      {(subThreadList || []).length === 0 ? (
        <div className="flex justify-center items-center mt-5">
          <span>No Conversations</span>
        </div>
      ) : (
        <ul>
          {subThreadList.map((thread: any, index: number) => (
            <li key={`${thread?._id}-${index}`}>
              <a
                className={`${thread?.sub_thread_id === selectedSubThreadId ? 'active' : ''}`}
                onClick={() => handleChangeSubThread(thread?.sub_thread_id)}
              >
                {thread?.display_name || thread?.sub_thread_id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="drawer z-[10]">
      <input
        id="chatbot-drawer"
        type="checkbox"
        className="drawer-toggle lg:hidden"
        checked={isToggledrawer}
        onChange={(e) => setToggleDrawer(e.target.checked)}
      />

      {/* Backdrop overlay for mobile */}
      {isToggledrawer && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setToggleDrawer(false)}
        />
      )}

      <div className={`drawer-side max-w-[265px] ${isToggledrawer ? 'lg:translate-x-0' : 'lg:-translate-x-full'} transition-transform duration-100`}>
        <div className="p-4 w-full min-h-full text-base-content relative bg-base-200 border-r-base-300 border overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            {isToggledrawer && <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" onClick={() => { setToggleDrawer(!isToggledrawer) }}> <AlignLeft size={22} color="#555555" /></button>}
            <h2 className="text-lg font-bold">History</h2>
            <div className="flex items-center gap-2">
              {isToggledrawer && !isHelloUser && (
                <div className="tooltip tooltip-bottom z-[9999]" data-tip="New Chat">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={handleCreateNewSubThread}
                  >
                    <SquarePen size={22} color="#555555" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {DrawerList}
        </div>
      </div>
    </div>
  );
};

export default React.memo(
  addUrlDataHoc(React.memo(ChatbotDrawer), [ParamsEnums.chatbotId])
);
