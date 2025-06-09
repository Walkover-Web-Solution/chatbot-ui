(function () {
    class RagEmbedManager {
        constructor() {
            this.props = {};
            this.parentContainer = null;
            this.modalOverlay = null;
            this.documents = [];
            this.token = null;
            this.lastProcessedMessage = null; // Add this line
            this.urls = {
                ragUrl: 'https://chatbot.gtwy.ai/rag',
                login: 'https://db.gtwy.ai/user/embed/login',
                docsApi: 'https://db.gtwy.ai/rag/docs',
                cssURL: 'https://chatbot.gtwy.ai/rag.css'
            };
            this.state = {
                bodyLoaded: false,
                fullscreen: false,
                tempDataToSend: null,
                isEmbeddedInParent: false,
                showDocumentList: false,
                cachedElements: {},
                isModalOpen: false,
                isDarkTheme: false,

                themeColors: {
                    container: '#1a1a1a',
                    text: '#333',
                    textMuted: '#666',
                    textLight: '#fff',
                    button: '#667eea',
                    buttonHover: '#556dd9',
                    border: '#ccc'
                },
                messageType:{
                    success: 'success-message',
                    error: 'error-message',
                    warning: 'warning-message'
                }
            };

            this.initializeEventListeners();
        }

        loadCSS() {
            // Check if CSS is already loaded to avoid duplicates
            if (document.getElementById('rag-embed-styles')) {
                return;
            }
        
            const link = document.createElement('link');
            link.id = 'rag-embed-styles';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = this.urls.cssURL; // Uses your existing CSS URL
            document.head.appendChild(link);
        }


        createDocumentListModal() {
            // Check if there's a parent container (embedded mode)
            const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
            const parentContainer = parentId ? document.getElementById(parentId) : null;
            const isEmbedded = parentContainer && this.state.isEmbeddedInParent;
        
            // Determine theme - default to light if not specified
            const theme = this.props.theme || this.state.tempDataToSend?.theme || 'light';
        
            // Helper function to check if parent has height constraints
            const hasParentHeightConstraints = () => {
                if (!parentContainer) return false;
        
                const computedStyle = window.getComputedStyle(parentContainer);
                const inlineStyle = parentContainer.style;
        
                // Check for explicit height (not auto or empty)
                const hasExplicitHeight = (inlineStyle.height &&
                    inlineStyle.height !== '' &&
                    inlineStyle.height !== 'auto') ||
                    (computedStyle.height &&
                        computedStyle.height !== 'auto' &&
                        computedStyle.height !== '0px' &&
                        !computedStyle.height.includes('auto'));
        
                // Check for max-height constraints
                const hasMaxHeight = (inlineStyle.maxHeight &&
                    inlineStyle.maxHeight !== '' &&
                    inlineStyle.maxHeight !== 'none' &&
                    inlineStyle.maxHeight !== 'auto') ||
                    (computedStyle.maxHeight &&
                        computedStyle.maxHeight !== 'none' &&
                        computedStyle.maxHeight !== 'auto');
        
                // Also check if parent has any CSS that would constrain height
                const hasFlexConstraints = computedStyle.display === 'flex' &&
                    (computedStyle.alignItems === 'stretch' || computedStyle.height !== 'auto');
        
                return hasExplicitHeight || hasMaxHeight || hasFlexConstraints;
            };
        
            const parentHasHeightConstraints = hasParentHeightConstraints();
            // Helper function to make parent and ancestors grow with content
            const ensureParentCanGrow = () => {
                if (!parentContainer) return [];
        
                // Store original styles of ONLY the immediate parent
                const computedStyle = window.getComputedStyle(parentContainer);
                const originalStyles = {
                    element: parentContainer,
                    height: parentContainer.style.height,
                    minHeight: parentContainer.style.minHeight,
                    maxHeight: parentContainer.style.maxHeight,
                    overflow: parentContainer.style.overflow,
                    flex: parentContainer.style.flex,
                    display: parentContainer.style.display
                };
        
                // ONLY modify the immediate parent - NO LOOP, NO TRAVERSAL
                parentContainer.style.height = 'auto';
                parentContainer.style.minHeight = '';
                parentContainer.style.maxHeight = 'none';
                parentContainer.style.overflow = 'visible';
        
                // Ensure proper display
                if (!parentContainer.style.display || parentContainer.style.display === 'none') {
                    parentContainer.style.display = 'block';
                }
        
                // Handle flex containers properly
                if (computedStyle.display === 'flex' || computedStyle.display === 'inline-flex') {
                    parentContainer.style.alignItems = 'flex-start';
                    parentContainer.style.flexDirection = computedStyle.flexDirection || 'column';
                }
        
                // Set up a mutation observer to catch WHO is modifying the grandparent
                const grandparent = parentContainer.parentElement;
                if (grandparent) {
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                                // Debug logging for style changes
                            }
                        });
                    });
        
                    observer.observe(grandparent, {
                        attributes: true,
                        attributeFilter: ['style']
                    });
        
                    // Clean up observer after 5 seconds
                    setTimeout(() => observer.disconnect(), 5000);
                }
        
                return [originalStyles];
            };
        
            let listModal;
        
            if (isEmbedded) {
                // Handle parent container with explicit logging
                if (parentContainer) {
                    if (!parentHasHeightConstraints) {
                        // Store original styles for potential restoration
                        this.originalParentStyles = ensureParentCanGrow();
        
                        // Ensure parent is properly configured for growth
                        parentContainer.style.display = parentContainer.style.display || 'block';
                        parentContainer.style.position = parentContainer.style.position || 'relative';
        
                    } else {
                        // Has height constraints - FORCE container to respect them
                        parentContainer.style.overflow = 'hidden';
        
                        // Ensure box-sizing is border-box
                        if (!parentContainer.style.boxSizing) {
                            parentContainer.style.boxSizing = 'border-box';
                        }
        
                        // Preserve existing height constraints
                        const computedStyle = window.getComputedStyle(parentContainer);
                        const currentHeight = parentContainer.style.height || computedStyle.height;
                        const currentMaxHeight = parentContainer.style.maxHeight || computedStyle.maxHeight;
        
                        if (currentHeight && currentHeight !== 'auto' && currentHeight !== '') {
                            parentContainer.style.height = currentHeight;
                        }
        
                        if (currentMaxHeight && currentMaxHeight !== 'none' && currentMaxHeight !== 'auto' && currentMaxHeight !== '') {
                            parentContainer.style.maxHeight = currentMaxHeight;
                        }
                    }
                }
        
                // Create embedded div
                listModal = document.createElement('div');
                listModal.id = 'rag-document-list-modal';
                
                // Add CSS classes
                listModal.className = `modal-embedded rag-theme-${theme} ${parentHasHeightConstraints ? 'with-height-constraints' : 'no-height-constraints'}`;
        
                // Add resize observer for no height constraints mode
                if (!parentHasHeightConstraints && window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(() => {
                        // Force parent to recalculate its size
                        if (parentContainer) {
                            const event = new Event('resize');
                            parentContainer.dispatchEvent(event);
        
                            // Trigger layout recalculation
                            parentContainer.style.height = 'auto';
                            void parentContainer.offsetHeight; // Force reflow
                        }
                    });
        
                    resizeObserver.observe(listModal);
                    listModal._resizeObserver = resizeObserver;
                }
            } else {
                // Create modal overlay for popup mode
                listModal = document.createElement('div');
                listModal.id = 'rag-document-list-modal';
                listModal.className = `modal-popup rag-theme-${theme}`;
            }
        
            // Create list container
            const listContainer = document.createElement('div');
            listContainer.className = `rag-list-container ${isEmbedded ? 'embedded' : 'modal'} ${parentHasHeightConstraints && isEmbedded ? 'with-height-constraints' : 'no-height-constraints'}`;
        
            // Header
            const header = document.createElement('div');
            header.className = 'rag-modal-header';
        
            const title = document.createElement('h2');
            title.textContent = 'Knowledge Base Management';
            title.className = 'rag-modal-title';
            header.appendChild(title);
        
            // Header actions container
            const headerRight = document.createElement('div');
            headerRight.className = 'rag-header-actions';
        
            // Refresh button
            const refreshBtn = document.createElement('button');
            refreshBtn.innerHTML = '⟳';
            refreshBtn.className = 'rag-action-btn rag-refresh-btn';
            refreshBtn.title = 'Refresh Document List';
            refreshBtn.addEventListener('click', () => this.showDocumentList());
            headerRight.appendChild(refreshBtn);
        
            // Close button (only for non-embedded mode)
            if (!parentContainer) {
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.className = 'rag-action-btn rag-close-btn';
                closeBtn.addEventListener('click', () => this.closeDocumentList());
                headerRight.appendChild(closeBtn);
            }
            
            header.appendChild(headerRight);
        
            // Add Document Button
            const addBtn = document.createElement('button');
            addBtn.textContent = '+ Add New Document';
            addBtn.className = 'rag-add-btn';
            addBtn.addEventListener('click', () => this.openRag());
        
            // Documents List Container
            const documentsContainer = document.createElement('div');
            documentsContainer.id = 'rag-documents-container';
            
            // Set container scroll behavior based on constraints
            if (isEmbedded && parentHasHeightConstraints) {
                documentsContainer.className = 'scrollable';
            } else if (!isEmbedded) {
                documentsContainer.className = 'scrollable';
            } else {
                documentsContainer.className = 'natural-growth';
                
                // Add mutation observer to trigger parent resize when content changes
                if (window.MutationObserver) {
                    const mutationObserver = new MutationObserver(() => {
                        // Trigger parent to recalculate size when content changes
                        setTimeout(() => {
                            if (parentContainer) {
                                parentContainer.style.height = 'auto';
                                void parentContainer.offsetHeight; // Force reflow
        
                                // Also trigger any parent resize observers
                                const event = new Event('resize');
                                parentContainer.dispatchEvent(event);
                            }
                        }, 0);
                    });
        
                    mutationObserver.observe(documentsContainer, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['style']
                    });
        
                    documentsContainer._mutationObserver = mutationObserver;
                }
            }
        
            // Assemble the modal
            listContainer.appendChild(header);
            listContainer.appendChild(addBtn);
            listContainer.appendChild(documentsContainer);
            listModal.appendChild(listContainer);
        
            // Close modal when clicking on overlay (only for modal mode)
            if (!isEmbedded) {
                listModal.addEventListener('click', (e) => {
                    if (e.target === listModal) {
                        // this.closeDocumentList();
                    }
                });
            }
        
            // Add show/hide methods
            listModal.showModal = function () {
                if (isEmbedded) {
                    listModal.classList.add('rag-modal-visible');
                    
                    // Force parent layout recalculation after showing
                    if (!parentHasHeightConstraints && parentContainer) {
                        setTimeout(() => {
                            parentContainer.style.height = 'auto';
                            void parentContainer.offsetHeight; // Force reflow
                        }, 50);
                    }
                } else {
                    listModal.classList.add('rag-modal-popup-visible');
                }
            };
        
            listModal.hideModal = function () {
                listModal.classList.remove('rag-modal-visible', 'rag-modal-popup-visible');
                
                // Clean up observers after transition
                setTimeout(() => {
                    if (listModal._resizeObserver) {
                        listModal._resizeObserver.disconnect();
                    }
                    if (documentsContainer._mutationObserver) {
                        documentsContainer._mutationObserver.disconnect();
                    }
                }, 300);
            };
        
            return listModal;
        }

        // Helper function to get file icon based on file format
        getFileIcon(fileFormat) {
            const iconStyles = {
                width: '32px',
                height: '32px',
                marginRight: '12px',
                flexShrink: '0'
            };

            switch (fileFormat?.toLowerCase()) {
                case 'pdf':
                    return this.createSVGIcon('pdf', '#dc2626', iconStyles);
                case 'doc':
                case 'docx':
                    return this.createSVGIcon('doc', '#2563eb', iconStyles);
                case 'csv':
                    return this.createSVGIcon('csv', '#16a34a', iconStyles);
                case 'txt':
                    return this.createSVGIcon('txt', '#6b7280', iconStyles);
                case 'xls':
                case 'xlsx':
                    return this.createSVGIcon('excel', '#16a34a', iconStyles);
                case 'ppt':
                case 'pptx':
                    return this.createSVGIcon('ppt', '#ea580c', iconStyles);
                case 'script':
                    return this.createSVGIcon('script', '#7c3aed', iconStyles);
                case 'url':
                    return this.createSVGIcon('url', '#0891b2', iconStyles);
                default:
                    return this.createSVGIcon('doc', '#6b7280', iconStyles);
            }
        }

        // Helper function to create SVG icons
        createSVGIcon(type, color, styles) {
            const iconContainer = document.createElement('div');
            Object.assign(iconContainer.style, styles);

            let svgContent = '';

            switch (type) {
                case 'pdf':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">PDF</text>
                </svg>
            `;
                    break;
                case 'doc':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 12H16M8 14H16M8 16H12" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
            `;
                    break;
                case 'csv':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">CSV</text>
                </svg>
            `;
                    break;
                case 'txt':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 11H16M8 13H16M8 15H16M8 17H13" stroke="white" stroke-width="1" stroke-linecap="round"/>
                </svg>
            `;
                    break;
                case 'excel':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 12L12 16M12 12L8 16M16 12V16M16 14H14" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
            `;
                    break;
                case 'ppt':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">PPT</text>
                </svg>
            `;
                    break;
                case 'script':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="${color}"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 12L10 14L8 16M12 16H16" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
                    break;
                case 'url':
                    svgContent = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="${color}"/>
                    <path d="M10 13C10.4295 13.5741 11.0335 14 11.7778 14C12.5221 14 13.1261 13.5741 13.5556 13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 3C14.5 3 16.5 7.02944 16.5 12C16.5 16.9706 14.5 21 12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 3C9.5 3 7.5 7.02944 7.5 12C7.5 16.9706 9.5 21 12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M3 12H21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
                    break;
            }

            iconContainer.innerHTML = svgContent;
            return iconContainer;
        }

        createDocumentItem(doc) {
            const item = document.createElement('div');
            item.className = 'rag-document-item';
        
            // Left section with icon and info
            const leftSection = document.createElement('div');
            leftSection.className = 'rag-document-left-section';
        
            // Get file format from document source
            const fileFormat = doc.source?.fileFormat || doc.fileFormat || 'doc';
        
            // Create and add icon
            const icon = this.getFileIcon(fileFormat);
            leftSection.appendChild(icon);
        
            const infoContainer = document.createElement('div');
            infoContainer.className = 'rag-document-info-container';
        
            const name = document.createElement('div');
            name.className = 'rag-document-name';
            name.textContent = doc.name || doc.title || 'Untitled Document';
        
            const details = document.createElement('div');
            details.className = 'rag-document-details';
        
            const createdDate = doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown date';
            const dateInfo = document.createElement('div');
            dateInfo.className = 'rag-document-date-info';
            dateInfo.textContent = `Created: ${createdDate}`;
            dateInfo.style.gridRow = '1';
            dateInfo.style.gridColumn = '1';
        
            // Add source type if available
            if (doc.source?.type) {
                const sourceInfo = document.createElement('div');
                sourceInfo.textContent = `Source: ${doc.source.type}`;
                details.appendChild(sourceInfo);
        
                if (doc.source?.data?.url) {
                    const url = document.createElement('div');
                    url.className = 'rag-document-url';
                    const text = doc.source.data.url;
                    const truncateLength = 40;
                    if (text.length > truncateLength) {
                        url.textContent = text.substring(0, truncateLength) + '...';
                    } else {
                        url.textContent = text;
                    }
                    details.appendChild(url);
                }
            }
            infoContainer.appendChild(name);
            infoContainer.appendChild(details);
            leftSection.appendChild(infoContainer);
        
            // Create ellipsis menu container
            const ellipsisMenuContainer = document.createElement('div');
            ellipsisMenuContainer.className = 'ellipsis-menu-container';
            
            // Create ellipsis button
            const ellipsisBtn = document.createElement('button');
            ellipsisBtn.className = 'ellipsis-btn';
            ellipsisBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                </svg>
            `;
            
            // Create menu dropdown
            const ellipsisMenu = document.createElement('div');
            ellipsisMenu.className = 'ellipsis-menu';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'menu-item edit-btn';
            editBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
            `;
            editBtn.addEventListener('click', () => {
                this.openEditDocumentModal(doc);
                ellipsisMenu.classList.remove('show');
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'menu-item delete-btn';
            deleteBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Delete
            `;
            deleteBtn.addEventListener('click', () => {
                this.confirmDeleteDocument(doc);
                ellipsisMenu.classList.remove('show');
            });
            
            // Toggle menu functionality
            ellipsisBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close all other menus
                document.querySelectorAll('.ellipsis-menu').forEach(menu => {
                    if (menu !== ellipsisMenu) {
                        menu.classList.remove('show');
                    }
                });
                // Toggle current menu
                ellipsisMenu.classList.toggle('show');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!ellipsisMenuContainer.contains(e.target)) {
                    ellipsisMenu.classList.remove('show');
                }
            });
            
            // Append elements
            ellipsisMenu.appendChild(editBtn);
            ellipsisMenu.appendChild(deleteBtn);
            ellipsisMenuContainer.appendChild(ellipsisBtn);
            ellipsisMenuContainer.appendChild(ellipsisMenu);
            
            // Add date info and ellipsis menu to buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'rag-document-buttons';
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'rag-document-button-container';
            buttonContainer.appendChild(dateInfo);
            buttonContainer.appendChild(ellipsisMenuContainer);
            buttonsContainer.appendChild(buttonContainer);
        
            item.appendChild(leftSection);
            item.appendChild(buttonsContainer);
        
            return item;
        }



        
        createModalOverlay() {
            const overlay = document.createElement('div');
            overlay.id = 'rag-modal-overlay';
            overlay.className = 'rag-modal-overlay';
        
            // Close modal when clicking on overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeRag();
                }
            });
        
            return overlay;
        }

        extractScriptProps() {
            const interfaceScript = document.getElementById('rag-main-script');
            if (!interfaceScript) {
                console.log('RAG script tag not found');
                return {};
            }

            const attributes = [
                'embedToken', 'chunkingType', 'hideConfig',
                'listPage', 'onOpen', 'onClose', 'className',
                'parentId', 'config', 'hideIcon', 'theme', 'defaultOpen'
            ];

            return attributes.reduce((props, attr) => {
                if (interfaceScript.hasAttribute(attr)) {
                    let value = interfaceScript.getAttribute(attr);
                    if (attr === 'theme') {
                        this.state.isDarkTheme = value === 'dark';
                    }
                    props[attr] = value;
                    this.state.tempDataToSend = { ...this.state.tempDataToSend, [attr]: value }
                }
                return props;
            }, {});
        }

        initializeEventListeners() {
            this.loadCSS();
            this.observeScriptChanges();
            this.setupMessageListeners();
            this.setupResizeObserver();
            this.initialiseMessageListeners();
        }

        initialiseMessageListeners() {
            window.addEventListener('message', (event) => {
                // Optionally validate event.origin for security

                const message = event.data;
                const error = message?.error;
                if (!message || !message.type) return;
                console.log(error)

                if (message.type === 'rag' || message.type === 'iframe-message-rag') {
                    if (['create', 'update', 'delete'].includes(message.status)) {
                        // Refresh document list on document update or create
                        if(message.status === 'create' && !message.error){
                            this.showMessage(this.state.messageType.success, 'Document created successfully');
                        }
                        if(message.status === 'update' && !message.error){
                            this.showMessage(this.state.messageType.success, 'Document updated successfully');
                        }
                        if(message.status === 'delete' && !message.error){
                            this.showMessage(this.state.messageType.success, 'Document deleted successfully');
                        }
                        this.showDocumentList();
                    }
                    if(error){
                        this.showMessage(this.state.messageType.error, error);
                    }
                } else {
                    console.log('Unknown message type:', message.type);
                }
            });
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
                if (node.tagName === 'SCRIPT' && node.id === 'rag-main-script') {
                    this.props = this.extractScriptProps();
                }
            });

            mutation.removedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' && node.id === 'rag-main-script') {
                    this.cleanupRag();
                }
            });
        }

        destroy() {
            // Disconnect observers
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }

            // Remove event listeners
            document.removeEventListener('keydown', this.keyboardHandler);
            window.removeEventListener('message', this.messageHandler);

            // Clear references
            this.parentContainer = null;
            this.modalOverlay = null;
            this.token = null;

            // Remove DOM elements
            this.cleanupRag();
        }

       cleanupRag() {
            // Remove modal overlay
            if (this.modalOverlay) {
                this.modalOverlay.remove();
                this.modalOverlay = null;
            }

            // Remove document list modal
            const documentListModal = document.getElementById('rag-document-list-modal');
            if (documentListModal) {
                documentListModal.remove();
            }
        }

        setupMessageListeners() {
            this.messageHandler = (event) => {
                if (typeof event.data !== 'object' || !event.data.type) {
                    console.warn('Invalid message format');
                    return;
                }

                this.handleIncomingMessages(event);
            };

            window.addEventListener('message', this.messageHandler);
        }

        handleIncomingMessages(event) {
            const { type } = event.data || {};
            // Ignore duplicate or invalid messages
            if (!type || this.lastProcessedMessage === JSON.stringify(event.data)) {
                return;
            }

            this.lastProcessedMessage = JSON.stringify(event.data);

            switch (type) {
                case 'CLOSE_RAG':
                case 'closeRag':
                    this.closeRag();
                    break;
                case 'ragLoaded':
                    // Only send initial data when iframe first loads and hasn't been sent yet
                    const iframe = document.getElementById('iframe-component-ragInterfaceEmbed');
                    if (iframe?.dataset.initialDataSent !== 'true') {
                        this.sendInitialData();
                    }
                    break;
                case 'OPEN_RAG':
                    this.openRag();
                    break;
                case 'SHOW_DOCUMENT_LIST':
                    this.showDocumentList();
                    break;
                default:
                //console.log('Unhandled message type:', type);
            }
        }

        setupResizeObserver() {
            const iframeObserver = new ResizeObserver((entries) => {
                const iframeParentContainer = document.getElementById('rag-iframe-parent-container');

                if (!iframeParentContainer || this.state.fullscreen) return;

                const { width } = entries[0].contentRect;

                if (width < 600 && !this.state.isEmbeddedInParent) {
                    iframeParentContainer.style.height = '100%';
                    iframeParentContainer.style.width = '100%';
                } else {
                    this.applyConfig(this?.props?.config || {});
                }
            });

            iframeObserver.observe(document.documentElement);
        }

        applyConfig() {
            const iframeContainer = document.getElementById('rag-iframe-parent-container');
            if (!iframeContainer) return;
            
            // Remove any existing modal classes
            iframeContainer.classList.remove('rag-iframe-modal');
            
            // Apply modal popup configuration using CSS class
            iframeContainer.classList.add('rag-iframe-modal');
        }

        updateProps(newProps) {
            this.props = { ...this.props, ...newProps };
        }

        async showDocumentList() {
            try {
                await this.fetchDocuments();
                this.renderDocumentList();

                const listModal = document.getElementById('rag-document-list-modal');
                const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
                const isEmbedded = parentId && this.state.isEmbeddedInParent;

                if (listModal) {
                    // Get parent container height if embedded
                    if (isEmbedded) {
                        const parentContainer = document.getElementById(parentId);
                        if (parentContainer) {
                            const parentHeight = parentContainer.clientHeight;
                            listModal.style.maxHeight = `${parentHeight}px`;
                            listModal.style.height = 'auto';
                        }

                        // For embedded mode, hide the main iframe and show document list
                        const iframeContainer = document.getElementById('rag-iframe-parent-container');
                        if (iframeContainer) {
                            iframeContainer.style.display = 'none';
                        }

                        listModal.style.display = 'block';
                        listModal.style.opacity = '0';

                        requestAnimationFrame(() => {
                            listModal.style.opacity = '1';
                        });
                    } else {
                        // For modal mode, show as overlay
                        listModal.style.display = 'flex';
                        listModal.style.opacity = '0';

                        requestAnimationFrame(() => {
                            listModal.style.opacity = '1';
                        });
                    }
                }
            } catch (error) {
                console.error('Error showing document list:', error);
                this.showMessage(this.messageHandler.error , 'Failed to load documents');
            }
        }

        async fetchDocuments() {
            if (!this.token) {
                throw new Error('User token not available');
            }

            const response = await fetch(this.urls.docsApi, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Proxy_auth_token': this.token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.documents = data?.data || data || [];
            return this.documents;
        }


        renderDocumentList() {
            const container = document.getElementById('rag-documents-container');
            if (!container) return;

            container.innerHTML = '';

            if (this.documents.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'rag-empty-state';
                emptyState.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <div style="font-size: 18px; margin-bottom: 8px;">No documents found</div>
            <div style="font-size: 14px;">Click "Add New Document" to get started</div>
        `;
                container.appendChild(emptyState);
                return;
            }

            this.documents.forEach(doc => {
                const docItem = this.createDocumentItem(doc);
                container.appendChild(docItem);
            });
        }



        closeDocumentList() {
            const listModal = document.getElementById('rag-document-list-modal');
            if (listModal) {
                listModal.style.transition = 'opacity 0.2s ease-in-out';
                listModal.style.opacity = '0';
                setTimeout(() => {
                    listModal.style.display = 'none';
                }, 200);
            }
        }

        // Consolidated modal opening method
        openModal(config = {}) {
            const {
                height = '64vh',
                isEditMode = false,
                document: doc = null,
                backgroundColor = null
            } = config;

            const ragInterfaceEmbed = document.getElementById('ragInterfaceEmbed');
            let iframeContainer = document.getElementById('rag-iframe-parent-container');
            let modalOverlay = document.getElementById('rag-modal-overlay');

            // Create elements if they don't exist
            if (!iframeContainer) {
                this.createIframeContainer();
                iframeContainer = document.getElementById('rag-iframe-parent-container');
            }

            if (!modalOverlay) {
                this.modalOverlay = this.createModalOverlay();
                document.body.appendChild(this.modalOverlay);
                modalOverlay = document.getElementById('rag-modal-overlay');
            }

            if (!iframeContainer) {
                console.error('Failed to create or find iframe container');
                return;
            }

            // Hide the icon/embed element if exists
            if (ragInterfaceEmbed) {
                ragInterfaceEmbed.style.display = 'none';
            }

            // Show modal overlay with animation
            if (modalOverlay) {
                modalOverlay.style.display = 'block';
                modalOverlay.style.opacity = '0';
                requestAnimationFrame(() => {
                    modalOverlay.style.opacity = '1';
                });
            }

            // Store current embedded state and set to false for modal mode
            const wasEmbedded = this.state.isEmbeddedInParent;
            this.state.isEmbeddedInParent = false;

            // Configure iframe container for modal mode
            this.configureModalContainer(iframeContainer, height, backgroundColor);

            // Ensure iframe container is in body for modal mode
            if (iframeContainer.parentNode !== document.body) {
                document.body.appendChild(iframeContainer);
            }

            // Show iframe container with animation
            this.animateModalOpen(iframeContainer);

            // Store embedded state for restoration
            iframeContainer.dataset.wasEmbedded = wasEmbedded.toString();

            // Handle post-open actions
            this.handlePostModalOpen(isEditMode, doc);
        }

        // Helper method to configure modal container styles
        configureModalContainer(container, height, backgroundColor) {
            const styles = {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90vw',
                height: height,
                maxWidth: '1200px',
                maxHeight: '800px',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                zIndex: '999999',
                backgroundColor: backgroundColor || (this.state?.themeColors?.background || 'white')
            };

            Object.assign(container.style, styles);
        }

        // Helper method to animate modal opening
        animateModalOpen(container) {
            container.style.display = 'block';
            container.style.opacity = '0';
            container.style.transition = 'opacity 0.3s ease-in-out';

            requestAnimationFrame(() => {
                container.style.opacity = '1';
            });
        }

        // Handle actions after modal opens
        handlePostModalOpen(isEditMode, doc) {
            // Notify parent window
            if (window.parent) {
                window.parent.postMessage?.({ type: 'open', data: {} }, '*');
            }

            if (isEditMode && doc) {
                // For edit mode, wait for iframe ready state and send edit data
                this.waitForIframeReadyAndSendEdit(doc);
            } else {
                // For regular mode, send open message to iframe
                const iframeComponent = document.getElementById('iframe-component-ragInterfaceEmbed');
                if (iframeComponent?.contentWindow) {
                    iframeComponent.contentWindow.postMessage({
                        type: 'OPEN_ADD_DOCUMENT',
                        data: {
                            action: 'add_new',
                            token: this.token
                        }
                    }, '*');
                }
            }
        }

        // Updated openEditDocumentModal method
        openEditDocumentModal(doc) {
            this.openModal({
                height: '52vh',
                isEditMode: true,
                document: doc,
                backgroundColor: this.state?.themeColors?.background
            });
        }

        // Updated openRag method
        openRag() {
            this.openModal({
                height: '64vh',
                isEditMode: false,
                backgroundColor: 'white'
            });
        }

        // Updated closeRag function - handles modal restoration properly
        closeRag() {
            const ragInterfaceEmbed = document.getElementById('ragInterfaceEmbed');
            const iframeContainer = document.getElementById('rag-iframe-parent-container');
            const modalOverlay = document.getElementById('rag-modal-overlay');

            if (iframeContainer?.style?.display === 'block') {
                // Animate out
                iframeContainer.style.transition = 'opacity 0.2s ease-in-out';
                iframeContainer.style.opacity = '0';

                // Hide modal overlay
                if (modalOverlay) {
                    modalOverlay.style.transition = 'opacity 0.2s ease-in-out';
                    modalOverlay.style.opacity = '0';
                }

                setTimeout(() => {
                    iframeContainer.style.display = 'none';

                    if (modalOverlay) {
                        modalOverlay.style.display = 'none';
                    }

                    // Restore embedded state if it was embedded before
                    const wasEmbedded = iframeContainer.dataset.wasEmbedded === 'true';

                    if (wasEmbedded) {
                        this.state.isEmbeddedInParent = true;
                        // Move iframe back to parent container
                        const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
                        const parentContainer = parentId ? document.getElementById(parentId) : null;

                        if (parentContainer) {
                            parentContainer.appendChild(iframeContainer);
                            // Reset styles for embedded mode
                            iframeContainer.style.position = 'relative';
                            iframeContainer.style.top = 'auto';
                            iframeContainer.style.left = 'auto';
                            iframeContainer.style.transform = 'none';
                            iframeContainer.style.zIndex = 'auto';
                            this.applyConfig(this.props.config || {});
                        }
                    } else {
                        this.state.isEmbeddedInParent = false;
                    }

                    // Show the embed icon again if not hidden
                    if (ragInterfaceEmbed) {
                        const shouldHideIcon = this.props.hideIcon === true || this.props.hideIcon === 'true';
                        ragInterfaceEmbed.style.display = shouldHideIcon ? 'none' : 'flex';
                    }

                    // Send close message to parent window
                    if (window.parent) {
                        window.parent.postMessage?.({ type: 'close', data: {} }, '*');
                    }
                }, 200);
            }
        }


        confirmDeleteDocument(document) {
            if (confirm(`Are you sure you want to delete "${document.name || document.title || 'this document'}"?`)) {
                this.sendMessageToIframe({
                    type: 'DELETE_DOCUMENT',
                    data: { action: 'delete', document: document }
                });

                // Refresh the document list after deletion
                setTimeout(() => {
                    this.showDocumentList();
                }, 1000);
            }
        }


        waitForIframeReadyAndSendEdit(doc) {
            let attempts = 0;
            const maxAttempts = 5;
            const checkInterval = 200; // 500ms between checks

            const sendEditMessage = () => {
                //console.log(`Attempt ${attempts + 1}: Checking iframe ready state...`);

                const iframe = document.getElementById('iframe-component-ragInterfaceEmbed');
                if (!iframe) {
                    //console.log('Iframe not found, retrying...');
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(sendEditMessage, checkInterval);
                    } else {
                        console.error('Max attempts reached, iframe not found');
                    }
                    return;
                }

                // Check if iframe content window is accessible and has loaded
                try {
                    const iframeReady = iframe.contentWindow;

                    if (iframeReady) {
                        //console.log('Iframe ready, sending EDIT_DOCUMENT message...');

                        // Add a small delay to ensure the iframe's JavaScript has fully initialized
                        setTimeout(() => {
                            this.sendMessageToIframe({
                                type: 'EDIT_DOCUMENT',
                                data: {
                                    action: 'edit',
                                    document: doc,
                                    timestamp: Date.now()
                                }
                            });
                        }, 100);

                        return;
                    }
                } catch (e) {
                    console.log('Iframe not accessible yet, continuing to wait...', e);
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(sendEditMessage, checkInterval);
                } else {
                    console.error('Max attempts reached, sending message anyway...');
                    // Try to send the message even if we couldn't verify readiness
                    this.sendMessageToIframe({
                        type: 'EDIT_DOCUMENT',
                        data: {
                            action: 'edit',
                            document: doc,
                            timestamp: Date.now()
                        }
                    });
                }
            };

            // Also listen for the iframe load event as a backup
            const iframe = document.getElementById('iframe-component-ragInterfaceEmbed');
            if (iframe) {
                iframe.addEventListener('load', () => {
                    //console.log('Iframe load event fired');
                    // Give it a moment for the content to initialize
                    setTimeout(() => {
                        this.sendMessageToIframe({
                            type: 'EDIT_DOCUMENT',
                            data: {
                                action: 'edit',
                                document: doc,
                                timestamp: Date.now()
                            }
                        });
                    }, 200);
                }, { once: true });
            }

            // Start the polling check
            sendEditMessage();
        }

        sendMessageToIframe(messageObj) {
            const iframeComponent = document.getElementById('iframe-component-ragInterfaceEmbed');
            if (iframeComponent?.contentWindow) {
                //console.log('Sending message to iframe:', messageObj);

                // Create message with auth but don't include full config unless it's initial config
                const messageWithAuth = {
                    ...messageObj,
                    data: {
                        ...messageObj.data,
                        token: this.token,
                        timestamp: Date.now()
                    }
                };

                // Add a small delay to prevent message flooding
                setTimeout(() => {
                    iframeComponent.contentWindow.postMessage(messageWithAuth, '*');
                }, 500);
            }
        }

        showMessage(type, message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = type;
            errorDiv.textContent = message;
            
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.classList.add('fade-out');
                    setTimeout(() => {
                        if (errorDiv.parentNode) {
                            errorDiv.parentNode.removeChild(errorDiv);
                        }
                    }, 300); // Wait for fade-out animation to complete
                }
            }, 5000);
        }

        async initializeRag() {
            document.addEventListener('DOMContentLoaded', this.loadContent.bind(this));
            if (document?.body) this.loadContent();
        }

        loadContent() {
            if (this.state.bodyLoaded) {
                //console.log('Content already loaded');
                return;
            }

            //console.log('Loading content...');

            // Create modal overlay first
            if (!document.getElementById('rag-modal-overlay')) {
                this.modalOverlay = this.createModalOverlay();
                document.body.appendChild(this.modalOverlay);
                //console.log('Modal overlay created');
            }

            // Extract props
            this.props = this.extractScriptProps();
            //console.log('Props extracted:', this.props);

            // Create iframe container
            if (!document.getElementById('rag-iframe-parent-container')) {
                this.createIframeContainer();
                //console.log('Iframe container created');
            }

            // Create document list modal
            const documentListModal = this.createDocumentListModal();

            // Append to appropriate container
            const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
            const parentContainer = parentId ? document.getElementById(parentId) : null;

            if (parentContainer && this.state.isEmbeddedInParent) {
                parentContainer.appendChild(documentListModal);
                //console.log('Document list modal appended to parent container');
            } else {
                document.body.appendChild(documentListModal);
                //console.log('Document list modal appended to body');
            }

            // Load RAG embed
            this.loadRagEmbed().then(() => {
                //console.log('RAG embed loaded successfully');
            }).catch(error => {
                console.error('Error loading RAG embed:', error);
            });

            this.updateProps(this.state.tempDataToSend || {});

            this.state.bodyLoaded = true;
            //console.log('Content loading completed');
        }

        createIframeContainer() {
            this.parentContainer = document.createElement('div');
            this.parentContainer.id = 'rag-iframe-parent-container';
            this.parentContainer.className = 'popup-parent-container';
            this.parentContainer.style.display = 'none';
            this.parentContainer.style.border = 'none';
            this.parentContainer.style.zIndex = '999999';
            this.parentContainer.style.boxSizing = 'border-box';
            this.parentContainer.style.backgroundColor = this.state.themeColors.background;

            const iframe = document.createElement('iframe');
            iframe.id = 'iframe-component-ragInterfaceEmbed';
            iframe.title = 'RAG Interface';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.display = 'block';
            iframe.style.borderRadius = "10px";
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
            iframe.allow = 'cross-origin-isolated';

            this.parentContainer.appendChild(iframe);

            const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
            this.changeContainer(parentId, this.parentContainer);
        }

        changeContainer(parentId, parentContainer = this.parentContainer) {
            // Reset embedded state
            this.state.isEmbeddedInParent = false;

            if (parentId && document.getElementById(parentId)) {
                const container = document.getElementById(parentId);

                // Ensure parent container has proper positioning and dimensions
                const computedStyle = window.getComputedStyle(container);
                if (computedStyle.position === 'static') {
                    container.style.position = 'relative';
                }

                container.appendChild(parentContainer);
                this.state.isEmbeddedInParent = true;

                // Hide the modal overlay and icon when embedded
                const modalOverlay = document.getElementById('rag-modal-overlay');

                if (modalOverlay) modalOverlay.style.display = 'none';

                // Apply embedded configuration
                this.applyConfig(this.props.config || {});
            } else {
                // Append to body for popup mode
                document.body.appendChild(parentContainer);
                // Apply popup configuration
                this.applyConfig(this.props.config || {});
            }
        }

        async loadRagEmbed() {
            try {
                if (this.props.embedToken || this.state.tempDataToSend?.embedToken) {
                    await this.authenticateUser();
                }

                const iframe = document.getElementById('iframe-component-ragInterfaceEmbed');
                if (!iframe) {
                    throw new Error('Iframe element not found');
                }

                // If iframe already has a src and is loaded, don't reload it
                if (iframe.src && iframe.src.includes(this.urls.ragUrl)) {
                    //console.log('Iframe already loaded, sending initial data...');
                    this.sendInitialData();
                    return Promise.resolve();
                }

                return new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Iframe load timeout'));
                    }, 10000);

                    iframe.onload = () => {
                        clearTimeout(timeoutId);
                        //console.log('RAG interface loaded successfully');
                        // Reset the initial data sent flag for new iframe load
                        iframe.dataset.initialDataSent = 'false';
                        this.sendInitialData();
                        resolve();
                    };

                    iframe.onerror = (error) => {
                        clearTimeout(timeoutId);
                        reject(error);
                    };

                    // Only set src if it's not already set
                    if (!iframe.src || !iframe.src.includes(this.urls.ragUrl)) {
                        iframe.src = this.urls.ragUrl;
                    }
                });
            } catch (error) {
                console.error('Error loading RAG embed:', error);
                this.showErrorMessage('Failed to initialize RAG interface');
                throw error;
            }
        }


        async authenticateUser() {
            const embedToken = this.props.embedToken || this.state.tempDataToSend?.embedToken;

            if (!embedToken) {
                console.warn('No embed token provided for authentication');
                return;
            }

            try {
                const response = await fetch(this.urls.login, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': embedToken
                    }
                });

                if (!response.ok) {
                    throw new Error(`Authentication failed: ${response.status}`);
                }

                const data = await response.json();
                //console.log(data)
                this.token = data.data.token || data.accessToken;
                //console.log(this.token)
                //console.log('User authenticated successfully');
            } catch (error) {
                console.error('Authentication error:', error);
                throw error;
            }
        }

        sendInitialData() {
            const iframe = document.getElementById('iframe-component-ragInterfaceEmbed');
            if (!iframe?.contentWindow) return;

            // Check if we've already sent initial data to this iframe instance
            if (iframe.dataset.initialDataSent === 'true') {
                //console.log('Initial data already sent to this iframe instance');
                return;
            }

            const dataToSend = {
                type: 'INITIAL_CONFIG',
                data: {
                    ...this.props,
                    ...this.state.tempDataToSend,
                    token: this.token,
                    isEmbedded: this.state.isEmbeddedInParent,
                    timestamp: Date.now()
                }
            };

            console.log('Sending initial data to iframe:', dataToSend);
            this.sendMessageToIframe(dataToSend);

            if (this.state.tempDataToSend?.defaultOpen === true || this.state.tempDataToSend?.defaultOpen === 'true') {
                this.showDocumentList();
                this.state.tempDataToSend.defaultOpen = false;
            }

            // Mark this iframe as having received initial data
            iframe.dataset.initialDataSent = 'true';
        }


        // Public API methods
        open() {
            this.openRag();
        }

        close() {
            this.closeRag();
        }

        showDocuments() {
            this.showDocumentList();
        }
        closeDocuments() {
            this.closeDocumentList();
        }

        updateConfiguration(newConfig) {
            this.updateProps(newConfig);
            this.sendInitialData();
        }

        // Cleanup method
        destroy() {
            this.cleanupRag();
        }
    }

    // Initialize the RAG Embed Manager
    const ragEmbedManager = new RagEmbedManager();

    // Make it globally accessible
    window.RagEmbedManager = ragEmbedManager;

    // Auto-initialize
    ragEmbedManager.initializeRag();

    // Expose public API
    window.ragEmbed = {
        openRag: () => ragEmbedManager.open(),
        closeRag: () => ragEmbedManager.close(),
        showDocuments: () => ragEmbedManager.showDocuments(),
        closeDocuments: () => ragEmbedManager.closeDocuments(),
        updateConfig: (config) => ragEmbedManager.updateConfiguration(config),
        destroy: () => ragEmbedManager.destroy()

    };

    window.openRag = () => ragEmbedManager.open();
    window.closeRag = () => ragEmbedManager.close();
    window.showDocuments = () => ragEmbedManager.showDocuments();
    window.closeDocuments = () => ragEmbedManager.closeDocuments();
    window.updateConfig = (config) => ragEmbedManager.updateConfiguration(config);
    window.destroy = () => ragEmbedManager.destroy();

})(); 