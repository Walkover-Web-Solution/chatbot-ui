/* eslint-disable */
// IIFE Scope ( for avoiding global scope pollution )
(function () {
    if (window.__HELLO_WIDGET_LOADED__) {
        console.warn('[Hello Widget] Script already loaded. Skipping second initialization.');
        return;
    }
    window.__HELLO_WIDGET_LOADED__ = true;
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
                unReadMsgCountBadge: `${this.prefix}unread-msg-count-badge`,
                starterQuestionContainer: `${this.prefix}starter-question-container`,
            }
            this.props = {};
            this.helloProps = null;
            this.parentContainer = null;
            this.hideHelloIcon = null;
            this.helloLaunchWidget = null;
            this.config = {
                type: 'popup',
                height: 'min(724px, calc(100% - 40px))',
                heightUnit: '',
                width: '440',
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
                urlMonitorAdded: false,
                chatbotSize: 'NORMAL'
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
        <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #A9A9A9; border-radius: 50%; box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);">
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

            const badgeElement = document.createElement('span');
            badgeElement.id = this.elements.unReadMsgCountBadge;
            badgeElement.className = 'hello-badge-count';
            badgeElement.textContent = ''; // Will be populated dynamically
            imgElement.appendChild(badgeElement);

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
            // Remove elements by ID
            try {
                [this.elements.chatbotIframeContainer, this.elements.chatbotIconContainer, this.elements.chatbotStyle, this.elements.starterQuestionContainer, 'CBParentScript']
                    .forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.remove();
                    });
                // Allow fresh initialization if the script is injected again
                window.__HELLO_WIDGET_LOADED__ = false;
            } catch (e) {
                // ignore cleanup errors
            }
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
                case 'MINIMIZE_CHATBOT':
                    this.minimizeChatbot()
                    break;
                case 'CLOSE_CHATBOT':
                    this.closeChatbot();
                    break;
                case 'OPEN_CHATBOT':
                    this.openChatbot();
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
                            if (this.helloLaunchWidget) return;
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
                case 'SET_BADGE_COUNT':
                    this.updateBadgeCount(data?.badgeCount);
                    break;
                case 'SHOW_STARTER_QUESTION':
                    this.createAndShowStarterQuestion(data?.message, data?.options);
                    break;
                case 'HIDE_STARTER_QUESTION':
                    this.hideStarterQuestion();
                    break;
                case 'RELOAD_PARENT':
                    // window.location.reload()
                    break;
                case 'REDIRECT_URL':
                    this.redirectUrl(data);
                    break;
                default:
                    break;
            }
        }

        minimizeChatbot() {
            if (window.innerWidth < 600) { this.closeChatbot(); return; };
            this.state.chatbotSize = 'MINIMIZED';
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
            this.state.fullscreen = false;
            if (iframeContainer) {
                iframeContainer.style.transition = 'width 0.3s ease-in-out, height 0.3s ease-in-out';
                iframeContainer.classList.remove('full-screen-without-border');
                iframeContainer.style.height = 'min(60px, calc(100% - 40px))';

                const parentContainer = document.getElementById(this.helloProps.parentId);
                // Check if chatbot is in a parent container
                if (this.helloProps?.parentId && parentContainer) {
                    // When in parent container, minimize to a small portion of parent
                    iframeContainer.style.position = 'absolute';
                    iframeContainer.style.bottom = '0';        // Stick to bottom
                    iframeContainer.style.top = 'auto';        // Don't use top positioning
                    iframeContainer.style.left = '0';          // Full width from left
                    iframeContainer.style.right = '0';         // Full width to right
                    iframeContainer.style.width = '100%';
                } else {
                    // Original popup behavior when no parentId
                    iframeContainer.style.width = '280';
                }
            }
            const launcherContainer = document.getElementById(this.elements.chatbotIconContainer);
            if (launcherContainer) {
                launcherContainer.style.display = 'none';
            }
        }

        updateBadgeCount(data) {
            const badgeElement = document.getElementById(this.elements.unReadMsgCountBadge);
            if (badgeElement) {
                if (!data || parseInt(data) === 0) {
                    badgeElement.style.display = 'none';
                } else {
                    badgeElement.textContent = data;
                    badgeElement.style.display = 'block'; // or 'block' depending on your layout
                }
            }
        }

        handlePushNotification(data) {
            const message_type = data.message_type;
            //const message_type = 'Custom';            

            // Create the modal container
            const modalContainer = document.createElement('div');
            modalContainer.classList.add('notification-modal');

            // Create close button (cross icon)
            const loader = document.createElement('div');
            loader.innerHTML = 'Loading...';
            loader.classList.add('msg-push-loader');

            // Add the close button to the modal container after content            
            modalContainer.appendChild(loader);

            const iframe = document.createElement('iframe');
            iframe.classList.add('msg-push-hide');

            if (message_type === 'Popup') {
                // Create a full-screen transparent overlay                
                const overlay = document.createElement('div');
                overlay.id = 'notification-overlay';
                overlay.classList.add('notification-overlay');

                // Create close button (cross icon)
                const closeButton = document.createElement('div');
                closeButton.innerHTML = '&times;';
                closeButton.classList.add('notification-close-btn');

                modalContainer.appendChild(closeButton);

                // Add click event to close button
                closeButton.addEventListener('click', () => {
                    this.removeNotification(overlay);
                });

                // Set position classes based on horizontal and vertical position values
                const horizontalPosition = data.horizontal_position || 'center';
                const verticalPosition = data.vertical_position || 'center';

                // Add position classes
                overlay.classList.add(`h-${horizontalPosition}`, `v-${verticalPosition}`);

                modalContainer.appendChild(iframe);

                // Append the modal to the overlay
                overlay.appendChild(modalContainer);

                // Append the overlay to the body
                document.body.appendChild(overlay);

                // Once the iframe is added to the DOM, we can access its document
                setTimeout(() => {
                    // Get reference to the iframe's document
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                    // Set iframe.onload handler BEFORE writing content to avoid missing the load event
                    iframe.onload = function () {
                        iframe.classList.remove('msg-push-hide');
                        loader.classList.add('msg-push-hide');
                        const body = iframeDoc.body;

                        //without this scroller may seen
                        body.style.setProperty('height', 'auto', 'important');
                        body.style.setProperty('min-height', 'auto', 'important');
                        body.style.setProperty('max-height', 'none', 'important');
                        body.style.setProperty('line-height', 'normal', 'important');

                        let height = 0, width = 0, top = 0, bgFound = false;
                        const position = ['absolute', 'relative', 'fixed'];
                        if (body.children.length) {
                            for (let i = 0; i < body.children.length; i++) {
                                const el = body.children[i];
                                height += el.getBoundingClientRect().height;
                                if (position.includes(getComputedStyle(el).position) && el.getBoundingClientRect().top > 0) {
                                    const combinedHeight = el.getBoundingClientRect().height + el.getBoundingClientRect().top;
                                    if (height < combinedHeight) {
                                        height = combinedHeight;
                                    }
                                    top = el.getBoundingClientRect().top;
                                }
                                if (width < el.getBoundingClientRect().width) {
                                    width = el.getBoundingClientRect().width;
                                }
                                const computedStyle = getComputedStyle(el);
                                const bgColor = computedStyle.backgroundColor;
                                const bgImage = computedStyle.backgroundImage;

                                // Check if element has a visible background (not transparent/none)
                                if ((bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') ||
                                    (bgImage && bgImage !== 'none')) {
                                    bgFound = true;
                                }
                            }

                            if (body.getBoundingClientRect().height > height) {
                                height = body.getBoundingClientRect().height;
                            }

                            if (body.getBoundingClientRect().width > width) {
                                width = body.getBoundingClientRect().width;
                            }
                        } else {
                            height += body.getBoundingClientRect().height;
                            width += body.getBoundingClientRect().width;
                            const bodyComputedStyle = getComputedStyle(body);
                            const bodyBgColor = bodyComputedStyle.backgroundColor;
                            const bodyBgImage = bodyComputedStyle.backgroundImage;

                            // Check if body has a visible background (not transparent/none)
                            if ((bodyBgColor && bodyBgColor !== 'rgba(0, 0, 0, 0)' && bodyBgColor !== 'transparent') ||
                                (bodyBgImage && bodyBgImage !== 'none')) {
                                bgFound = true;
                            }
                        }

                        if (window.innerHeight < height) {
                            overlay.classList.remove(`v-${verticalPosition}`);
                        }

                        iframe.style.width = `${width}px`;
                        iframe.style.top = `${top}px`;
                        iframe.style.position = 'relative';
                        iframe.style.border = 'none';

                        iframe.style.height = (height < 32) ? '36px' : `${height}px`;
                        modalContainer.style.height = `${height}px`;

                        setTimeout(() => {
                            //bad hack to fix height issue iframe.onload is not working properly
                            height = body.getBoundingClientRect().height;
                            iframe.style.height = (height < 32) ? '36px' : `${height}px`;
                            modalContainer.style.height = `${height}px`;
                        }, 1000);

                        if (!bgFound) {
                            body.style.backgroundColor = '#ffffff';
                        }
                    };

                    // Build complete HTML content with stylesheet if needed
                    let htmlContent = '<!DOCTYPE html><html><head>';
                    if (this.urls && this.urls.styleSheet) {
                        htmlContent += `<link rel="stylesheet" href="${this.urls.styleSheet}" type="text/css">`;
                    }
                    htmlContent += `</head><body>${data.content}</body></html>`;

                    // Write complete content in one operation
                    iframeDoc.open();
                    iframeDoc.write(htmlContent);
                    iframeDoc.close();
                }, 0);
            }

            if (message_type?.toLowerCase() === 'custom') {
                // Close popup when pressing ESC key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.removeNotification(modalContainer);
                    }
                });

                iframe.style.height = '100vh';
                iframe.style.width = '100vw';                
                modalContainer.appendChild(iframe);
                document.body.appendChild(modalContainer);

                // Get reference to the iframe's document
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                // Set iframe.onload handler BEFORE writing content to avoid missing the load event
                iframe.onload = function () {
                    iframe.classList.remove('msg-push-hide');
                    loader.classList.add('msg-push-hide');
                    const body = iframeDoc.body;

                    let height = 0,
                        width = 0,
                        top = 0,
                        bottom = null,
                        left = null,
                        right = null,
                        paddingTop = 0,
                        paddingBottom = 0,
                        position = 'fixed';

                    for (let i = 0; i < body.children.length; i++) {
                        const el = body.children[i];
                        if (el.tagName.toLowerCase() === 'script' || el.tagName.toLowerCase() === 'style') {
                            continue;
                        }
                        const rect = el.getBoundingClientRect();
                        // Use inline styles if set, otherwise use computed styles                        
                        top = !isNaN(parseFloat(getComputedStyle(el).top)) ? parseFloat(getComputedStyle(el).top) : rect.top;
                        bottom = !isNaN(parseFloat(getComputedStyle(el).bottom)) ? parseFloat(getComputedStyle(el).bottom) : rect.bottom;
                        left = !isNaN(parseFloat(getComputedStyle(el).left)) ? parseFloat(getComputedStyle(el).left) : rect.left;
                        right = !isNaN(parseFloat(getComputedStyle(el).right)) ? parseFloat(getComputedStyle(el).right) : rect.right;
                        paddingTop = parseFloat(getComputedStyle(el).paddingTop);
                        paddingBottom = parseFloat(getComputedStyle(el).paddingBottom);

                        height += parseFloat(getComputedStyle(el).height) + paddingTop + paddingBottom;
                        width += parseFloat(getComputedStyle(el).width);

                        height = Math.max(height, rect.height);
                        width = Math.max(width, rect.width);

                        height += paddingTop + paddingBottom;
                        console.log('top', top, 'bottom', bottom);
                        top = top > bottom ? 'unset' : top < 0 ? 0 : top;
                        bottom = bottom > top ? 'unset' : bottom < 0 ? 0 : bottom;
                        left = left > right ? 'unset' : left < 0 ? 0 : left;
                        right = right > left ? 'unset' : right < 0 ? 0 : right;

                        const style = window.getComputedStyle(el);
                        const boxShadow = style.boxShadow;
                        if (boxShadow && boxShadow !== 'none') {
                            height += 40;
                            width += 40;
                        }
                    }

                    modalContainer.style.width = `${width}px`;
                    modalContainer.style.height = `${height}px`;
                    modalContainer.style.position = position;
                    modalContainer.style.top = `${top}px`;
                    modalContainer.style.bottom = `${bottom}px`;
                    modalContainer.style.left = `${left}px`;
                    modalContainer.style.right = `${right}px`;
                    modalContainer.style.zIndex = '9999';

                    iframe.style.width = `${width}px`;
                    iframe.style.height = `${height}px`;
                    iframe.style.border = 'none';
                    body.style.height = `auto`;
                    body.style.minHeight = `auto`;
                };

                // Write complete content in one operation
                iframeDoc.open();
                iframeDoc.write(data.content);
                iframeDoc.close();
            }
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
            if (this.helloProps?.isMobileSDK) {
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
            if (this.helloProps?.isMobileSDK) {
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
                    if (this.state.chatbotSize === 'NORMAL') {
                        if (width < 600) {
                            iframeParentContainer.style.height = '100%';
                            iframeParentContainer.style.width = '100%';
                            iframeParentContainer.classList.add('hello-full-screen-interfaceEmbed')
                        } else {
                            this.applyConfig(this?.props?.config || {});
                            iframeParentContainer.classList.remove('hello-full-screen-interfaceEmbed');
                        }
                    }
                } else {
                    iframeParentContainer.style.height = '100%';
                    iframeParentContainer.style.width = '100%';
                    iframeParentContainer.classList.add('hello-full-screen-interfaceEmbed')
                }
            });

            iframeObserver.observe(document.documentElement);
        }

        openChatbot() {
            if (this.state?.chatbotSize !== 'NORMAL') {
                this.toggleFullscreen(false);
            }
            const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
            const openMessage = { type: 'open', data: {} };

            if (interfaceEmbed && iframeContainer) {
                interfaceEmbed.style.display = 'none';
                iframeContainer.style.display = 'block';

                // Set initial state for bottom-right to top-left animation
                iframeContainer.style.opacity = 0;
                iframeContainer.style.transform = 'scale(0)';
                iframeContainer.style.transformOrigin = 'bottom right';
                iframeContainer.style.transition = 'opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                requestAnimationFrame(() => {
                    iframeContainer.style.opacity = 1;
                    iframeContainer.style.transform = 'scale(1)';
                });
            }

            if (window.parent) {
                window.parent.postMessage?.(openMessage, '*');
            }
            if (this.helloProps?.isMobileSDK) {
                sendDataToMobileSDK(openMessage)
            }

            const iframeComponent = document.getElementById(this.elements.chatbotIframeComponent);
            iframeComponent?.contentWindow?.postMessage(openMessage, '*');
            sendMessageToChatbot({ type: "CHATBOT_OPEN" })
        }

        closeChatbot() {
            if (this.helloProps?.isMobileSDK) {
                sendDataToMobileSDK({ type: 'close', data: {} })
                return
            }
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);

            if (iframeContainer?.style?.display === 'block') {
                iframeContainer.style.transition = 'opacity 0.2s ease-in-out';
                iframeContainer.style.opacity = 0;

                // Send message to parent window normally, but stringify for ReactNativeWebView
                if (window.parent) {
                    window.parent.postMessage?.({ type: 'close', data: {} }, '*');
                }

                iframeContainer.style.display = 'none';
                // document.body.style.overflow = 'auto';

                const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
                if (interfaceEmbed) {
                    interfaceEmbed.style.display =
                        (this.props.hide_launcher === true || this.props.hide_launcher === 'true' || this.hideHelloIcon || this.helloProps?.hide_launcher === true || this.helloProps?.hide_launcher === 'true' || helloChatbotManager.helloProps?.isMobileSDK)
                            ? 'none'
                            : 'unset';
                }
                if (this.state?.chatbotSize !== 'NORMAL') {
                    this.toggleFullscreen(false);
                }
                sendMessageToChatbot({ type: "CHATBOT_CLOSE" })
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
                    this.state.chatbotSize = 'NORMAL';
                    iframeContainer.classList.remove('full-screen-without-border');
                    const parentContainer = document.getElementById(this.helloProps.parentId);
                    if (this.helloProps?.parentId && parentContainer) {
                        // Restore to full parent container size
                        iframeContainer.style.height = '100%';
                        iframeContainer.style.width = '100%';
                        iframeContainer.classList.add('full-screen-without-border');
                    } else {
                        iframeContainer.style.height = `${this.props?.config?.height}${this.props?.config?.heightUnit || ''}` || '70vh';
                        iframeContainer.style.width = `${this.props?.config?.width}${this.props?.config?.widthUnit || ''}` || '40vw';
                    }
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
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation');
            iframe.allow = 'microphone *; camera *; midi *; encrypted-media *';

            this.parentContainer.appendChild(iframe);

            const parentId = this.helloProps?.parentId || '';
            this.changeContainer(parentId, this.parentContainer);
        }

        changeContainer(parentId, parentContainer = this.parentContainer) {
            const container = parentId && document.getElementById(parentId);
            if (!parentContainer) return;
            if (container) {
                container.style.position = 'relative';
                parentContainer.style.position = 'absolute';

                // Reset positioning to fill entire parent container
                parentContainer.style.top = '0';
                parentContainer.style.left = '0';
                parentContainer.style.bottom = 'auto';
                parentContainer.style.right = 'auto';
                parentContainer.style.margin = '0';
                parentContainer.style.padding = '0';
                parentContainer.style.borderRadius = '0';
                // Set full size when moving to parent container
                parentContainer.style.height = '100%';
                parentContainer.style.width = '100%';

                container.appendChild(parentContainer);
            } else {
                // Reset to original popup positioning and dimensions
                parentContainer.style.position = 'fixed';
                parentContainer.style.bottom = '10px';
                parentContainer.style.right = '10px';
                parentContainer.style.top = 'auto';
                parentContainer.style.left = 'auto';
                parentContainer.style.margin = '0';
                parentContainer.style.padding = '0';
                parentContainer.style.borderRadius = '12px';
                // Apply original config dimensions
                const config = this.props?.config || this.config;
                const isFunctionalHeight = config.height?.includes('(');
                parentContainer.style.height = isFunctionalHeight
                    ? config.height
                    : `${config.height}${config.heightUnit || ''}` || '70vh';
                parentContainer.style.width = `${config?.width}${config?.widthUnit || ''}` || '40vw';
                // Reset parentId in props since container doesn't exist
                // this.updateProps({ parentId: null });               
                document.body.appendChild(parentContainer);
            }
        }

        attachIconEvents(chatBotIcon) {
            const children = chatBotIcon.querySelectorAll('*'); // Select all descendant elements
            children.forEach(child => {
                child.addEventListener('click', () => helloChatbotManager.openChatbot());
            });
        }

        createAndShowStarterQuestion(questionText, options = []) {
            // Check if starter question already exists
            let starterQuestionContainer = document.getElementById(this.elements.starterQuestionContainer);

            if (!starterQuestionContainer) {
                // Get the chat bot icon container
                const chatBotIcon = document.getElementById(this.elements.chatbotIconContainer);
                if (!chatBotIcon) return;

                // Create starter question container
                starterQuestionContainer = document.createElement('div');
                starterQuestionContainer.id = this.elements.starterQuestionContainer;
                starterQuestionContainer.className = 'hello-starter-question';

                // Add starter question content
                const starterQuestionBubble = document.createElement('div');
                starterQuestionBubble.className = 'hello-starter-question-bubble';

                // Only create question text div if questionText is valid (not null, undefined, or empty)
                if (questionText && questionText.trim() !== '') {
                    const starterQuestionText = document.createElement('span');
                    starterQuestionText.className = 'hello-starter-question-text';
                    starterQuestionText.textContent = questionText;
                    starterQuestionBubble.appendChild(starterQuestionText);

                    // Add event listeners for starter question text
                    starterQuestionText.addEventListener('click', () => {
                        helloChatbotManager.openChatbot();
                        helloChatbotManager.hideStarterQuestion();
                    });
                }

                const starterQuestionClose = document.createElement('button');
                starterQuestionClose.className = 'hello-starter-question-close';
                starterQuestionClose.innerHTML = '×';
                starterQuestionClose.setAttribute('aria-label', 'Close starter question');

                starterQuestionBubble.appendChild(starterQuestionClose);
                starterQuestionContainer.appendChild(starterQuestionBubble);

                if (options && options.length > 0) {
                    const optionsContainer = document.createElement('div');
                    optionsContainer.className = 'hello-starter-question-options';

                    options.forEach((option, index) => {
                        const optionElement = document.createElement('button'); // use <button> for semantics and accessibility
                        optionElement.className = 'hello-starter-question-option';
                        optionElement.setAttribute('data-option-index', index);
                        optionElement.textContent = option;

                        // Reveal one-by-one with delay
                        setTimeout(() => {
                            optionElement.style.opacity = '1';
                        }, index * 150); // 150ms delay per option

                        optionElement.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Send the new event for starter question option click
                            sendMessageToChatbot({ type: 'STARTER_QUESTION_OPTION_CLICKED', data: { option: option } });
                            helloChatbotManager.openChatbot();
                            helloChatbotManager.hideStarterQuestion();
                        });

                        optionsContainer.appendChild(optionElement);
                    });

                    starterQuestionContainer.appendChild(optionsContainer);
                }
                // Append to chat bot icon
                chatBotIcon.prepend(starterQuestionContainer);

                starterQuestionClose.addEventListener('click', (e) => {
                    e.stopPropagation();
                    helloChatbotManager.hideStarterQuestion();
                });
            }

            // Show the starter question
            this.showStarterQuestion();
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
            // Check if parentId is provided - if yes, use full dimensions
            const isParentIdExist = this.helloProps?.parentId
            const isParentContainerExist = document.getElementById(this.helloProps?.parentId)
            if (isParentIdExist && isParentContainerExist) {
                iframeParentContainer.style.height = '100%';
                iframeParentContainer.style.width = '100%';
            } else {
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
        }

        updateProps(newProps) {
            this.helloProps = { ...this.helloProps, ...newProps };
            this.setPropValues(newProps);
        }

        setPropValues(newprops) {
            if (newprops.iconColor) {
                document.getElementById("hello-popup-interfaceEmbed").src = newprops.iconColor === 'dark' ? AI_WHITE_ICON : AI_BLACK_ICON
            } if (newprops.fullScreen === true || newprops.fullScreen === 'true') {
                document.getElementById(this.elements.chatbotIframeContainer)?.classList.add('hello-full-screen-interfaceEmbed')
            } if (newprops.fullScreen === false || newprops.fullScreen === 'false') {
                document.getElementById(this.elements.chatbotIframeContainer)?.classList.remove('hello-full-screen-interfaceEmbed')
            } if ('hide_launcher' in newprops && document.getElementById(this.elements.chatbotIconContainer)) {
                document.getElementById(this.elements.chatbotIconContainer).style.display = (newprops.hide_launcher === true || newprops.hide_launcher === 'true') ? 'none' : 'unset';
                // this.hideHelloIcon = newprops?.hide_launcher;
            } if ('hideCloseButton' in newprops && document.getElementById('hello-close-button-interfaceEmbed')) {
                document.getElementById('hello-close-button-interfaceEmbed').style.display = (newprops.hideCloseButton === true || newprops.hideCloseButton === 'true') ? 'none' : 'unset';
            }
            if ('launch_widget' in newprops && newprops.launch_widget === true || newprops.launch_widget === 'true') {
                this.helloLaunchWidget = newprops?.launch_widget
                this.openChatbot()
            }
        }

        sendInitialData() {
            if (this.helloProps) {
                sendMessageToChatbot({ type: 'helloData', data: this.helloProps });
                const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
                if (iframeContainer && iframeContainer.style?.display !== 'none') {
                    sendMessageToChatbot({ type: 'CHATBOT_OPEN' });
                }
            }
        }

        showIconIfReady() {
            if (this.state.chatbotSize !== 'NORMAL') {
                this.closeChatbot()
            }
            if (this.state.interfaceLoaded && this.state.delayElapsed) {
                const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
                if (!this.hideHelloIcon && (this.helloProps?.hide_launcher !== undefined && (this.helloProps?.hide_launcher === false || this.helloProps?.hide_launcher === 'false')) && !helloChatbotManager.helloProps?.isMobileSDK) {
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
            if (this.state?.chatbotSize !== 'NORMAL') {
                this.toggleFullscreen(false)
                this.state.chatbotSize = 'NORMAL';
            }
            this.hideHelloIcon = true;
            const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
            const iframeContainer = document.getElementById(this.elements.chatbotIframeContainer);
            if (interfaceEmbed) interfaceEmbed.style.display = 'none';
            if (iframeContainer) iframeContainer.style.display = 'none';
        }

        showChatbotIcon() {
            if (this.state?.chatbotSize !== 'NORMAL') {
                return
            }
            this.hideHelloIcon = false;
            const interfaceEmbed = document.getElementById(this.elements.chatbotIconContainer);
            if (interfaceEmbed) {
                interfaceEmbed.style.display = 'unset';
            }
        }

        showStarterQuestion() {
            const starterQuestionContainer = document.getElementById(this.elements.starterQuestionContainer);
            if (starterQuestionContainer) {
                starterQuestionContainer.style.display = 'block';
            }
        }

        hideStarterQuestion() {
            const starterQuestionContainer = document.getElementById(this.elements.starterQuestionContainer);
            if (starterQuestionContainer) {
                starterQuestionContainer.style.display = 'none';
            }
        }

        redirectUrl(data) {
            try {
                const url = data?.url;
                if (!url) {
                    console.warn('No URL provided for redirect');
                    return;
                }
                let validUrl;
                try {
                    validUrl = new URL(url);
                } catch (e) {
                    try {
                        validUrl = new URL('https://' + url);
                    } catch (e2) {
                        console.error('Invalid URL format:', url);
                        return;
                    }
                }
                window.open(validUrl.href, '_blank');
            } catch (error) {
                console.error('Error redirecting to URL:', error);
            }
        }

        updateStarterQuestionText(text) {
            const starterQuestionText = document.querySelector('.hello-starter-question-text');
            if (starterQuestionText && text) {
                starterQuestionText.textContent = text;
            }
        }

        processDataProperties = (data) => {
            // Create a props object for all UI-related properties
            const propsToUpdate = {};

            // Collect all UI properties in one object
            if ('hideCloseButton' in data) {
                propsToUpdate.hideCloseButton = data.hideCloseButton || false;
            }
            if ('hide_launcher' in data) {
                propsToUpdate.hide_launcher = data.hide_launcher || false;
                helloChatbotManager.hideHelloIcon = data.hide_launcher || false;
            }
            if ('launch_widget' in data) {
                propsToUpdate.launch_widget = data.launch_widget || false;
                helloChatbotManager.helloLaunchWidget = data.launch_widget || false;
            }
            if ('parentId' in data) {
                propsToUpdate.parentId = data.parentId || '';
            }
            if (data.iconColor) propsToUpdate.iconColor = data.iconColor || 'dark';

            // Handle starter question configuration
            if ('starter_question' in data) {
                if (data.starter_question === true || data.starter_question === 'true') {
                    const questionText = data.starter_question_text || 'How can I help you today?';
                    helloChatbotManager.createAndShowStarterQuestion(questionText);
                } else {
                    helloChatbotManager.hideStarterQuestion();
                }
            }

            if ('starter_question_text' in data && data.starter_question_text) {
                helloChatbotManager.updateStarterQuestionText(data.starter_question_text);
            }

            // Update props in a single call if we have any
            if (Object.keys(propsToUpdate).length > 0) {
                helloChatbotManager.updateProps(propsToUpdate);
            }

            // Send general data
            if (data) {
                helloChatbotManager.state.tempDataToSend = {
                    ...helloChatbotManager.state.tempDataToSend,
                    ...data
                };
                sendMessageToChatbot({ type: 'helloRunTimeData', data: data });
            }

            // Handle askAi specifically
            if (data.askAi) {
                sendMessageToChatbot({ type: 'askAi', data: data || {} });
            }

            // Handle config updates
            if ('config' in data && data.config) {
                const newConfig = { ...helloChatbotManager.config, ...data.config };
                helloChatbotManager.applyConfig(newConfig);
                helloChatbotManager.updateProps({ config: newConfig });
            }
        }

        addUrlMonitor(data) {
            if (data.previewLinks?.length > 0) {
                if (this.state.urlMonitorAdded === false) {
                    const urlTrackerScript = document.createElement('script');
                    urlTrackerScript.src = this.urls.urlMonitor;
                    urlTrackerScript.onload = () => {
                        this.state.urlMonitorAdded = true;
                        window.chatWidget.initUrlTracker({ urls: data.previewLinks });
                    };
                    document.head.appendChild(urlTrackerScript);
                } else {
                    window.chatWidget.initUrlTracker({ urls: data.previewLinks });
                }
            }
        }
    }

    const helloChatbotManager = new HelloChatbotEmbedManager();

    function SendDataToBot(dataToSend) {
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
        if (helloChatbotManager.helloProps?.isMobileSDK) {
            sendDataToMobileSDK({ type: 'data', data: dataToSend })
        }

        // Handle parent container changes
        if ('parentId' in dataToSend) {
            helloChatbotManager.state.tempDataToSend = {
                ...helloChatbotManager.state.tempDataToSend,
                ...dataToSend
            };
            helloChatbotManager.helloProps = {
                ...helloChatbotManager.helloProps,
                ...dataToSend
            }
            const previousParentId = helloChatbotManager.helloProps['parentId'];
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
        helloChatbotManager.processDataProperties(dataToSend);
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

    // Initialize the widget function
    window.initChatWidget = (data, delay = 0) => {
        if (block_chatbot) return;
        if (data.previewLinks) {
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
            if ('variables' in data) {
                sendMessageToChatbot({ type: "SET_VARIABLES_FOR_BOT", data });
            }
            // Only recreate iframe container if parentId is provided
            if (data.parentId) {
                SendDataToBot(data);
            }
        }
        setTimeout(() => {
            helloChatbotManager.state.delayElapsed = true;
            helloChatbotManager.showIconIfReady(); // Check if both conditions are met
        }, delay);
    };

    // Create chatWidget object with all widget control functions
    window.chatWidget = {
        SendDataToBot: (data) => {
            // Check if data has variables - send to iframe
            if (data && 'variables' in data) {
                sendMessageToChatbot({ type: "SET_VARIABLES_FOR_BOT", data });
            } else {
                // Handle parentId and other local operations
                SendDataToBot(data);
            }
        },
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
        },
        handlePushNotification(data) {
            helloChatbotManager.handlePushNotification(data);
        }
    };

    helloChatbotManager.initializeChatbot();
})();