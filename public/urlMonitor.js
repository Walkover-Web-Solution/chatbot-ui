;(function () {
    // === Global Variables ===
    let trackedUrls = [];
    let isManualNavigation = false;
    let iframeContainer = null;
    let closeButton = null;
    let fullscreenButton = null;
    let currentIframe = null;
    const debugMode = false;

    // === Default Iframe Styling ===
    let iframeConfig = {
        width: '50%',
        height: '100%',
        position: 'fixed',
        top: '0',
        right: '0',
        zIndex: '10000',
        border: 'none',
        borderRadius: '0px',
        backgroundColor: 'transparent',
        boxShadow: 'none'
    };

    // === Initialize with Tracked URLs and Custom Iframe Styling ===
    window.chatWidget = {
        ...window.chatWidget,
        initUrlTracker: function (config) {
            trackedUrls = config.urls || [];
            iframeConfig = { ...iframeConfig, ...(config.iframeConfig || {}) };
        }
    };

    // === URL Match Checker ===
    function shouldTrackUrl(url) {
        if (!url) return false;

        try {
            const testUrl = new URL(url, window.location.origin);
            const currentOrigin = new URL(window.location.href).origin;

            return trackedUrls.some(tracked => {
                if (tracked.startsWith('/')) return testUrl.pathname === tracked;
                if (tracked.startsWith('http'))
                    return testUrl.href === tracked || testUrl.href === new URL(tracked, currentOrigin).href;
                return testUrl.href === new URL(tracked, currentOrigin).href;
            });
        } catch {
            return trackedUrls.includes(url);
        }
    }

    // === Iframe Management ===
    function createIframe(url) {
        if (!iframeContainer) buildIframeContainer();

        try {
            currentIframe.src = new URL(url, window.location.origin).href;
        } catch {
            currentIframe.src = url;
        }

        iframeContainer.style.display = 'block';
        if (debugMode) console.log('Iframe loaded with:', url);
    }

    function closeIframe() {
        if (iframeContainer) iframeContainer.style.display = 'none';
        if (debugMode) console.log('Iframe hidden');
    }

    function handleEscKey(event) {
        if (event.key === 'Escape') closeIframe();
    }

    // === Build Iframe UI Elements ===
    function buildIframeContainer() {
        iframeContainer = document.createElement('div');
        iframeContainer.style.cssText = `
            position: ${iframeConfig.position};
            top: ${iframeConfig.top};
            right: ${iframeConfig.right};
            width: ${iframeConfig.width};
            height: ${iframeConfig.height};
            z-index: ${iframeConfig.zIndex};
            border: ${iframeConfig.border};
            border-radius: ${iframeConfig.borderRadius};
            background-color: ${iframeConfig.backgroundColor};
            box-shadow: ${iframeConfig.boxShadow};
            display: none;
        `;

        // Close Button
        closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.title = 'Close';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            background-color: #ff4444;
            color: white;
            font-size: 16px;
            cursor: pointer;
            z-index: ${parseInt(iframeConfig.zIndex) + 1};
        `;
        closeButton.addEventListener('click', closeIframe);

        // Fullscreen Button
        fullscreenButton = document.createElement('button');
        fullscreenButton.innerHTML = '⛶';
        fullscreenButton.title = 'Open in new tab';
        fullscreenButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 50px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            background-color: #007bff;
            color: white;
            font-size: 14px;
            cursor: pointer;
            z-index: ${parseInt(iframeConfig.zIndex) + 1};
        `;
        fullscreenButton.addEventListener('click', () => {
            isManualNavigation = true;
            window.open(currentIframe.src, '_blank');
        });

        // Iframe
        currentIframe = document.createElement('iframe');
        currentIframe.allowTransparency = true;
        currentIframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: 1px solid rgba(0, 0, 0, 0.2);
            background-color: transparent;
        `;

        document.addEventListener('keydown', handleEscKey);
        iframeContainer.addEventListener('click', e => e.stopPropagation());

        iframeContainer.appendChild(closeButton);
        iframeContainer.appendChild(fullscreenButton);
        iframeContainer.appendChild(currentIframe);
        document.body.appendChild(iframeContainer);
    }

    // === Link Click Handler ===
    function handleTrackedUrl(url, element, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (debugMode) {
            console.log('Tracked URL clicked:', { url, element, event: event?.type || 'programmatic' });
        }
        createIframe(url);
    }

    // === Global Click Listener ===
    document.addEventListener('click', function (event) {
        let url = null;
        let element = null;

        const anchor = event.target.closest('a');
        const dataUrlEl = event.target.closest('[data-url]');
        const onClickEl = event.target.closest('[onclick]');

        if (anchor?.href) {
            url = anchor.href;
            element = anchor;
        } else if (dataUrlEl?.dataset.url) {
            url = dataUrlEl.dataset.url;
            element = dataUrlEl;
        } else if (onClickEl) {
            const onClickContent = onClickEl.onclick?.toString() || onClickEl.getAttribute('onclick') || '';
            const patterns = [
                /(?:window\.open|window\.location|location\.(?:href|assign|replace))\s*\(\s*['"`](.*?)['"`]/,
                /['"`](https?:\/\/[^'"\s]*|\.?\/[^'"\s]*)['"`]/,
                /(?:window\.open|location\.assign)\s*\(\s*(['"`])(.*?)\1/
            ];

            for (const regex of patterns) {
                const match = onClickContent.match(regex);
                if (match) {
                    const potentialUrl = match[match.length - 1];
                    if (potentialUrl?.match(/^(http|\/|\.\/)/)) {
                        url = potentialUrl;
                        element = onClickEl;
                        break;
                    }
                }
            }
        }

        if (url && shouldTrackUrl(url)) {
            handleTrackedUrl(url, element, event);
        }
    }, true);

    // === Overriding Navigation APIs ===
    const originalPushState = history.pushState;
    history.pushState = function (state, title, url) {
        if (!isManualNavigation && url && shouldTrackUrl(url)) {
            createIframe(url);
            return;
        }
        return originalPushState.apply(this, arguments);
    };

    const originalWindowOpen = window.open;
    window.open = function (url, target, features) {
        if (!isManualNavigation && shouldTrackUrl(url)) {
            createIframe(url);
            return null;
        }
        isManualNavigation = false;
        return originalWindowOpen.call(this, url, target, features);
    };

    const originalAssign = Location.prototype.assign;
    Location.prototype.assign = function (url) {
        if (!isManualNavigation && shouldTrackUrl(url)) {
            createIframe(url);
            return;
        }
        isManualNavigation = false;
        return originalAssign.call(this, url);
    };

    const originalReplace = window.location.replace;
    window.location.replace = function (url) {
        if (!isManualNavigation && shouldTrackUrl(url)) {
            createIframe(url);
            return;
        }
        return originalReplace.call(window.location, url);
    };
    

    // === MutationObserver for Dynamic DOM Changes ===
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const elements = [node, ...node.querySelectorAll('a, [data-url], [onclick]')];
                    elements.forEach(el => {
                        if (el.tagName === 'A' && shouldTrackUrl(el.href)) {
                            el.addEventListener('click', e => handleTrackedUrl(el.href, el, e));
                        }
                    });
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
