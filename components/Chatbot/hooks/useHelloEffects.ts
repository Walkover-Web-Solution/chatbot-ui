import { ThemeContext } from '@/components/AppWrapper';
import { deleteReadReceipt, getAgentTeamApi, getCallToken, getClientToken, getGreetingQuestions, getJwtToken, initializeHelloChat, registerAnonymousUser, saveClientDetails } from '@/config/helloApi';
import useNotificationSocket from '@/hooks/notifications/notificationSocket';
import useNotificationSocketEventHandler from '@/hooks/notifications/notificationSocketEventHandler';
import useSocket from '@/hooks/socket';
import useSocketEvents from '@/hooks/socketEventHandler';
import { setDataInAppInfoReducer } from '@/store/appInfo/appInfoSlice';
import { setAgentTeams, setGreeting, setHelloClientInfo, setHelloKeysData, setJwtToken, setWidgetInfo } from '@/store/hello/helloSlice';
import { GetSessionStorageData, SetSessionStorage } from '@/utils/ChatbotUtility';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import { emitEventToParent } from '@/utils/emitEventsToParent/emitEventsToParent';
import { cleanObject, getLocalStorage } from '@/utils/utilities';
import debounce from 'lodash.debounce';
import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import helloVoiceService from './HelloVoiceService';
import { useChatActions } from './useChatActions';
import { useFetchChannels, useFetchHelloPreviousHistory } from './useHelloIntegration';
import { useReduxStateManagement } from './useReduxManagement';
import { useScreenSize } from './useScreenSize';
import { useTabVisibility } from './useTabVisibility';

interface HelloMessage {
    role: string;
    message_id?: string;
    from_name?: string;
    content: string;
    id?: string;
    chat_id?: string;
    urls?: string[];
    channel?: string;
}

interface UseHelloIntegrationProps {
    messageRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
    chatSessionId: string;
    tabSessionId: string;
}

export const useHelloEffects = ({ chatSessionId, messageRef, tabSessionId }: UseHelloIntegrationProps) => {
    const { handleThemeChange } = useContext(ThemeContext);
    const { setLoading } = useChatActions();
    const fetchHelloPreviousHistory = useFetchHelloPreviousHistory();
    const fetchChannels = useFetchChannels();
    const { isSmallScreen } = useScreenSize();
    const { isTabVisible } = useTabVisibility();

    const { currentChannelId, isHelloUser } = useReduxStateManagement({ chatSessionId, tabSessionId });

    const { companyId, botId, reduxChatSessionId, totalNoOfUnreadMsgs, isToggledrawer, isChatbotOpen, isChatbotMinimized, unReadCountInCurrentChannel } = useCustomSelector((state) => ({
        companyId: state.Hello?.[chatSessionId]?.widgetInfo?.company_id || '',
        botId: state.Hello?.[chatSessionId]?.widgetInfo?.bot_id || '',
        reduxChatSessionId: state.draftData?.chatSessionId,
        totalNoOfUnreadMsgs: (() => {
            const channelListData = state.Hello?.[chatSessionId]?.channelListData;
            const unreadCount = channelListData?.channels?.reduce((acc, channel) => {
                return acc + channel?.widget_unread_count;
            }, 0);
            return unreadCount;
        })(),
        isToggledrawer: state.Chat?.isToggledrawer,
        isChatbotOpen: state.appInfo?.[tabSessionId]?.isChatbotOpen,
        isChatbotMinimized: state.draftData?.isChatbotMinimized,
        unReadCountInCurrentChannel: (() => {
            const channelListData = state.Hello?.[chatSessionId]?.channelListData;
            return channelListData?.channels?.find((channel) => channel?.channel === currentChannelId)?.widget_unread_count || 0;
        })()
    }));

    const dispatch = useDispatch();

    useSocket({ chatSessionId });
    useNotificationSocket({ chatSessionId });

    useEffect(() => {
        if (isHelloUser && currentChannelId) {
            fetchHelloPreviousHistory()
        }
    }, [currentChannelId, isHelloUser])

    useEffect(() => {
        emitEventToParent('SET_BADGE_COUNT', { badgeCount: totalNoOfUnreadMsgs > 99 ? '99+' : totalNoOfUnreadMsgs })
    }, [totalNoOfUnreadMsgs])

    useSocketEvents({ messageRef, fetchChannels, chatSessionId, setLoading, tabSessionId });
    useNotificationSocketEventHandler({ chatSessionId })

    useEffect(() => {
        if (reduxChatSessionId) {
            const widgetToken = reduxChatSessionId?.split('_')[0] // Extract first part (e.g., "d1bc7")
            initializeHelloServices(widgetToken);
        }
    }, [reduxChatSessionId])

    useEffect(() => {
        const handleUnreadReset = async () => {
            if (
                currentChannelId &&
                unReadCountInCurrentChannel > 0 &&
                (isSmallScreen ? !isToggledrawer : true) &&
                isChatbotOpen &&
                isHelloUser &&
                isTabVisible &&
                !isChatbotMinimized
            ) {
                deleteReadReceipt(currentChannelId)
                dispatch(setUnReadCount({ channelId: currentChannelId, resetCount: true }));
            }
        };

        const debouncedReset = debounce(handleUnreadReset, 1000);
        debouncedReset();

        return () => {
            debouncedReset.cancel();
        };
    }, [currentChannelId, isToggledrawer, unReadCountInCurrentChannel, isChatbotOpen, isHelloUser, isTabVisible,isChatbotMinimized]);


    const initializeHelloServices = async (widgetToken: string = '') => {
        // Prevent duplicate initialization
        if (!widgetToken || widgetToken !== getLocalStorage("WidgetId")) {
            return;
        }

        try {
            let a_clientId = getLocalStorage('a_clientId');
            let k_clientId = getLocalStorage('k_clientId');
            let enable_call = false
            let is_domain_enable = false
            let { mail, number, unique_id } = JSON.parse(getLocalStorage('userData') || '{}');

            let needsAnonymousRegistration = !a_clientId && !k_clientId && !unique_id && widgetToken && isHelloUser && !mail && !number;

            if (needsAnonymousRegistration) {
                await registerAnonymousUser();
                a_clientId = getLocalStorage(`a_clientId`);
            } else {
                // it gives the Hello Client Id for the registered user
                await fetchChannels();
                k_clientId = getLocalStorage(`k_clientId`);
            }

            //  used to subscribe to cobrowse
            emitEventToParent('uuid', { uuid: k_clientId || a_clientId })
            // Step 2: Handle domain (if needed)

            let widgetData = null;
            let jwtData = null;
            let botType = '';
            if (isHelloUser && widgetToken) {
                try {
                    widgetData = await initializeHelloChat();
                    if (!widgetData) {
                        window.parent.postMessage({ type: 'initializeHelloChat_failed' }, '*');
                    }
                    window.parent.postMessage({ type: 'hide_widget', data: widgetData?.hide_launcher }, '*');
                    window.parent.postMessage({ type: 'setDataInLocal', data: { key: 'widgetInfo', payload: JSON.stringify({ additionalData: { widgetToken } }) } }, '*');
                    window.parent.postMessage({ type: 'launch_widget', data: widgetData?.launch_widget }, '*');
                    botType = widgetData?.bot_type;
                    enable_call = widgetData?.voice_call_widget;
                    is_domain_enable = widgetData?.is_domain_enable
                    dispatch(setWidgetInfo(widgetData));
                    const helloConfigFromSession = (JSON.parse(GetSessionStorageData('helloConfig') || `{}`))
                    const customTheme = helloConfigFromSession?.sdkConfig?.customTheme || ''
                    if (!customTheme) {
                        handleThemeChange(widgetData?.primary_color || "#000000");
                        SetSessionStorage('helloConfig', JSON.stringify({ ...helloConfigFromSession, primary_color: widgetData?.primary_color || '#333333' }));
                    }
                    if (widgetData?.teams && widgetData?.teams.length <= 1) {
                        dispatch(setDataInAppInfoReducer({ currentTeamId: widgetData?.teams?.[0]?.id || null }));
                    }
                } catch (error) {
                    window.parent.postMessage({ type: 'initializeHelloChat_failed' }, '*');
                    console.error("Failed to initialize Hello Chat:", error);
                    return; // Exit early, don't proceed to getJwtToken
                }
            }

            // Only get JWT token if widgetData is valid and HelloClientId exists
            if (widgetData && (getLocalStorage(`a_clientId`) || getLocalStorage(`k_clientId`))) {
                try {
                    jwtData = await getJwtToken();
                    if (jwtData !== null) {
                        dispatch(setJwtToken(jwtData));
                    }
                } catch (error) {
                    console.error("Failed to fetch JWT token:", error);
                }
            }
            // Step 4: Get greeting questions (depends on widget info for company/bot IDs)
            const greetingCompanyId = widgetData?.company_id || companyId;
            const greetingBotId = widgetData?.bot_id || botId;
            if (widgetData && greetingCompanyId && greetingBotId && (getLocalStorage(`a_clientId`) || getLocalStorage(`k_clientId`)) && (botType === 'lex' || botType === 'chatgpt')) {
                await getGreetingQuestions(greetingCompanyId, greetingBotId, botType).then((data) => {
                    dispatch(setGreeting({ ...data?.greeting }));
                });
            }

            if (widgetToken) {
                getAgentTeamApi().then((data) => {
                    dispatch(setAgentTeams(data));
                });
            }

            // Step 5: Get client token and call token (depend on JWT)
            if ((getLocalStorage(`a_clientId`) || getLocalStorage(`k_clientId`)) && widgetToken && enable_call) {
                const clientTokenPromise = getClientToken().then(() => {
                    helloVoiceService.initialize();
                });

                const callTokenPromise = getCallToken();

                await Promise.all([clientTokenPromise, callTokenPromise]);
            }

            // Step 6: Fetch channels
            needsAnonymousRegistration && fetchChannels();


            // Step 7: Set client details and save to segmento
            const scriptParams = JSON.parse(GetSessionStorageData('helloConfig') || '{}')
            if (Object.keys(scriptParams)?.length > 1) {
                const formattedParams = {
                    ...scriptParams,
                    Name: scriptParams?.name || scriptParams?.Name || undefined,
                    Phonenumber: scriptParams?.number || undefined,
                    Email: scriptParams?.mail || scriptParams?.email || undefined,
                }

                const keysToRemove = [
                    'widgetToken', 'unique_id', 'user_jwt_token', 'sdkConfig', 'hide_launcher', 'show_widget_form', 'show_close_button', 'launch_widget', 'show_send_button', 'unique_id', 'primary_color', 'bot_id', 'name', 'number', 'mail', 'bot_type', 'isMobileSDK', 'pushConfig', 'variables'
                ]

                keysToRemove.map(key => {
                    if (key in formattedParams) {
                        delete formattedParams[key];
                    }
                });
                const clientData = cleanObject(formattedParams);
                if (Object.keys(clientData).length > 0) {
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

            if (is_domain_enable) {
                emitEventToParent("ENABLE_DOMAIN_TRACKING")
            }

        } catch (error) {
            console.error("Error initializing Hello services:", error);
        }
    };

    return null;
};