/* eslint-disable */
class ChatbotEmbedManager {
    constructor() {
        this.props = {};
        this.isHelloChatWidget = false;
        this.helloProps = {};
        this.parentContainer = null;
        this.config = {
            type: 'popup',
            height: '80',
            heightUnit: '%',
            width: '480',
            widthUnit: 'px',
            buttonName: ''
        };
        this.urls = {
            chatbotUrl: 'https://dev-chatbot.gtwy.ai/chatbot',
            styleSheet: 'https://chatbot-embed.viasocket.com/style-dev.css',
            login: 'https://dev-db.gtwy.ai/chatbot/loginuser'
        };
        this.icons = {
            white: this.makeImageUrl('b1357e23-2fc6-4dc3-855a-7a213b1fa100'),
            black: this.makeImageUrl('91ee0bff-cfe3-4e2d-64e5-fadbd9a3a200')
        };
        this.state = {
            bodyLoaded: false,
            fullscreen: false,
            tempDataToSend: null
        };

        this.initializeEventListeners();
    }

    makeImageUrl(imageId) {
        return `https://imagedelivery.net/Vv7GgOGQbSyClWJqhyP0VQ/${imageId}/public`;
    }

    createChatbotIcon() {
        const chatBotIcon = document.createElement('div');
        chatBotIcon.id = 'interfaceEmbed';
        chatBotIcon.style.display = 'none';

        const imgElement = document.createElement('img');
        imgElement.id = 'popup-interfaceEmbed';
        imgElement.alt = 'Ask Ai';
        imgElement.src = this.icons.black;
        chatBotIcon.appendChild(imgElement);

        const textElement = document.createElement('span');
        textElement.id = 'popup-interfaceEmbed-text';
        chatBotIcon.appendChild(textElement);

        return { chatBotIcon, imgElement, textElement };
    }

    createStyleLink() {
        const link = document.createElement('link');
        link.id = 'chatbotEmbed-style';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = this.urls.styleSheet;
        return link;
    }

    extractScriptProps() {
        const interfaceScript = document.getElementById('chatbot-main-script');
        if (!interfaceScript) {
            console.log('Script tag not found');
            return {};
        }

        const attributes = [
            'interfaceId', 'embedToken', 'threadId', 'bridgeName', 'variables',
            'onOpen', 'onClose', 'iconColor', 'className', 'style', 'environment',
            'fullScreen', 'hideCloseButton', 'hideIcon', 'parentId', 'config',
            'headerButtons', 'eventsToSubscribe', 'modalConfig', 'allowModalSwitch',
            'chatTitle', 'chatIcon', 'hideFullScreenButton'
        ];

        return attributes.reduce((props, attr) => {
            if (interfaceScript.hasAttribute(attr)) {
                let value = interfaceScript.getAttribute(attr);

                if (['config', 'headerButtons', 'eventsToSubscribe', 'modalConfig'].includes(attr)) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        console.error(`Error parsing ${attr}:`, e);
                    }
                }
                props[attr] = value;
                this.state.tempDataToSend = { ...this.state.tempDataToSend, [attr]: value }
            }
            return props;
        }, {});
    }

    initializeEventListeners() {
        this.observeScriptChanges();
        this.setupMessageListeners();
        this.setupResizeObserver();
    }

    observeScriptChanges() {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    this.handleScriptMutations(mutation);
                }
            }
        });
        observer.observe(document.head, { childList: true });
    }

    handleScriptMutations(mutation) {
        mutation.addedNodes.forEach(node => {
            if (node.id === 'chatbot-main-script') {
                this.props = this.extractScriptProps();
            }
        });

        mutation.removedNodes.forEach(node => {
            if (node.id === 'chatbot-main-script') {
                this.cleanupChatbot();
            }
        });
    }

    cleanupChatbot() {
        ['iframe-parent-container', 'interfaceEmbed', 'chatbotEmbed-style']
            .forEach(id => {
                const element = document.getElementById(id);
                if (element) element.remove();
            });
    }

    setupMessageListeners() {
        window.addEventListener('message', this.handleIncomingMessages.bind(this));
    }

    handleIncomingMessages(event) {
        const { type, data } = event.data || {};

        switch (type) {
            case 'CLOSE_CHATBOT':
                this.closeChatbot();
                break;
            case 'ENTER_FULL_SCREEN_CHATBOT':
                this.toggleFullscreen(true);
                break;
            case 'EXIT_FULL_SCREEN_CHATBOT':
                this.toggleFullscreen(false);
                break;
            case 'interfaceLoaded':
                this.sendInitialData();
                break;
        }
    }

    setupResizeObserver() {
        const iframeObserver = new ResizeObserver((entries) => {
            const iframeParentContainer = document.getElementById('iframe-parent-container');

            if (!iframeParentContainer || this.state.fullscreen) return;

            const { width } = entries[0].contentRect;

            if (width < 600) {
                iframeParentContainer.style.height = '100%';
                iframeParentContainer.style.width = '100%';
            } else {
                this.applyConfig(this?.props?.config || {});
            }
        });

        iframeObserver.observe(document.documentElement);
    }

    openChatbot() {
        const interfaceEmbed = document.getElementById('interfaceEmbed');
        const iframeContainer = document.getElementById('iframe-parent-container');

        if (interfaceEmbed && iframeContainer) {
            interfaceEmbed.style.display = 'none';
            iframeContainer.style.display = 'block';
            iframeContainer.style.opacity = 0;
            iframeContainer.style.transition = 'opacity 0.3s ease-in-out';

            requestAnimationFrame(() => {
                iframeContainer.style.opacity = 1;
            });

            // document.body.style.overflow = 'hidden';
        }

        if (window.parent) {
            window.parent.postMessage?.({ type: 'open', data: {} }, '*');
        }
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage?.(JSON.stringify({ type: 'open', data: {} }));
        }

        const iframeComponent = document.getElementById('iframe-component-interfaceEmbed');
        iframeComponent?.contentWindow?.postMessage({ type: 'open', data: {} }, '*');
    }

    closeChatbot() {
        const iframeContainer = document.getElementById('iframe-parent-container');

        if (iframeContainer?.style?.display === 'block') {
            iframeContainer.style.transition = 'opacity 0.2s ease-in-out';
            iframeContainer.style.opacity = 0;

            setTimeout(() => {
                // Send message to parent window normally, but stringify for ReactNativeWebView
                if (window.parent) {
                    window.parent.postMessage?.({ type: 'close', data: {} }, '*');
                }
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage?.(JSON.stringify({ type: 'close', data: {} }));
                }

                iframeContainer.style.display = 'none';
                // document.body.style.overflow = 'auto';

                const interfaceEmbed = document.getElementById('interfaceEmbed');
                if (interfaceEmbed) {
                    interfaceEmbed.style.display =
                        (this.props.hideIcon === true || this.props.hideIcon === 'true')
                            ? 'none'
                            : 'unset';
                }
            }, 100);
        }
    }

    toggleFullscreen(enable) {
        const iframeContainer = document.getElementById('iframe-parent-container');
        this.state.fullscreen = enable;

        if (iframeContainer) {
            iframeContainer.style.transition = 'width 0.3s ease-in-out, height 0.3s ease-in-out';

            if (enable) {
                iframeContainer.style.width = '100%';
                iframeContainer.style.height = '100%';
                iframeContainer.classList.add('full-screen-without-border');
            } else {
                iframeContainer.classList.remove('full-screen-without-border');
                iframeContainer.style.height = `${this.props?.config?.height}${this.props?.config?.heightUnit || ''}` || '70vh';
                iframeContainer.style.width = `${this.props?.config?.width}${this.props?.config?.widthUnit || ''}` || '40vw';
            }
        }
    }

    async initializeChatbot() {
        document.addEventListener('DOMContentLoaded', this.loadContent.bind(this));
        if (document?.body) this.loadContent();
    }

    loadContent() {
        if (this.state.bodyLoaded) return;

        const { chatBotIcon, imgElement, textElement } = this.createChatbotIcon();
        document.body.appendChild(chatBotIcon);
        document.head.appendChild(this.createStyleLink()); // load the External Css for script

        this.extractScriptProps();
        this.attachIconEvents(chatBotIcon);
        this.createIframeContainer();
        this.loadChatbotEmbed();
        this.updateProps(this.state.tempDataToSend || {});

        this.state.bodyLoaded = true;
    }

    createIframeContainer() {
        this.parentContainer = document.createElement('div');
        this.parentContainer.id = 'iframe-parent-container';
        this.parentContainer.className = 'popup-parent-container';
        this.parentContainer.style.display = 'none';

        const iframe = document.createElement('iframe');
        iframe.id = 'iframe-component-interfaceEmbed';
        iframe.title = 'iframe';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
        iframe.allow = 'microphone *; camera *; midi *; encrypted-media *';

        this.parentContainer.appendChild(iframe);

        const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
        this.changeContainer(parentId, this.parentContainer);
    }

    changeContainer(parentId, parentContainer = this.parentContainer) {
        if (parentId && document.getElementById(parentId)) {
            const container = document.getElementById(parentId);
            container.style.position = 'relative';
            this.parentContainer.style.position = 'absolute';
            container.appendChild(parentContainer);
        } else if (document.getElementById('interface-chatbot')) {
            document.getElementById('interface-chatbot').appendChild(parentContainer);
        } else {
            document.body.appendChild(parentContainer);
        }
    }

    attachIconEvents(chatBotIcon) {
        chatBotIcon.addEventListener('click', () => window.openChatbot());
    }

    async loadChatbotEmbed() {
        try {
            if (this.isHelloChatWidget) {
                this.processChatbotDetails({});
            } else {
                const response = await this.fetchChatbotDetails();
                this.processChatbotDetails(response);
            }
        } catch (error) {
            console.error('Chatbot embed loading error:', error);
        }
    }

    async fetchChatbotDetails() {
        try {
            const script = document.getElementById('chatbot-main-script');
            const embedToken = script?.getAttribute('embedToken');
            const interfaceId = script?.getAttribute('interface_id');

            const requestOptions = embedToken
                ? this.createTokenBasedRequest(embedToken)
                : this.createAnonymousRequest(interfaceId);

            const response = await fetch(this.urls.login, requestOptions);
            return response.json();
        } catch (error) {
            console.error('Fetch login user error:', error)
        }
    }

    createTokenBasedRequest(embedToken) {
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: embedToken
            }
        };
    }

    createAnonymousRequest(interfaceId) {
        return {
            method: 'POST',
            body: JSON.stringify({
                isAnonymousUser: true,
                interface_id: interfaceId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    processChatbotDetails(data) {
        const iframeComponent = document.getElementById('iframe-component-interfaceEmbed');
        if (!iframeComponent) return;
        let encodedData = '';
        if (this.isHelloChatWidget) {
            encodedData = encodeURIComponent(JSON.stringify({ isHelloUser: true }));
        } else {
            encodedData = encodeURIComponent(JSON.stringify(data.data));
        }
        const modifiedUrl = `${this.urls.chatbotUrl}?interfaceDetails=${encodedData}`;
        iframeComponent.src = modifiedUrl;

        this.props.config = { ...this.config, ...(data?.data?.config || {}) };
        this.applyConfig(this.props?.config);
    }

    applyConfig(config = {}) {
        const interfaceEmbedElement = document.getElementById('interfaceEmbed');
        const iframeParentContainer = document.getElementById('iframe-parent-container');
        if (!iframeParentContainer) return;
        if (config && Object.keys(config).length > 0) {
            if (config.title) {
                this.title = config.title;
            }
            if (config.buttonName) {
                this.buttonName = config.buttonName;
                const textElement = document.getElementById('popup-interfaceEmbed-text');
                textElement.innerText = this.buttonName;
                interfaceEmbedElement.classList.add('show-bg-color');
                const imgElement = document.getElementById('popup-interfaceEmbed');
                if (imgElement) imgElement.style.visibility = 'hidden';
            } else {
                const textElement = document.getElementById('popup-interfaceEmbed-text');
                textElement.innerText = '';
                interfaceEmbedElement?.classList.remove('show-bg-color');
                const imgElement = document.getElementById('popup-interfaceEmbed');
                if (imgElement) imgElement.style.visibility = 'visible';
            }
            if (config.iconUrl) {
                const imgElement = document.getElementById('popup-interfaceEmbed');
                if (imgElement) imgElement.src = config.iconUrl;
                interfaceEmbedElement?.classList.remove('show-bg-color');
                const textElement = document.getElementById('popup-interfaceEmbed-text');
                textElement.innerText = '';
                if (imgElement) imgElement.style.visibility = 'visible';
            }
            if (config.type && iframeParentContainer) {
                iframeParentContainer?.classList.forEach((cls) => {
                    if (cls.endsWith('-parent-container')) {
                        iframeParentContainer.classList.remove(cls);
                    }
                });
                interfaceEmbedElement?.classList.forEach((cls) => {
                    if (cls.endsWith('-interfaceEmbed')) {
                        interfaceEmbedElement.classList.remove(cls);
                    }
                });

                iframeParentContainer?.classList.add(`${config.type}-parent-container`);
                interfaceEmbedElement?.classList.add(`${config.type}-interfaceEmbed`);
                this.className = config.type;
            }
        }

        if (this.className === 'all_available_space') {
            iframeParentContainer.style.height = '100%';
            iframeParentContainer.style.width = '100%';
            iframeParentContainer.style.display = 'block';
        } else {
            iframeParentContainer.style.height = `${config?.height}${config?.heightUnit || ''}` || '70vh';
            iframeParentContainer.style.width = `${config?.width}${config?.widthUnit || ''}` || '40vw';
        }
    }

    updateProps(newProps) {
        this.props = { ...this.props, ...newProps };
        this.setPropValues(newProps);
    }

    setPropValues(newprops) {
        if (newprops.iconColor) {
            document.getElementById("popup-interfaceEmbed").src = newprops.iconColor === 'dark' ? AI_WHITE_ICON : AI_BLACK_ICON
        } if (newprops.fullScreen === true || newprops.fullScreen === 'true') {
            document.getElementById('iframe-parent-container')?.classList.add('full-screen-interfaceEmbed')
        } if (newprops.fullScreen === false || newprops.fullScreen === 'false') {
            document.getElementById('iframe-parent-container')?.classList.remove('full-screen-interfaceEmbed')
        } if ('hideIcon' in newprops && document.getElementById('interfaceEmbed')) {
            document.getElementById('interfaceEmbed').style.display = (newprops.hideIcon === true || newprops.hideIcon === 'true') ? 'none' : 'unset';
        } if ('hideCloseButton' in newprops && document.getElementById('close-button-interfaceEmbed')) {
            document.getElementById('close-button-interfaceEmbed').style.display = (newprops.hideCloseButton === true || newprops.hideCloseButton === 'true') ? 'none' : 'unset';
        }
    }

    sendInitialData() {
        const interfaceEmbed = document.getElementById('interfaceEmbed');
        if (interfaceEmbed) {
            interfaceEmbed.style.display = 'block';
        }
        if (this.state.tempDataToSend || this.helloProps) {
            sendMessageToChatbot({ type: 'interfaceData', data: this.state.tempDataToSend });
            sendMessageToChatbot({ type: 'helloData', data: this.helloProps });
            this.state.tempDataToSend = null;
        }
    }
}

const chatbotManager = new ChatbotEmbedManager();

window.SendDataToChatbot = function (dataToSend) {
    const iframeComponent = document.getElementById('iframe-component-interfaceEmbed');

    // Parse string data if needed
    if (typeof dataToSend === 'string') {
        try {
            dataToSend = JSON.parse(dataToSend);
        } catch (e) {
            console.error('Failed to parse dataToSend:', e);
            return;
        }
    }

    // Send to React Native if available
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'data', data: dataToSend }));
    }

    // Handle parent container changes
    if ('parentId' in dataToSend) {
        chatbotManager.state.tempDataToSend = {
            ...chatbotManager.state.tempDataToSend,
            ...dataToSend
        };
        const previousParentId = chatbotManager.props['parentId'];
        const existingParent = document.getElementById(previousParentId);

        if (existingParent?.contains(chatbotManager.parentContainer)) {
            if (previousParentId !== dataToSend.parentId) {
                if (previousParentId) {
                    if (existingParent && chatbotManager.parentContainer && existingParent.contains(chatbotManager.parentContainer)) {
                        existingParent.removeChild(chatbotManager.parentContainer);
                    }
                } else if (chatbotManager.parentContainer && document.body.contains(chatbotManager.parentContainer)) {
                    document.body.removeChild(chatbotManager.parentContainer);
                }
                chatbotManager.updateProps({ parentId: dataToSend.parentId });
                chatbotManager.changeContainer(dataToSend.parentId || '');
            }
        } else {
            chatbotManager.updateProps({ parentId: dataToSend.parentId });
            chatbotManager.changeContainer(dataToSend.parentId || '');
        }
    }

    // Process other properties
    processDataProperties(dataToSend, iframeComponent);
};

const processDataProperties = (data, iframeComponent) => {
    // Create a props object for all UI-related properties
    const propsToUpdate = {};

    // Collect all UI properties in one object
    if ('hideCloseButton' in data) propsToUpdate.hideCloseButton = data.hideCloseButton || false;
    if ('hideIcon' in data) propsToUpdate.hideIcon = data.hideIcon || false;
    if (data.iconColor) propsToUpdate.iconColor = data.iconColor || 'dark';
    if (data.fullScreen === true || data.fullScreen === 'true' ||
        data.fullScreen === false || data.fullScreen === 'false') {
        propsToUpdate.fullScreen = data.fullScreen;
    }

    // Update props in a single call if we have any
    if (Object.keys(propsToUpdate).length > 0) {
        chatbotManager.updateProps(propsToUpdate);
    }

    // Handle iframe communication
    if (iframeComponent?.contentWindow) {
        // Send general data
        if (data) {
            chatbotManager.state.tempDataToSend = {
                ...chatbotManager.state.tempDataToSend,
                ...data
            };
            sendMessageToChatbot({ type: 'interfaceData', data: data });
        }

        // Handle askAi specifically
        if (data.askAi) {
            sendMessageToChatbot({ type: 'askAi', data: data || {} });
        }
    }

    // Handle config updates
    if ('config' in data && data.config) {
        const newConfig = { ...chatbotManager.config, ...data.config };
        chatbotManager.applyConfig(newConfig);
        chatbotManager.updateProps({ config: newConfig });
    }
}

window.openChatbot = () => chatbotManager.openChatbot();
window.closeChatbot = () => chatbotManager.closeChatbot();
// Helper function to send messages to the iframe
function sendMessageToChatbot(messageObj) {
    const iframeComponent = document.getElementById('iframe-component-interfaceEmbed');
    if (iframeComponent?.contentWindow) {
        iframeComponent?.contentWindow?.postMessage(messageObj, '*');
    }
}

window.reloadChats = () => {
    sendMessageToChatbot({ type: 'refresh', reload: true });
};

window.askAi = (data) => {
    sendMessageToChatbot({ type: 'askAi', data: data || "" });
};

function getScriptParams() {
    // Get the current script element
    const script = document.currentScript || (function () {
        // Fallback for browsers that don't support currentScript
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    // Get the script URL
    const scriptUrl = script.src;

    // Parse URL to extract query parameters
    const url = new URL(scriptUrl);
    const params = new URLSearchParams(url.search);
    return params;
}

const scriptParams = getScriptParams();
// Store embedToken in helloProps if it exists in URL parameters
if (scriptParams.get('hello') === 'true' || scriptParams.get('hello') === true) {
    chatbotManager.isHelloChatWidget = true;
}

// Initialize the widget function
window.initChatWidget = (data, delay = 0) => {
    if (data) {
        chatbotManager.helloProps = { ...data };
    }
};

setTimeout(() => {
    chatbotManager.initializeChatbot();
}, 1000);