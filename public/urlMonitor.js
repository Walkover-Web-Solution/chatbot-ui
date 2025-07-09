(function () {
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
    toolbar.style.justifyContent = 'flex-end';
    toolbar.style.padding = '0 8px';
    toolbar.style.borderBottom = '1px solid #ddd';
    toolbar.style.gap = '14px';

    // Buttons
    const btnClose = document.createElement('button');
    btnClose.textContent = '×';
    btnClose.title = 'Close';
    btnClose.style.fontSize = '24px';
    btnClose.style.border = 'none';
    btnClose.style.background = 'none';
    btnClose.style.cursor = 'pointer';
    btnClose.style.color = 'red';

    const btnFullscreen = document.createElement('button');
    btnFullscreen.textContent = '⛶';
    btnFullscreen.title = 'Fullscreen';
    btnFullscreen.style.fontSize = '18px';
    btnFullscreen.style.border = 'none';
    btnFullscreen.style.background = 'none';
    btnFullscreen.style.cursor = 'pointer';
    btnFullscreen.style.color = "black";

    const btnRedirect = document.createElement('button');
    btnRedirect.textContent = '↗';
    btnRedirect.title = 'Open in new tab';
    btnRedirect.style.fontSize = '18px';
    btnRedirect.style.border = 'none';
    btnRedirect.style.background = 'none';
    btnRedirect.style.cursor = 'pointer';
    btnRedirect.style.color = 'black';

    const loader = document.createElement('div');
    loader.style.position = 'absolute';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.padding = '10px 20px';
    loader.style.zIndex = '1000000';
    loader.textContent = 'Loading...';
    loader.style.display = 'none';

    toolbar.appendChild(btnRedirect);
    toolbar.appendChild(btnFullscreen);
    toolbar.appendChild(btnClose);

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

    let isFullscreen = false;

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
        if (isFullscreen) toggleFullscreen();
    }

    function toggleFullscreen() {
        if (!isFullscreen) {
            panel.style.transition = 'width 0.3s ease, height 0.3s ease, top 0.3s ease, right 0.3s ease, border-radius 0.3s ease';
            panel.style.width = '100vw';
            panel.style.height = '100vh';
            panel.style.top = '0';
            panel.style.right = '0';
            panel.style.borderRadius = '0';
            isFullscreen = true;
            btnFullscreen.textContent = '🗗'; // change icon to indicate exit fullscreen
            btnFullscreen.title = 'Exit fullscreen';
        } else {
            panel.style.transition = 'width 0.3s ease, height 0.3s ease, border-radius 0.3s ease';
            panel.style.width = 'calc(min(768px, 100%))';
            panel.style.height = '100vh';
            panel.style.borderRadius = '12px 0 0 12px';
            isFullscreen = false;
            btnFullscreen.textContent = '⛶';
            btnFullscreen.title = 'Fullscreen';
        }
    }

    btnClose.onclick = closePanel;
    btnFullscreen.onclick = toggleFullscreen;
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
            const fullUrl = parsedUrl.href;
            const path = parsedUrl.pathname;

            return trackedUrls.some(prefix => {
                try {
                    // Handle full URLs (like https://nextjs.org/)
                    if (prefix.match(/^https?:\/\//)) {
                        // For full URLs, check if the URL starts with the prefix
                        return fullUrl === prefix || fullUrl.startsWith(prefix);
                    }

                    const prefixUrl = new URL(prefix, window.location.origin);

                    if (prefixUrl.origin === parsedUrl.origin) {
                        // Match exact path or deeper sub-paths only
                        return path === prefixUrl.pathname || path.startsWith(prefixUrl.pathname + '/');
                    }
                } catch {
                    // prefix is relative path or something else
                    if (prefix.startsWith('/')) {
                        return path === prefix || path.startsWith(prefix + '/');
                    }
                    // fallback for anything else (e.g. full URLs without trailing slash)
                    return fullUrl === prefix || fullUrl.startsWith(prefix);
                }
                return false;
            });
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