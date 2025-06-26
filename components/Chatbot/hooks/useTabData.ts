import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";

interface useTabDataProps {
    tabSessionId: string;
}
const useTabData = ({ tabSessionId }: useTabDataProps) => {
    const { threadId, bridgeName, subThreadId, userId, config, currentChannelId, currentChatId, currentTeamId } = useCustomSelector((state) => ({
        threadId: state.appInfo?.[tabSessionId]?.threadId || '',
        bridgeName: state.appInfo?.[tabSessionId]?.bridgeName || '',
        subThreadId: state.appInfo?.[tabSessionId]?.subThreadId || '',
        userId: state.appInfo?.[tabSessionId]?.userId || '',
        config: state.appInfo?.[tabSessionId]?.config || {},
        currentChannelId: state.appInfo?.[tabSessionId]?.currentChannelId || '',
        currentChatId: state.appInfo?.[tabSessionId]?.currentChatId || '',
        currentTeamId: state.appInfo?.[tabSessionId]?.currentTeamId || '',
    }));

    return {
        threadId,
        bridgeName,
        subThreadId,
        userId,
        config,
        currentChannelId,
        currentChatId,
        currentTeamId
    }
};

export default useTabData;