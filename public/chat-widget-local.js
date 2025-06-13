/* eslint-disable */
// IIFE Scope ( for avoiding global scope pollution )
(function () {
    let block_chatbot = false;

    class CobrowseManager {
        constructor() {
            this.scriptInjected = false
            this.device_id = null
        }

        injectScript(uuid) {
            if (!uuid) {
                console.log("[CoBrowse PARENT] No device ID provided, aborting script injection");
                return;
            }
            this.scriptInjected = true;
            // Create and load the CobrowseIO script for parent window
            const script = document.createElement('script');
            script.id = 'CBParentScript';
            script.src = 'https://js.cobrowse.io/CobrowseIO.js';
            script.async = true;

            // Set up an onload handler to configure CobrowseIO after script loads
            script.onload = function () {
                try {
                    console.log("[CoBrowse PARENT] Configuring with device ID:", uuid);

                    // Now manually configure CobrowseIO
                    window.CobrowseIO.customData = {
                        device_id: uuid
                    };

                    window.CobrowseIO.license = "FZBGaF9-Od0GEQ"; // Replace with your actual license key
                    window.CobrowseIO.trustedOrigins = [
                        window?.origin,
                        "http://localhost:3001/chatbot"
                    ]

                    // Start CobrowseIO
                    window.CobrowseIO.client().then(function () {
                        window.CobrowseIO.start();
                        console.log("[CoBrowse PARENT] CoBrowse service started successfully, Notifying iframe to add CoBrowse script");
                        sendMessageToChatbot({ type: "ADD_COBROWSE_SCRIPT", data: { origin: window?.origin } });
                    }).catch(function (err) {
                        console.error("[CoBrowse PARENT] Client initialization error:", err);
                    });
                } catch (error) {
                    console.error("[CoBrowse PARENT] Error configuring CobrowseIO:", error);
                }
            };

            script.onerror = function () {
                console.error("[CoBrowse PARENT] Failed to load CobrowseIO script");
            };

            // Add the script to the document
            document.head.appendChild(script);
        }

        updateDeviceId(uuid) {
            if (this.device_id !== uuid && this.scriptInjected) {
                this.device_id = uuid
                window.CobrowseIO.customData = {
                    device_id: uuid
                }
                return
            }
            if (this.device_id === uuid && this.scriptInjected) {
                return
            }
            if (!this.scriptInjected) {
                this.injectScript(uuid)
            }
        }
    }

    const CBManager = new CobrowseManager()
    class HelloChatbotEmbedManager {
        constructor() {
            this.prefix = 'hello-'
            this.elements = {
                chatbotIconContainer: `${this.prefix}chatbot-launcher-icon`,
                chatbotIconImage: `${this.prefix}chatbot-icon-image`,
                chatbotIconText: `${this.prefix}chatbot-icon-text`,
                chatbotIframeContainer: `${this.prefix}chatbot-iframe-container`,
                chatbotIframeComponent: `${this.prefix}chatbot-iframe-component`,
                chatbotStyle: `${this.prefix}chatbot-style`,
            }
            this.props = {};
            this.helloProps = null;
            this.parentContainer = null;
            this.hideHelloIcon = null;
            this.helloLaunchWidget = null;
            this.config = {
                type: 'popup',
                height: 'min(804px, calc(100% - 40px))',
                heightUnit: '',
                width: '480',
                widthUnit: 'px',
                buttonName: ''
            };
            this.urls = {
                chatbotUrl: 'http://localhost:3001/chatbot',
                styleSheet: 'http://localhost:3001/chat-widget-style.css',
                urlMonitor: 'http://localhost:3001/urlMonitor.js'
            };
            this.icons = {
                white: this.makeImageUrl('b1357e23-2fc6-4dc3-855a-7a213b1fa100'),
                black: this.makeImageUrl('91ee0bff-cfe3-4e2d-64e5-fadbd9a3a200')
            };
            this.state = {
                bodyLoaded: false,
                fullscreen: false,
                tempDataToSend: null,
                interfaceLoaded: false,
                delayElapsed: false,
                domainTrackingStarted: false,
                urlMonitorAdded:false
            };

            this.initializeEventListeners();
        }

        makeImageUrl(imageId) {
            return `https://imagedelivery.net/Vv7GgOGQbSyClWJqhyP0VQ/${imageId}/public`;
        }

        createChatbotIcon() {
            const chatBotIcon = document.createElement('div');
            chatBotIcon.id = this.elements.chatbotIconContainer
            chatBotIcon.style.display = 'none';

            const imgElement = document.createElement('div');
            imgElement.id = this.elements.chatbotIconImage;
            imgElement.innerHTML = `
        <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="border: 0.5px solid #A9A9A9; border-radius: 50%; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
            <rect width="48" height="48" rx="24" fill="white"/>
            <path d="M10.667 16C10.667 13.7909 12.4579 12 14.667 12H33.3337C35.5428 12 37.3337 13.7909 37.3337 16V28C37.3337 30.2091 35.5428 32 33.3337 32H14.667C12.4579 32 10.667 30.2091 10.667 28V16Z" fill="#F2CA55"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1339 22.6665C21.1339 24.2497 22.4173 25.5332 24.0005 25.5332C25.5837 25.5332 26.8672 24.2497 26.8672 22.6665H29.1339C29.1339 25.5016 26.8356 27.7998 24.0005 27.7998C21.1655 27.7998 18.8672 25.5016 18.8672 22.6665H21.1339Z" fill="#8C5D00"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.2002 19.9998V16.6665H22.4669V19.9998H20.2002ZM25.5335 19.9998V16.6665H27.8002V19.9998H25.5335Z" fill="#8C5D00"/>
            <path d="M26.6663 32V36L21.333 32H26.6663Z" fill="#8C5D00"/>
        </svg>
        `;
            chatBotIcon.appendChild(imgElement);

            const textElement = document.createElement('span');
            textElement.id = this.elements.chatbotIconText;
            chatBotIcon.appendChild(textElement);

            return { chatBotIcon, imgElement, textElement };
        }

        createStyleLink() {
            const link = document.createElement('link');
            link.id = this.elements.chatbotStyle;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = this.urls.styleSheet;
            return link;
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
            mutation.removedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' && node.src && node.src.includes('chat-widget')) {
                    this.cleanupChatbot();
                }
            });
        }

        cleanupChatbot() {
            [this.elements.chatbotIframeContainer, this.elements.chatbotIconContainer, this.elements.chatbotStyle, 'CBParentScript']
                .forEach(id => {
                    const element = document.getElementById(id);
                    if (element) element.remove();
                });
        }

        setupMessageListeners() {
            window.addEventListener('message', (event) => {
                // Only process messages from trusted origins
                const trustedOrigins = [
                    'http://localhost:3001',
                    'http://localhost:3000',
                    window.location.origin
                ];

                if (trustedOrigins.includes(event.origin)) {
                    this.handleIncomingMessages(event);
                }
            });
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
                    this.state.interfaceLoaded = true;
                    this.showIconIfReady();
                    break;
                case 'initializeHelloChat_failed':
                    block_chatbot = true;
                    this.cleanupChatbot();
                    break;
                case 'hide_widget':
                    if (!(this.helloProps && 'hide_launcher' in this.helloProps) && !this.helloProps?.isMobileSDK) {
                        if (data === true || data === 'true') {
                            this.hideHelloIcon = true;
                            this.hideChatbotWithIcon();
                        } else {
                            this.hideHelloIcon = false;
                            this.showChatbotIcon();
                        }
                    }
                    break;
                case 'launch_widget':
                    if (!(this.helloProps && 'launch_widget' in this.helloProps) && !this.helloProps?.isMobileSDK) {
                        if (data === true || data === 'true') {
                            this.helloLaunchWidget = true;
                            this.openChatbot();
                        } else {
                            this.helloLaunchWidget = false;
                            this.closeChatbot();
                        }
                    }
                    break;
                case 'downloadAttachment':
                    this.handleDownloadAttachment(data);
                    break;
                case 'setDataInLocal':
                    localStorage.setItem(data.key, data?.payload);
                    break;
                case 'uuid':
                    this.setUUID(data?.uuid);
                    break;
                case 'PUSH_NOTIFICATION':
                    if (this.helloProps?.isMobileSDK) {
                        sendDataToMobileSDK({ type: 'PUSH_NOTIFICATION', data })
                    } else {
                        this.handlePushNotification(data)
                    }
                    break;
                case 'ENABLE_DOMAIN_TRACKING':
                    this.enableDomainTracking();
                    break;
                default:
                    break;
            }
        }

        handlePushNotification(data) {
            // Create a full-screen transparent overlay
            const overlay = document.createElement('div');
            overlay.id = 'notification-overlay';
            overlay.classList.add('notification-overlay');

            // Set position classes based on horizontal and vertical position values
            const horizontalPosition = data.horizontal_position || 'center';
            const verticalPosition = data.vertical_position || 'center';

            // Add position classes
            overlay.classList.add(`h-${horizontalPosition}`, `v-${verticalPosition}`);

            // Create the modal container
            const modalContainer = document.createElement('div');
            modalContainer.classList.add('notification-modal');

            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.minHeight = '500px';
            iframe.style.minWidth = '500px';
            iframe.style.background = 'transparent';

            modalContainer.appendChild(iframe);

            // Create close button (cross icon)
            const closeButton = document.createElement('div');
            closeButton.innerHTML = '&times;';
            closeButton.classList.add('notification-close-btn');

            // Add click event to close button
            closeButton.addEventListener('click', () => {
                this.removeNotification(overlay);
            });

            // Add the close button to the modal container after content
            modalContainer.appendChild(closeButton);

            // Append the modal to the overlay
            overlay.appendChild(modalContainer);

            // Append the overlay to the body
            document.body.appendChild(overlay);


            // Once the iframe is added to the DOM, we can access its document
            setTimeout(() => {
                // Get reference to the iframe's document
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                // Write the content to the iframe
                iframeDoc.open();
                iframeDoc.write(data.content);
                iframeDoc.close();

                // Add external stylesheet if needed
                if (this.urls && this.urls.styleSheet) {
                    const externalStyle = iframeDoc.createElement('link');
                    externalStyle.rel = 'stylesheet';
                    externalStyle.href = this.urls.styleSheet;
                    externalStyle.type = 'text/css';
                    iframeDoc.head.appendChild(externalStyle);
                }
            }, 0);
        }

        removeNotification(overlayElement) {
            if (overlayElement && document.body.contains(overlayElement)) {
                // Add fade-out animation
                overlayElement.classList.add('notification-fade-out');

                // Remove after animation completes
                setTimeout(() => {
                    document.body.removeChild(overlayElement);
                }, 300); // Match this with CSS transition duration
            }
        }

        enableDomainTracking() {
            if (this.state.domainTrackingStarted) return
            this.state.domainTrackingStarted = true
            sendMessageToChatbot({ type: 'parent-route-changed', data: { websiteUrl: window?.location?.href } });

            (function () {
                const originalPushState = history.pushState;
                const originalReplaceState = history.replaceState;

                function handleUrlChange() {
                    const fullUrl = window.location.href;

                    // Only call API if it's not a hash-only change
                    if (window.location.hash === '') {
                        sendMessageToChatbot({ type: 'parent-route-changed', data: { websiteUrl: fullUrl } })
                    }
                }

                history.pushState = function () {
                    originalPushState.apply(this, arguments);
                    handleUrlChange();
                };

                history.replaceState = function () {
                    originalReplaceState.apply(this, arguments);
                    handleUrlChange();
                };

                window.addEventListener('popstate', handleUrlChange);
            })();
        }

        handleDownloadAttachment(data) {
            if (this.helloProps.isMobileSDK) {
                sendDataToMobileSDK({ type: 'downloadAttachment', data: data?.url })
                return
            }
            const url = data?.url;

            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');

                    // Try to extract filename from URL
                    const filename = url.split("/").pop()?.split("?")[0] || "download";

                    link.href = blobUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                })
                .catch(err => {
                    console.error("Download failed:", err);
                });
        }

        setUUID(uuid) {
            this.uuid = uuid;
            if (this.helloProps.isMobileSDK) {
                sendDataToMobileSDK({ type: 'uuid', data: { uuid } })
            } else {
                CBManager.updateDeviceId(uuid)
            }
        }

        setupResizeObserver() {
            const iframeObserver = new ResizeObserver((entries) => {
                const iframeParentContainer = document.getElementById(this.elements.chatbotIframeContainer);

                if (!iframeParentContainer || this.state.fullscreen) return;

                if (!this.helloProps?.isMobileSDK) {
                    const { width } = entries[0].contentRect;
                    if (width < 600) {
                        iframeParentContainer.style.height = '100%';
                        iframeParentContainer.style.width = '100%';
                        iframeParentContainer.classList.add('full-screen-interfaceEmbed')
                    } else {
                        this.applyConfig(this?.props?.config || {});
                        iframeParentContainer.classList.remove('full-screen-interfaceEmbed');
                    }
                } else {
                    iframeParentContainer.style.height = '100%';
                    iframeParentContainer.style.width = '100%';
                    iframeParentContainer.classList.add('full-screen-interfaceEmbed')
                }
            });

            iframeObserver.observe(document.documentElement);
        }

        openChatbot() {
            const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
            const openMessage = { type: 'open', data: {} };

            if (interfaceEmbed && iframeContainer) {
                interfaceEmbed.style.display = 'none';
                iframeContainer.style.display = 'block';
                iframeContainer.style.opacity = 0;
                iframeContainer.style.transition = 'opacity 0.3s ease-in-out';

                requestAnimationFrame(() => iframeContainer.style.opacity = 1);
            }

            if (window.parent) {
                window.parent.postMessage?.(openMessage, '*');
            }
            if (this.helloProps.isMobileSDK) {
                sendDataToMobileSDK(openMessage)
            }

            const iframeComponent = document.getElementById(this.elements.chatbotIframeComponent);
            iframeComponent?.contentWindow?.postMessage(openMessage, '*');
        }

        closeChatbot() {
            if (this.helloProps.isMobileSDK) {
                sendDataToMobileSDK({ type: 'close', data: {} })
                return
            }
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);

            if (iframeContainer?.style?.display === 'block') {
                iframeContainer.style.transition = 'opacity 0.2s ease-in-out';
                iframeContainer.style.opacity = 0;

                setTimeout(() => {
                    // Send message to parent window normally, but stringify for ReactNativeWebView
                    if (window.parent) {
                        window.parent.postMessage?.({ type: 'close', data: {} }, '*');
                    }

                    iframeContainer.style.display = 'none';
                    // document.body.style.overflow = 'auto';

                    const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
                    if (interfaceEmbed) {
                        interfaceEmbed.style.display =
                            (this.props.hideIcon === true || this.props.hideIcon === 'true' || this.hideHelloIcon || helloChatbotManager.helloProps?.isMobileSDK)
                                ? 'none'
                                : 'unset';
                    }
                }, 100);
            }
        }

        toggleFullscreen(enable) {
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
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

            const { chatBotIcon } = this.createChatbotIcon();
            document.body.appendChild(chatBotIcon);
            document.head.appendChild(this.createStyleLink()); // load the External Css for script

            this.attachIconEvents(chatBotIcon);
            this.createIframeContainer();
            this.loadChatbotEmbed();

            this.state.bodyLoaded = true;
        }

        createIframeContainer() {
            this.parentContainer = document.createElement('div');
            this.parentContainer.id = this.elements.chatbotIframeContainer;
            this.parentContainer.className = 'popup-parent-container';
            this.parentContainer.style.display = 'none';

            const iframe = document.createElement('iframe');
            iframe.id = this.elements.chatbotIframeComponent;
            iframe.title = 'iframe';
            iframe.allowFullscreen = true;
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
            iframe.allow = 'microphone *; camera *; midi *; encrypted-media *';

            this.parentContainer.appendChild(iframe);

            const parentId = this.props.parentId || '';
            this.changeContainer(parentId, this.parentContainer);
        }

        changeContainer(parentId, parentContainer = this.parentContainer) {
            const container = parentId && document.getElementById(parentId);
            if (container) {
                container.style.position = 'relative';
                parentContainer.style.position = 'absolute';
                container.appendChild(parentContainer);
            } else {
                document.body.appendChild(parentContainer);
            }
        }

        attachIconEvents(chatBotIcon) {
            const children = chatBotIcon.querySelectorAll('*'); // Select all descendant elements
            children.forEach(child => {
                child.addEventListener('click', () => helloChatbotManager.openChatbot());
            });
        }


        async loadChatbotEmbed() {
            try {
                this.processChatbotDetails({});
            } catch (error) {
                console.error('Chatbot embed loading error:', error);
            }
        }

        processChatbotDetails() {
            const iframeComponent = document.getElementById(this.elements.chatbotIframeComponent);
            if (!iframeComponent) return;
            let encodedData = '';
            encodedData = encodeURIComponent(JSON.stringify({ isHelloUser: true }));
            const modifiedUrl = `${this.urls.chatbotUrl}?interfaceDetails=${encodedData}`;
            iframeComponent.src = modifiedUrl;

            this.props.config = { ...this.config };
            this.applyConfig(this.props?.config);
        }

        applyConfig(config = {}) {
            const interfaceEmbedElement = document.getElementById(this.elements.chatbotIconContainer);
            const iframeParentContainer = document.getElementById(this.elements.chatbotIframeContainer);
            if (!iframeParentContainer) return;
            if (config && Object.keys(config).length > 0) {
                if (config.title) {
                    this.title = config.title;
                }
                const textElement = document.getElementById(this.elements.chatbotIconText);
                const imgElement = document.getElementById(this.elements.chatbotIconImage);
                if (config.buttonName && textElement) {
                    this.buttonName = config.buttonName;
                    textElement.innerText = this.buttonName;
                    interfaceEmbedElement.classList.add('show-bg-color');
                    if (imgElement) imgElement.style.visibility = 'hidden';
                } else if (textElement) {
                    textElement.innerText = '';
                    interfaceEmbedElement?.classList.remove('show-bg-color');
                    if (imgElement) imgElement.style.visibility = 'visible';
                }
                if (config.iconUrl && textElement) {
                    if (imgElement) imgElement.src = config.iconUrl;
                    interfaceEmbedElement?.classList.remove('show-bg-color');
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
                const isFunctionalHeight = config.height?.includes('(');
                iframeParentContainer.style.height = isFunctionalHeight
                    ? config.height  // use as-is
                    : `${config.height}${config.heightUnit || ''}` || '70vh';
                // iframeParentContainer.style.height = `${config?.height}${config?.heightUnit || ''}` || '70vh';
                iframeParentContainer.style.width = `${config?.width}${config?.widthUnit || ''}` || '40vw';
            }
        }

        updateProps(newProps) {
            this.props = { ...this.props, ...newProps };
            this.setPropValues(newProps);
        }

        setPropValues(newprops) {
            if (newprops.iconColor) {
                document.getElementById("hello-popup-interfaceEmbed").src = newprops.iconColor === 'dark' ? AI_WHITE_ICON : AI_BLACK_ICON
            } if (newprops.fullScreen === true || newprops.fullScreen === 'true') {
                document.getElementById(this.elements.chatbotIframeContainer)?.classList.add('full-screen-interfaceEmbed')
            } if (newprops.fullScreen === false || newprops.fullScreen === 'false') {
                document.getElementById(this.elements.chatbotIframeContainer)?.classList.remove('full-screen-interfaceEmbed')
            } if ('hideIcon' in newprops && document.getElementById(this.elements.chatbotIconContainer)) {
                document.getElementById(this.elements.chatbotIconContainer).style.display = (newprops.hideIcon === true || newprops.hideIcon === 'true') ? 'none' : 'unset';
            } if ('hideCloseButton' in newprops && document.getElementById('hello-close-button-interfaceEmbed')) {
                document.getElementById('hello-close-button-interfaceEmbed').style.display = (newprops.hideCloseButton === true || newprops.hideCloseButton === 'true') ? 'none' : 'unset';
            }
        }

        sendInitialData() {
            if (this.helloProps) {
                sendMessageToChatbot({ type: 'helloData', data: this.helloProps });
            }
        }

        showIconIfReady() {
            if (this.state.interfaceLoaded && this.state.delayElapsed) {
                if (!this.hideHelloIcon && !helloChatbotManager.helloProps?.isMobileSDK) {
                    const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
                    if (interfaceEmbed) interfaceEmbed.style.display = 'block';
                }
                if (this.helloLaunchWidget) helloChatbotManager.openChatbot()
                if (helloChatbotManager.helloProps?.icon_position === 'left') {
                    interfaceEmbed.classList.add('left_all_child')
                    document.getElementById(this.elements.chatbotIframeContainer).classList.add('left_all_child')
                }
                if (helloChatbotManager.helloProps?.icon_position === 'right') {
                    interfaceEmbed.classList.add('right_all_child')
                    document.getElementById(this.elements.chatbotIframeContainer).classList.add('right_all_child')
                }
                const bottomMargin = helloChatbotManager.helloProps?.icon_bottom_margin
                if (bottomMargin) {
                    interfaceEmbed.style.bottom = typeof bottomMargin === 'number'
                        ? `${bottomMargin}px`
                        : bottomMargin;

                    // Apply to all children
                    Array.from(interfaceEmbed.children).forEach(child => {
                        child.style.bottom = typeof bottomMargin === 'number'
                            ? `${bottomMargin}px`
                            : bottomMargin;
                    });


                    document.getElementById(this.elements.chatbotIframeContainer).style.bottom = typeof bottomMargin === 'number' ? `${bottomMargin}px` : bottomMargin;
                }
                this.sendInitialData();
            }
        }

        hideChatbotWithIcon() {
            this.hideHelloIcon = true;
            const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
            if (interfaceEmbed) interfaceEmbed.style.display = 'none';
            if (iframeContainer) iframeContainer.style.display = 'none';
        }

        showChatbotIcon() {
            this.hideHelloIcon = false;
            const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
            if (interfaceEmbed) {
                interfaceEmbed.style.display = 'unset';
            }
        }

        processDataProperties = (data, iframeComponent) => {
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
                helloChatbotManager.updateProps(propsToUpdate);
            }

            // Handle iframe communication
            if (iframeComponent?.contentWindow) {
                // Send general data
                if (data) {
                    helloChatbotManager.state.tempDataToSend = {
                        ...helloChatbotManager.state.tempDataToSend,
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
                const newConfig = { ...helloChatbotManager.config, ...data.config };
                helloChatbotManager.applyConfig(newConfig);
                helloChatbotManager.updateProps({ config: newConfig });
            }
        }

        addUrlMonitor(data) {
            if(data.urlsToOpenInIFrame.length > 0 ){
                if(this.state.urlMonitorAdded === false) {
                    const urlTrackerScript = document.createElement('script');
                    urlTrackerScript.src = this.urls.urlMonitor;
                    urlTrackerScript.onload = () => {
                        this.state.urlMonitorAdded = true;
                        window.chatWidget.initUrlTracker({ urls: data.urlsToOpenInIFrame });
                    };
                    document.head.appendChild(urlTrackerScript);
                }else{
                    window.chatWidget.initUrlTracker({ urls: data.urlsToOpenInIFrame });
                }
            }
        }
    }

    const helloChatbotManager = new HelloChatbotEmbedManager();

    window.SendDataToChatbot = function (dataToSend) {
        const iframeComponent = document.getElementById(helloChatbotManager.elements.chatbotIframeComponent);

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
        if (this.helloProps.isMobileSDK) {
            sendDataToMobileSDK({ type: 'data', data: dataToSend })
        }

        // Handle parent container changes
        if ('parentId' in dataToSend) {
            helloChatbotManager.state.tempDataToSend = {
                ...helloChatbotManager.state.tempDataToSend,
                ...dataToSend
            };
            const previousParentId = helloChatbotManager.props['parentId'];
            const existingParent = document.getElementById(previousParentId);

            if (existingParent?.contains(helloChatbotManager.parentContainer)) {
                if (previousParentId !== dataToSend.parentId) {
                    if (previousParentId) {
                        if (existingParent && helloChatbotManager.parentContainer && existingParent.contains(helloChatbotManager.parentContainer)) {
                            existingParent.removeChild(helloChatbotManager.parentContainer);
                        }
                    } else if (helloChatbotManager.parentContainer && document.body.contains(helloChatbotManager.parentContainer)) {
                        document.body.removeChild(helloChatbotManager.parentContainer);
                    }
                    helloChatbotManager.updateProps({ parentId: dataToSend.parentId });
                    helloChatbotManager.changeContainer(dataToSend.parentId || '');
                }
            } else {
                helloChatbotManager.updateProps({ parentId: dataToSend.parentId });
                helloChatbotManager.changeContainer(dataToSend.parentId || '');
            }
        }

        // Process other properties
        helloChatbotManager.processDataProperties(dataToSend, iframeComponent);
    };

    // Helper function to send messages to the iframe
    function sendMessageToChatbot(messageObj) {
        const iframeComponent = document.getElementById(helloChatbotManager.elements.chatbotIframeComponent);
        if (iframeComponent?.contentWindow) {
            iframeComponent?.contentWindow?.postMessage(messageObj, '*');
        }
    }

    function sendDataToMobileSDK(messageObj) {
        if (window.postMessage) {
            window.postMessage(JSON.stringify(messageObj))
        }
    }

    window.reloadChats = () => {
        sendMessageToChatbot({ type: 'refresh', reload: true });
    };

    window.askAi = (data) => {
        sendMessageToChatbot({ type: 'askAi', data: data || "" });
    };

    // Initialize the widget function
    window.initChatWidget = (data, delay = 0) => {
        if (block_chatbot) return;
        if (data.urlsToOpenInIFrame) {
            helloChatbotManager.addUrlMonitor(data);
        }
        if (data) {
            helloChatbotManager.helloProps = { ...data };
            if ('hide_launcher' in data) {
                helloChatbotManager.hideHelloIcon = data.hide_launcher || false;
            }
            if ('launch_widget' in data) {
                helloChatbotManager.helloLaunchWidget = data.launch_widget || false;
            }
        }
        setTimeout(() => {
            helloChatbotManager.state.delayElapsed = true;
            helloChatbotManager.showIconIfReady(); // Check if both conditions are met
        }, delay);
    };

    // Create chatWidget object with all widget control functions
    window.chatWidget = {
        addCustomData: (data) => sendMessageToChatbot({ type: "UPDATE_USER_DATA_SEGMENTO", data }),
        modifyCustomData: (data) => sendMessageToChatbot({ type: "UPDATE_USER_DATA_SEGMENTO", data }),
        addUserEvent: (data) => sendMessageToChatbot({ type: "ADD_USER_EVENT_SEGMENTO", data }),
        open: () => helloChatbotManager.openChatbot(),
        close: () => helloChatbotManager.closeChatbot(),
        hide: () => {
            helloChatbotManager.hideChatbotWithIcon();
        },
        show: () => {
            helloChatbotManager.showChatbotIcon();
        },
        toggleWidget: () => {
            const iframeContainer = document.getElementById(helloChatbotManager.elements.chatbotIframeContainer);
            if (iframeContainer?.style?.display === 'block') {
                helloChatbotManager.closeChatbot();
            } else {
                helloChatbotManager.openChatbot();
            }
        }
    };

    helloChatbotManager.initializeChatbot();
})();