import { ThemeContext } from "@/components/AppWrapper";
import { addDomainToHello, saveClientDetails } from "@/config/helloApi";
import { CBManger } from "@/hooks/coBrowser/CBManger";
import { EmbeddingScriptEventRegistryInstance } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setDataInDraftReducer, setVariablesForHelloBot } from "@/store/draftData/draftDataSlice";
import { setHelloClientInfo, setHelloConfig, setHelloKeysData } from "@/store/hello/helloSlice";
import { setDataInInterfaceRedux } from "@/store/interface/interfaceSlice";
import { GetSessionStorageData, SetSessionStorage } from "@/utils/ChatbotUtility";
import { cleanObject, getLocalStorage, setLocalStorage } from "@/utils/utilities";
import isPlainObject from "lodash.isplainobject";
import { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";


const helloToChatbotPropsMap: Record<string, string> = {
    // show_close_button: 'hideCloseButton',
    hideFullScreenButton: 'hideFullScreenButton'
}

const useHandleHelloEmbeddingScriptEvents = (eventHandler: EmbeddingScriptEventRegistryInstance) => {

    const dispatch = useDispatch()
    const { handleThemeChange } = useContext(ThemeContext)

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
            const clientData = {
                Name: event?.data?.data?.name || undefined,
                Email: event?.data?.data?.mail || undefined,
                Phonenumber: event?.data?.data?.number || undefined,
                ...event?.data?.data
            }
            const keysToRemove = ['name', 'mail', 'number']
            keysToRemove.map(key => {
                if (key in clientData) {
                    delete clientData[key];
                }
            });
            saveClientDetails(cleanObject(clientData)).then((data) => {
                dispatch(setHelloClientInfo({ clientInfo: { ...clientData } }));
                if (!data?.Phonenumber || !data?.Email || !data?.Name) {
                    dispatch(setHelloKeysData({ showWidgetForm: true }))
                } else {
                    dispatch(setHelloKeysData({ showWidgetForm: false }))
                }
            })
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
            variables,
            ...restProps
        } = event.data.data;

        if (sdkConfig?.customTheme) {
            handleThemeChange(sdkConfig?.customTheme)
        }

        if (variables && isPlainObject(variables)) {
            dispatch(setVariablesForHelloBot(variables))
        }

        const fullWidgetToken = unique_id ? `${widgetToken}_${unique_id}` : `${widgetToken}`;
        const prevWidgetId = GetSessionStorageData('widgetToken');
        SetSessionStorage('widgetToken', fullWidgetToken)
        const prevUser = JSON.parse(getLocalStorage('userData') || '{}');
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
            setLocalStorage('userData', '{}');
            resetKeys();
        }



        // 3. Update stored userData
        setLocalStorage('userData', JSON.stringify({ unique_id, mail, number, user_jwt_token: hasUserIdentity ? user_jwt_token : undefined, name }));

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
        Object.entries(restProps || {})?.forEach(([key, value]) => {
            const mappedKey = helloToChatbotPropsMap[key];
            if (!mappedKey) return;

            const finalValue = mappedKey === 'hideCloseButton' ? !value : value;
            dispatch(setDataInInterfaceRedux({ [mappedKey]: finalValue }));
        });

        // 8. Persist new widget token and config
        setLocalStorage('WidgetId', widgetToken);
        dispatch(setDataInDraftReducer({ chatSessionId: fullWidgetToken, widgetToken: fullWidgetToken, isHelloUser: true }));
        SetSessionStorage('helloConfig', JSON.stringify(event.data.data))
        dispatch(setHelloConfig(event.data.data));

        if (mail && number && name) {
            dispatch(setHelloKeysData({ showWidgetForm: false }));
        }
        return;
    }

    function handleChatbotVisibility(isChatbotOpen = false) {
        dispatch(setDataInAppInfoReducer({ isChatbotOpen }))
        dispatch(setDataInDraftReducer({ isChatbotMinimized: false }))
    }

    function handleSetVariablesForBot(event: MessageEvent) {
        if (event.data?.data?.variables && isPlainObject(event.data?.data?.variables)) {
            dispatch(setVariablesForHelloBot(event.data?.data?.variables))
        }
    }

    useEffect(() => {

        eventHandler.addEventHandler('parent-route-changed', handleParentRouteChanged)

        eventHandler.addEventHandler('ADD_USER_EVENT_SEGMENTO', handleAddUserEventSegmento)

        eventHandler.addEventHandler('UPDATE_USER_DATA_SEGMENTO', handleUpdateUserDataSegmento)

        eventHandler.addEventHandler('ADD_COBROWSE_SCRIPT', handleAddCoBrowseScript)

        eventHandler.addEventHandler('SET_VARIABLES_FOR_BOT', handleSetVariablesForBot)

        eventHandler.addEventHandler('helloData', handleHelloData)

        eventHandler.addEventHandler('CHATBOT_OPEN', () => handleChatbotVisibility(true))

        eventHandler.addEventHandler('CHATBOT_CLOSE', () => handleChatbotVisibility(false))

    }, [])

    return null
}

export default useHandleHelloEmbeddingScriptEvents;