(function () {
    if (window.__urlMonitorInitialized__) return;
    window.__urlMonitorInitialized__ = true;

    let trackedUrls = [];
    let ignoreNextOpen = false;  // Flag to skip interception once

    // Create iframe panel UI (hidden by default)
    const panel = document.createElement('div');
    panel.id = 'url-monitor-panel';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.right = '-100%'; // hidden offscreen initially
    panel.style.width = 'calc(min(768px, 100%))';
    panel.style.height = '100vh';
    panel.style.background = 'white';
    panel.style.borderRadius = '12px 0 0 12px';
    panel.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.2)';
    panel.style.transition = 'right 0.3s ease';
    panel.style.zIndex = '999999';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.border = '1px solid #ddd';

    // Toolbar container
    const toolbar = document.createElement('div');
    toolbar.style.flex = '0 0 40px';
    toolbar.style.display = 'flex';
    toolbar.style.alignItems = 'center';
    toolbar.style.justifyContent = 'space-between';      //for left alignment of close button and rest at right
    toolbar.style.padding = '0 14px';
    toolbar.style.borderBottom = '1px solid #ddd';
    toolbar.style.gap = '8px';

    // Buttons
    const btnClose = document.createElement('button');
    btnClose.innerHTML = '<span>×</span><span>Close</span>';
    btnClose.style.fontSize = '14px';
    btnClose.style.border = 'none';
    btnClose.style.background = 'none';
    btnClose.style.cursor = 'pointer';
    btnClose.style.color = 'red';
    btnClose.style.lineHeight = '1';  // Add consistent line-height
    btnClose.style.display = 'flex';  // Make it flex
    btnClose.style.alignItems = 'center';
    btnClose.style.gap = '6px';

    const btnRedirect = document.createElement('button');
    btnRedirect.innerHTML = '<span>↗</span><span>New tab</span>';
    btnRedirect.style.fontSize = '14px';
    btnRedirect.style.border = 'none';
    btnRedirect.style.background = 'none';
    btnRedirect.style.cursor = 'pointer';
    btnRedirect.style.color = 'black';
    btnRedirect.style.lineHeight = '1';  // Add consistent line-height
    btnRedirect.style.display = 'flex';  // Make it flex
    btnRedirect.style.alignItems = 'center';
    btnRedirect.style.gap = '6px';

    const loader = document.createElement('div');
    loader.style.position = 'absolute';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.padding = '10px 20px';
    loader.style.zIndex = '1000000';
    loader.textContent = 'Loading...';
    loader.style.display = 'none';

    toolbar.appendChild(btnClose);  // Close goes to left
    toolbar.appendChild(btnRedirect);  // new tab goes to right

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.flex = '1 1 auto';
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    panel.appendChild(toolbar);
    panel.appendChild(iframe);
    panel.appendChild(loader);

    iframe.addEventListener('load', function () {
        loader.style.display = 'none'; // Hide loader when iframe loads
    });
    document.body.appendChild(panel);

    function handleEscKey(event) {
        if (event.key === 'Escape') closePanel();
    }

    function openPanel(url) {
        loader.style.display = 'block';
        iframe.src = url;
        panel.style.right = '0';
        document.addEventListener('keydown', handleEscKey);
    }

    function closePanel() {
        iframe.src = 'about:blank';
        panel.style.right = '-100%';
        document.removeEventListener('keydown', handleEscKey);
    }

    btnClose.onclick = closePanel;
    btnRedirect.onclick = () => {
        if (iframe.src && iframe.src !== 'about:blank') {
            ignoreNextOpen = true;   // set flag to skip interception once
            window.open(iframe.src, '_blank');
            closePanel();
        }
    };

    // --- Override navigation methods ---
    function openInIframeOrNavigate(url) {
        if (shouldPrevent(url)) {
            openPanel(url);
            return true; // intercepted
        }
        return false; // not intercepted
    }

    const originalOpen = window.open;
    window.open = function (...args) {
        if (ignoreNextOpen) {
            ignoreNextOpen = false; // reset flag after skipping once
            return originalOpen.apply(window, args);
        }
        const url = args[0] || '';
        if (openInIframeOrNavigate(url)) return null;
        return originalOpen.apply(window, args);
    };

    const originalPushState = history.pushState;
    history.pushState = function (state, title, url) {
        if (openInIframeOrNavigate(url)) return;
        return originalPushState.apply(history, [state, title, url]);
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (state, title, url) {
        if (openInIframeOrNavigate(url)) return;
        return originalReplaceState.apply(history, [state, title, url]);
    };

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

        if (url && shouldPrevent(url)) {
            event.preventDefault(); // Stop normal navigation
            event.stopPropagation(); // Stop propagation to avoid triggering other click handlers
            openPanel(url);
        }
    }, true);

    document.addEventListener('submit', function (event) {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;

        // Only intercept GET method forms (you can extend for POST if needed)
        if ((form.method || 'get').toLowerCase() !== 'get') return;

        try {
            // Construct full URL with query parameters
            const formData = new FormData(form);
            const params = new URLSearchParams(formData).toString();

            // Resolve action URL relative to current location
            const actionUrl = form.action || window.location.href;
            const url = new URL(actionUrl, window.location.origin);

            // Append query string
            if (params) {
                url.search = params;
            }

            // Check if we should intercept and open in iframe
            if (shouldPrevent(url.href)) {
                event.preventDefault(); // Stop normal navigation
                openPanel(url.href);
            }
        } catch (e) {
            // On error, do nothing and allow normal submit
            console.warn('Form interception error:', e);
        }
    });

    function shouldPrevent(url) {
        if (!url || trackedUrls.length === 0) return false;

        try {
            const parsedUrl = new URL(url, window.location.origin);
            const targetPath = parsedUrl.pathname;
            const targetFullUrl = parsedUrl.href;
            const currentPath = window.location.pathname;
            const currentUrl = window.location.href;

            let targetMatchingPrefix = null;
            let currentMatchingPrefix = null;

            // Find which prefix matches each URL
            for (const prefix of trackedUrls) {
                try {
                    // Handle full URLs (like https://nextjs.org/)
                    if (prefix.match(/^https?:\/\//)) {
                        const cleanPattern = prefix.replace(/\*/g, '');
                        if (!targetMatchingPrefix) {
                            if (targetFullUrl === prefix || targetFullUrl.startsWith(cleanPattern)) {
                                targetMatchingPrefix = prefix;
                            }
                        }
                        if (!currentMatchingPrefix) {
                            if (currentUrl === prefix || currentUrl.startsWith(cleanPattern)) {
                                currentMatchingPrefix = prefix;
                            }
                        }
                    }
                    else if (prefix.includes('*')) {
                        // Handle wildcard patterns like '/faq/*'
                        if (prefix.startsWith('/')) {
                            const cleanPattern = prefix.replace(/\*/g, '');
                            if (!cleanPattern.trim()) continue;

                            // Check target URL
                            if (!targetMatchingPrefix) {
                                if (parsedUrl.origin === window.location.origin && targetPath.startsWith(cleanPattern)) {
                                    targetMatchingPrefix = prefix;
                                }
                            }

                            // Check current route (with base pattern matching)
                            if (!currentMatchingPrefix) {
                                const basePattern = cleanPattern.endsWith('/') ? cleanPattern.slice(0, -1) : cleanPattern;
                                if (currentPath === basePattern || currentPath.startsWith(basePattern + '/')) {
                                    currentMatchingPrefix = prefix;
                                }
                            }
                        } else {
                            const cleanPattern = prefix.replace(/\*/g, '');
                            if (!cleanPattern.trim()) continue;

                            if (!targetMatchingPrefix) {
                                if (targetFullUrl.includes(cleanPattern)) {
                                    targetMatchingPrefix = prefix;
                                }
                            }
                            if (!currentMatchingPrefix) {
                                if (currentUrl.includes(cleanPattern)) {
                                    currentMatchingPrefix = prefix;
                                }
                            }
                        }
                    }
                    else {
                        // Handle exact URLs and paths
                        const prefixUrl = new URL(prefix, window.location.origin);
                        if (prefixUrl.origin === parsedUrl.origin) {
                            if (!targetMatchingPrefix) {
                                if (targetPath === prefixUrl.pathname || targetPath.startsWith(prefixUrl.pathname + '/')) {
                                    targetMatchingPrefix = prefix;
                                }
                            }
                            if (!currentMatchingPrefix) {
                                if (currentPath === prefixUrl.pathname || currentPath.startsWith(prefixUrl.pathname + '/')) {
                                    currentMatchingPrefix = prefix;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Handle relative paths and fallbacks
                    if (prefix.startsWith('/')) {
                        if (!targetMatchingPrefix) {
                            if (targetPath === prefix || targetPath.startsWith(prefix + '/')) {
                                targetMatchingPrefix = prefix;
                            }
                        }
                        if (!currentMatchingPrefix) {
                            if (currentPath === prefix || currentPath.startsWith(prefix + '/')) {
                                currentMatchingPrefix = prefix;
                            }
                        }
                    } else {
                        if (!targetMatchingPrefix) {
                            if (targetFullUrl === prefix || targetFullUrl.startsWith(prefix)) {
                                targetMatchingPrefix = prefix;
                            }
                        }
                        if (!currentMatchingPrefix) {
                            if (currentPath === prefix || currentPath.startsWith(prefix)) {
                                currentMatchingPrefix = prefix;
                            }
                        }
                    }
                }
                // Early exit if both prefixes are found
                if (targetMatchingPrefix && currentMatchingPrefix) {
                    break;
                }
            }
            const targetMatches = !!targetMatchingPrefix;
            const currentMatches = !!currentMatchingPrefix;
            const samePrefix = targetMatchingPrefix === currentMatchingPrefix;
            // Prevent only if target is tracked but matches different prefix than current
            return targetMatches && (!currentMatches || !samePrefix);
        } catch {
            return false;
        }
    }

    // --- chatWidget.initUrlTracker method ---
    window.chatWidget = {
        ...window.chatWidget,
        initUrlTracker: function (config) {
            trackedUrls = Array.isArray(config.urls) ? config.urls : [];
            console.log('chatWidget.initUrlTracker set with URLs:', trackedUrls);
        }
    };
})();