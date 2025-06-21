import { ThemeContext } from "@/components/AppWrapper";
import { addDomainToHello, saveClientDetails } from "@/config/helloApi";
import { CBManger } from "@/hooks/coBrowser/CBManger";
import { EmbeddingScriptEventRegistryInstance } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setHelloConfig } from "@/store/hello/helloSlice";
import { setDataInInterfaceRedux } from "@/store/interface/interfaceSlice";
import { setDataInTabInfo } from "@/store/tabInfo/tabInfoSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { GetSessionStorageData, SetSessionStorage } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { cleanObject, getLocalStorage, setLocalStorage } from "@/utils/utilities";
import isPlainObject from "lodash.isplainobject";
import { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";


const helloToChatbotPropsMap: Record<string, string> = {
    // show_close_button: 'hideCloseButton',
    hideFullScreenButton: 'hideFullScreenButton'
}

const useHandleHelloEmbeddingScriptEvents = (eventHandler: EmbeddingScriptEventRegistryInstance) => {

    const dispatch = useDispatch();
    const chatSessionId = eventHandler.getChatSessionId();
    console.log(chatSessionId, 'chatSesstionId')
    const { handleThemeChange } = useContext(ThemeContext);
    const { clientInfo: existingClientInfo } = useCustomSelector((state: $ReduxCoreType) => ({
        clientInfo: state?.Hello?.[chatSessionId]?.clientInfo || {}
    }))

    const handleParentRouteChanged = (event: MessageEvent) => {
        if (event?.data?.data?.websiteUrl) {
            addDomainToHello({ domain: event?.data?.data?.websiteUrl });
        }
    }

    const handleAddUserEventSegmento = (event: MessageEvent) => {
        if (event?.data?.data && isPlainObject(event?.data?.data)) {
            addDomainToHello({ userEvent: event?.data?.data })
        }
    }

    const handleUpdateUserDataSegmento = (event: MessageEvent) => {
        if (event?.data?.data && isPlainObject(event?.data?.data)) {
            saveClientDetails(event?.data?.data)
        }
    }

    const handleAddCoBrowseScript = (event: MessageEvent) => {
        CBManger.injectScript(event?.data?.data?.origin)
    }

    const handleHelloData = (event: MessageEvent) => {
        const {
            widgetToken,
            unique_id,
            mail,
            number,
            user_jwt_token,
            name,
            sdkConfig,
            hide_launcher,
            show_widget_form,
            show_close_button,
            launch_widget,
            show_send_button,
            ...restProps
        } = event.data.data;

        if (sdkConfig?.customTheme) {
            handleThemeChange(sdkConfig?.customTheme)
        }

        const fullWidgetToken = unique_id ? `${widgetToken}_${unique_id}` : `${widgetToken}`;
        const prevWidgetId = GetSessionStorageData('widgetToken');
        const prevUser = JSON.parse(getLocalStorage('userData') || '{}');
        SetSessionStorage('widgetToken', fullWidgetToken)
        const hasUserIdentity = Boolean(unique_id || mail || number);

        // Helper: reset Redux keys and sub-thread
        const resetKeys = () => {
            dispatch(setDataInAppInfoReducer({ subThreadId: '', currentChannelId: '', currentChatId: '', currentTeamId: '' }));
        };

        // 1. Widget token changed
        if (unique_id ? `${widgetToken}_${unique_id}` !== prevWidgetId : widgetToken !== prevWidgetId) {
            resetKeys();
        }

        // 2. User identity changed
        if (unique_id !== prevUser.unique_id) {
            resetKeys();
        }

        // 4. Anonymous cleanup when no identity
        if (!hasUserIdentity && getLocalStorage('k_clientId')) {
            resetKeys();
            setLocalStorage('k_clientId', '');
        }

        // 5. Determine anonymity status
        const isAnon = hasUserIdentity ? 'false' : getLocalStorage('is_anon') === 'false' ? 'false' : 'true';

        if (getLocalStorage('is_anon') != isAnon) {
            resetKeys();
        }

        setLocalStorage('is_anon', isAnon);

        // 7. Map additional interface props
        Object.entries(restProps).forEach(([key, value]) => {
            const mappedKey = helloToChatbotPropsMap[key];
            if (!mappedKey) return;

            const finalValue = mappedKey === 'hideCloseButton' ? !value : value;
            dispatch(setDataInInterfaceRedux({ [mappedKey]: finalValue }));
        });

        // 8. Persist new widget token and config
        setLocalStorage('WidgetId', widgetToken);
        dispatch(setHelloConfig(event.data.data));
        SetSessionStorage('helloConfig', JSON.stringify(event.data.data))
        dispatch(setDataInTabInfo({ widgetToken: fullWidgetToken }));

        // 9. Update stored userData
        const finalClientInfo = { ...{ mail, number, name, country_code: existingClientInfo?.countryCode || '+91' }, ...(cleanObject(existingClientInfo || {})), ...(restProps || {}) }
        setLocalStorage('clientData', JSON.stringify(finalClientInfo));
        setLocalStorage('userData', JSON.stringify({ unique_id, mail: finalClientInfo?.mail, number: finalClientInfo?.number, user_jwt_token: hasUserIdentity ? user_jwt_token : undefined, name }));

        return;
    }

    function handleChatbotVisibility(isChatbotOpen = false) {
        dispatch(setDataInAppInfoReducer({ isChatbotOpen }))
    }

    useEffect(() => {

        eventHandler.addEventHandler('parent-route-changed', handleParentRouteChanged)

        eventHandler.addEventHandler('ADD_USER_EVENT_SEGMENTO', handleAddUserEventSegmento)

        eventHandler.addEventHandler('UPDATE_USER_DATA_SEGMENTO', handleUpdateUserDataSegmento)

        eventHandler.addEventHandler('ADD_COBROWSE_SCRIPT', handleAddCoBrowseScript)

        eventHandler.addEventHandler('helloData', handleHelloData)

        eventHandler.addEventHandler('CHATBOT_OPEN', () => handleChatbotVisibility(true))

        eventHandler.addEventHandler('CHATBOT_CLOSE', () => handleChatbotVisibility(false))

    }, [])

    return null
}

export default useHandleHelloEmbeddingScriptEvents;