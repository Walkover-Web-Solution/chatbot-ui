import { setBridgeName, setBridgeVersionId, setData, setHeaderButtons, setHelloId, setSubThreadId, setThreadId, setToggleDrawer } from '@/store/chat/chatSlice';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useScreenSize } from './useScreenSize';

export const useReduxEffects = ({ tabSessionId, chatSessionId }: { tabSessionId: string, chatSessionId: string }) => {
    const dispatch = useDispatch();
    const { isSmallScreen } = useScreenSize();

    // Get Redux state
    const {
        reduxThreadId,
        reduxSubThreadId,
        reduxBridgeName,
        reduxHelloId,
        reduxBridgeVersionId,
        reduxHeaderButtons,
        isHelloUser
    } = useCustomSelector((state) => ({
        reduxThreadId: state.appInfo?.[tabSessionId]?.threadId || "",
        reduxSubThreadId: state.appInfo?.[tabSessionId]?.subThreadId || "",
        reduxHeaderButtons: state.Interface?.[chatSessionId]?.headerButtons || [],
        reduxBridgeName: state.appInfo?.[tabSessionId]?.bridgeName || "root",
        reduxHelloId: state.appInfo?.[tabSessionId]?.helloId || null,
        reduxBridgeVersionId: state.appInfo?.[tabSessionId]?.versionId || null,
        isHelloUser: state.draftData?.isHelloUser || false,
    }));
    // Sync Redux threadId with local state
    useEffect(() => {
        dispatch(setThreadId(reduxThreadId));
    }, [reduxThreadId, dispatch]);

    // Sync Redux subThreadId with local state
    useEffect(() => {
        dispatch(setSubThreadId(reduxSubThreadId));
    }, [reduxSubThreadId, dispatch]);

    // Sync Redux bridgeName with local state
    useEffect(() => {
        dispatch(setBridgeName(reduxBridgeName));
    }, [reduxBridgeName, dispatch]);

    // Sync Redux headerButtons with local state
    useEffect(() => {
        if (reduxHeaderButtons?.length > 0) {
            dispatch(setHeaderButtons(reduxHeaderButtons));
        }
    }, [reduxHeaderButtons, dispatch]);

    // Sync Redux helloId with local state
    useEffect(() => {
        dispatch(setHelloId(reduxHelloId));
    }, [reduxHelloId, dispatch]);

    // Sync Redux bridgeVersionId with local state
    useEffect(() => {
        dispatch(setBridgeVersionId(reduxBridgeVersionId));
    }, [reduxBridgeVersionId, dispatch]);

    // Sync isHelloUser with local state
    useEffect(() => {
        dispatch(setData({ isHelloUser }))
    }, [isHelloUser, dispatch]);

    // Sync large screen toggle with local state
    useEffect(() => {
        dispatch(setToggleDrawer(!isSmallScreen));
    }, [isSmallScreen, dispatch]);

    return null;
}