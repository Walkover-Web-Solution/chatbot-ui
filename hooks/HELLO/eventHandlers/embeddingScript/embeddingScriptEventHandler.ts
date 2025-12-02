import { ThemeContext } from "@/components/AppWrapper";
import { useSendMessageToHello } from "@/components/Chatbot/hooks/useHelloIntegration";
import { addDomainToHello, saveClientDetails } from "@/config/helloApi";
import { CBManger } from "@/hooks/coBrowser/CBManger";
import { EmbeddingScriptEventRegistryInstance } from "@/hooks/CORE/eventHandlers/embeddingScript/embeddingScriptEventHandler";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";
import { setDataInDraftReducer, setVariablesForHelloBot } from "@/store/draftData/draftDataSlice";
import { setHelloClientInfo, setHelloConfig, setHelloKeysData, setWidgetInfo } from "@/store/hello/helloSlice";
import { setDataInInterfaceRedux } from "@/store/interface/interfaceSlice";
import { GetSessionStorageData, SetSessionStorage } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { emitEventToParent } from "@/utils/emitEventsToParent/emitEventsToParent";
import { cleanObject, removeFromLocalStorage, setLocalStorage } from "@/utils/utilities";
import isPlainObject from "lodash.isplainobject";
import { useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";


const helloToChatbotPropsMap: Record<string, string> = {
    // show_close_button: 'hideCloseButton',
    hideFullScreenButton: 'hideFullScreenButton'
}

const useHandleHelloEmbeddingScriptEvents = (eventHandler: EmbeddingScriptEventRegistryInstance, chatSessionId: string) => {
    const sendMessageToHello = useSendMessageToHello({});
    const dispatch = useDispatch()
    const { handleThemeChange } = useContext(ThemeContext);
    // We need to access the channel list. Let's use the custom selector to get it.
    const { channelList } = useCustomSelector((state) => ({
        channelList: state.Hello?.[chatSessionId]?.channelListData?.channels
    }));

    // Use a ref to keep track of the latest channel list without re-running the effect
    const channelListRef = useRef(channelList);
    useEffect(() => {
        channelListRef.current = channelList;
    }, [channelList]);

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

        const fullWidgetToken = unique_id ? `${widgetToken}_${unique_id}` : widgetToken;
        const prevWidgetId = GetSessionStorageData('widgetToken');

        // Save current widget token
        SetSessionStorage('widgetToken', fullWidgetToken);

        const hasUserIdentity = Boolean(unique_id || mail || number);
        removeFromLocalStorage('is_anon');
        // if (hasUserIdentity) {
        //     setLocalStorage('is_anon', 'false');
        // }

        // Apply theme if present
        if (sdkConfig?.customTheme) {
            handleThemeChange(sdkConfig.customTheme);
        }

        // Store variables in redux
        if (variables && isPlainObject(variables)) {
            dispatch(setVariablesForHelloBot(variables));
        }

        // Reset redux keys
        const resetKeys = () => {
            dispatch(setDataInAppInfoReducer({ subThreadId: '', currentChannelId: '', currentChatId: '', currentTeamId: '' }));
        };

        // Reset if widget token changed
        if (fullWidgetToken !== prevWidgetId) {
            resetKeys();
        }

        // Store userData in localStorage
        setLocalStorage('userData', JSON.stringify({
            unique_id,
            mail,
            number,
            user_jwt_token: hasUserIdentity ? user_jwt_token : undefined,
            name,
        }));

        // Map extra interface props
        Object.entries(restProps || {}).forEach(([key, value]) => {
            const mappedKey = helloToChatbotPropsMap[key];
            if (!mappedKey) return;

            const finalValue = mappedKey === 'hideCloseButton' ? !value : value;
            dispatch(setDataInInterfaceRedux({ [mappedKey]: finalValue }));
        });

        // Persist widget token and redux draft data
        setLocalStorage('WidgetId', widgetToken);
        dispatch(setDataInDraftReducer({
            chatSessionId: fullWidgetToken,
            widgetToken: fullWidgetToken,
            isHelloUser: true,
        }));

        SetSessionStorage('helloConfig', JSON.stringify(event.data.data));
        dispatch(setHelloConfig(event.data.data));

        // Hide form if user data available
        if (mail && number && name) {
            dispatch(setHelloKeysData({ showWidgetForm: false }));
        }
    };

    function handleChatbotVisibility(isChatbotOpen = false, id = "") {
        dispatch(setDataInAppInfoReducer({ isChatbotOpen }))
        dispatch(setDataInDraftReducer({ isChatbotMinimized: false }))
        if (id) {
            dispatch(setDataInAppInfoReducer({
                subThreadId: id,
                currentChannelId: id
            }));
        }
    }

    function handleSetVariablesForBot(event: MessageEvent) {
        if (event.data?.data?.variables && isPlainObject(event.data?.data?.variables)) {
            dispatch(setVariablesForHelloBot(event.data?.data?.variables))
        }
    }

    function handleStarterQuestionOptionClicked(event: MessageEvent) {
        const optionText = event?.data?.data?.option;
        if (optionText) {
            sendMessageToHello(optionText);
        }
    }

    function handleHelloRuntimeData(event: MessageEvent) {
        const { data } = event?.data;

        if (data.themeColor) {
            handleThemeChange(data.themeColor);
        }
        if (data.tagline) {
            dispatch(setWidgetInfo({ tagline: data.tagline }))
        }
        if ('show_widget_form' in data) {
            dispatch(setWidgetInfo({ show_widget_form: data.show_widget_form ?? true }))
        }
        if ('variables' in data) {
            dispatch(setVariablesForHelloBot(data.variables))
        }
    }

    function handleShowTicket(event: MessageEvent) {
        const ticketId = event?.data?.data?.id;
        let subThreadIdToDispatch: string = "";
        let currentChannelIdToDispatch: string = "";
        let currentChatIdToDispatch: number | string = "";

        if (ticketId) {
            const foundChannel = channelListRef.current?.find((channel: any) => channel.channel === ticketId);
            if (foundChannel) {
                subThreadIdToDispatch = foundChannel.channel;
                currentChannelIdToDispatch = foundChannel.channel;
                currentChatIdToDispatch = foundChannel?.id;
            }
        }

        dispatch(setDataInAppInfoReducer({
            subThreadId: subThreadIdToDispatch,
            currentChannelId: currentChannelIdToDispatch,
            currentChatId: currentChatIdToDispatch,
            overrideChannelId: ticketId,
        }));
    }

    function handleGetTicketUnreadCount(event: MessageEvent) {
        const { id } = event?.data?.data || {};
        if (id && channelListRef.current) {
            if (id === '*') {
                const totalUnreadCount = channelListRef.current?.reduce((acc, channel) => acc + (channel.widget_unread_count || 0), 0);
                emitEventToParent('TICKET_UNREAD_COUNT', { id, count: totalUnreadCount });
                return;
            }
            const channel = channelListRef.current.find((c: any) => c.channel === id);
            const count = channel ? (channel.widget_unread_count || 0) : 0;
            emitEventToParent('TICKET_UNREAD_COUNT', { id, count });
        }
    }

    useEffect(() => {

        eventHandler.addEventHandler('parent-route-changed', handleParentRouteChanged)

        eventHandler.addEventHandler('ADD_USER_EVENT_SEGMENTO', handleAddUserEventSegmento)

        eventHandler.addEventHandler('UPDATE_USER_DATA_SEGMENTO', handleUpdateUserDataSegmento)

        eventHandler.addEventHandler('ADD_COBROWSE_SCRIPT', handleAddCoBrowseScript)

        eventHandler.addEventHandler('SET_VARIABLES_FOR_BOT', handleSetVariablesForBot)

        eventHandler.addEventHandler('helloData', handleHelloData)

        eventHandler.addEventHandler('helloRunTimeData', handleHelloRuntimeData)

        eventHandler.addEventHandler('CHATBOT_OPEN', (event: MessageEvent) => { console.log(event, 'event'), handleChatbotVisibility(true, event?.data?.data?.id) })

        eventHandler.addEventHandler('CHATBOT_CLOSE', () => handleChatbotVisibility(false))

        eventHandler.addEventHandler('STARTER_QUESTION_OPTION_CLICKED', handleStarterQuestionOptionClicked)

        eventHandler.addEventHandler('SHOW_TICKET', handleShowTicket)

        eventHandler.addEventHandler('GET_TICKET_UNREAD_COUNT', handleGetTicketUnreadCount)

    }, [])

    return null
}

export default useHandleHelloEmbeddingScriptEvents;