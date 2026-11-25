/**
 * Serieworks App Gallery
 * A modern, responsive app showcase with filtering and search capabilities
 */

class AppGallery {
    constructor() {
        this.apps = [];
        this.filteredApps = [];
        this.elements = {
            grid: document.getElementById('projectsGrid'),
            searchInput: document.getElementById('searchInput'),
            categoryFilter: document.getElementById('categoryFilter'),
            backToTop: document.getElementById('backToTop')
        };
        
        // Use global CONFIG or fallback to defaults
        this.config = window.CONFIG || {
            api: { endpoint: 'apps.json' },
            ui: { 
                placeholderImage: 'https://placehold.co/300x180?text=App+Image',
                scrollThreshold: 200,
                debounceDelay: 300,
                throttleDelay: 100
            },
            features: { showOnlyProduction: true }
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.loadApps();
            this.setupEventListeners();
            this.setupScrollHandler();
            this.applyFiltersFromUrl();
            this.filterApps();
        } catch (error) {
            this.handleError('Failed to initialize app gallery', error);
        }
    }

    /**
     * Load apps from JSON endpoint
     */
    async loadApps() {
        try {
            const response = await fetch(this.config.api.endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.apps = data.map(record => this.normalizeRecord(record));
            this.filteredApps = this.getProductionApps();
        } catch (error) {
            throw new Error(`Failed to load apps: ${error.message}`);
        }
    }

    /**
     * Normalize record shape for backward compatibility
     */
    normalizeRecord(record) {
        return {
            ...record,
            appStore: record.appStore || '#',
            playStore: record.playStore || '#'
        };
    }

    /**
     * Get only production-ready apps if feature flag is enabled
     */
    getProductionApps() {
        if (this.config.features.showOnlyProduction) {
            return this.sortAppsOldestFirst(
                this.apps.filter(app => app.status === 'production')
            );
        }
        return this.sortAppsOldestFirst(this.apps);
    }

    /**
     * Return apps in oldest-first order based on source JSON position.
     */
    sortAppsOldestFirst(apps) {
        return [...apps];
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.elements.searchInput.addEventListener('input', 
            this.debounce(this.handleSearch.bind(this), this.config.ui.debounceDelay)
        );

        this.elements.categoryFilter.addEventListener('change', 
            this.handleCategoryChange.bind(this)
        );

        // Keep filters in sync when navigating browser history.
        window.addEventListener('popstate', () => {
            this.applyFiltersFromUrl();
            this.filterApps(false);
        });
    }

    /**
     * Setup scroll handler for back-to-top button
     */
    setupScrollHandler() {
        if (!this.elements.backToTop) return;
        
        window.addEventListener('scroll', this.throttle(() => {
            const isVisible = window.scrollY > this.config.ui.scrollThreshold;
            this.elements.backToTop.style.display = isVisible ? 'block' : 'none';
        }, this.config.ui.throttleDelay));

        this.elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Handle search input
     */
    handleSearch() {
        this.filterApps();
    }

    /**
     * Handle category filter change
     */
    handleCategoryChange() {
        this.filterApps();
    }

    /**
     * Filter and search apps
     */
    filterApps(updateUrl = true) {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        const selectedCategory = this.elements.categoryFilter.value;

        this.filteredApps = this.getProductionApps().filter(app => {
            const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
            const searchableText = [
                app.title,
                app.description,
                app.category,
                app.appStore,
                app.playStore
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });

        if (updateUrl) {
            this.updateUrlFromFilters();
        }

        this.renderApps();
    }

    /**
     * Apply filter values from URL query parameters
     */
    applyFiltersFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const category = params.get('category') || 'all';

        this.elements.searchInput.value = query;

        this.elements.categoryFilter.value = this.isValidSelectValue(this.elements.categoryFilter, category) ? category : 'all';
    }

    /**
     * Persist current filter values into URL query parameters
     */
    updateUrlFromFilters() {
        const url = new URL(window.location.href);
        const params = url.searchParams;

        const query = this.elements.searchInput.value.trim();
        const category = this.elements.categoryFilter.value;

        this.setQueryParam(params, 'q', query);
        this.setQueryParam(params, 'category', category, 'all');

        const nextUrl = `${url.pathname}${params.toString() ? `?${params.toString()}` : ''}${url.hash}`;
        window.history.replaceState({}, '', nextUrl);
    }

    /**
     * Validate that a value exists in a select element
     */
    isValidSelectValue(selectElement, value) {
        return Array.from(selectElement.options).some(option => option.value === value);
    }

    /**
     * Set or remove a query parameter
     */
    setQueryParam(params, key, value, defaultValue = '') {
        if (!value || value === defaultValue) {
            params.delete(key);
            return;
        }

        params.set(key, value);
    }

    /**
     * Render apps to the grid
     */
    renderApps() {
        if (!this.elements.grid) return;

        // Clear existing content
        this.elements.grid.innerHTML = '';

        // Show no results message if needed
        if (this.filteredApps.length === 0) {
            this.renderNoResults();
            return;
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        this.filteredApps.forEach(app => {
            fragment.appendChild(this.createCompactCard(app));
        });

        this.elements.grid.appendChild(fragment);
        this.setupStoreBadgeHandlers();
    }

    /**
     * Create a compact pill-style card: icon left, title and description right.
     * Full store badges sit at the bottom and are revealed on hover.
     */
    createCompactCard(app) {
        const card = document.createElement('div');
        card.className = 'card-compact';

        const imageData = this.getCardImageData(app);
        const categoryClass = `card-category ${app.category}`;
        const categoryDisplay = this.formatCategoryName(app.category);
        const safePlaceholderImage = this.escapeHtml(this.config.ui.placeholderImage);

        card.innerHTML = `
            <div class="card-compact-icon">
                <img src="${this.escapeHtml(imageData.src)}" 
                     alt="${this.escapeHtml(app.title)} icon" 
                     onerror="this.onerror=null;this.src='${safePlaceholderImage}';" 
                     ${this.config.features.enableLazyLoading ? 'loading="lazy"' : ''} />
            </div>
            <div class="card-compact-content">
                <div class="card-compact-header">
                    <span class="card-compact-title" title="${this.escapeHtml(app.title)}">${this.escapeHtml(app.title)}</span>
                    <div class="${categoryClass}">${categoryDisplay}</div>
                    <div class="card-compact-panel">
                        <div class="card-compact-fulldesc">${this.escapeHtml(app.description)}</div>
                        <div class="card-compact-links">
                            ${this.createCardLinks(app)}
                        </div>
                    </div>
                </div>
                <div class="card-compact-desc">${this.escapeHtml(app.description)}</div>
            </div>
        `;

        return card;
    }

    /**
     * Create card store badges
     */
    createCardLinks(app) {
        return `${this.createStoreBadge('appStore', app.appStore, app)}${this.createStoreBadge('googlePlay', app.playStore, app)}`;
    }

    /**
     * Build a pre-filled Gmail compose URL for beta test applications
     */
    buildBetaComposeUrl(appTitle) {
        const subject = `Beta testing: ${appTitle}`;
        const body = [
            `Hi! I'd like to beta test ${appTitle} on Android.`,
            '',
            'My Google account email: ',
            ''
        ].join('\n');

        const params = new URLSearchParams({
            view: 'cm',
            fs: '1',
            to: 'serieworks@gmail.com',
            su: subject,
            body: body
        });

        return `https://mail.google.com/mail/?${params.toString()}`;
    }

    /**
     * Get app image with fallback
     */
    getCardImageData(app) {
        if (app.image && app.image.trim() !== '' && app.image !== '#') {
            return { src: app.image };
        }

        return { src: this.config.ui.placeholderImage };
    }

    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        const categoryNames = {
            'educational': 'Educational',
            'game': 'Game',
            'productivity': 'Productivity',
            'social': 'Social',
            'health': 'Health & Fitness',
            'finance': 'Finance',
            'entertainment': 'Entertainment',
            'utilities': 'Utilities',
            'lifestyle': 'Lifestyle',
            'news': 'News',
            'travel': 'Travel'
        };
        
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Create store badge HTML
     */
    createStoreBadge(storeType, link, app) {
        const badges = this.config.storeBadges || {
            appStore: { image: 'assets/app-store-badge.svg', altText: 'Download on the App Store' },
            googlePlay: { image: 'assets/google-play-badge.svg', altText: 'Get it on Google Play' }
        };
        
        const badge = badges[storeType];
        if (!badge) return '';
        
        const isActive = link && link !== '#';

        // Apps with a Play Console testing track offer beta sign-up
        if (!isActive && storeType === 'googlePlay' && app && app.androidBeta) {
            const composeUrl = this.buildBetaComposeUrl(app.title);
            return `<span class="store-badge-beta-wrap"><img src="${badge.image}" 
                         alt="Not on Google Play yet - apply for beta testing" 
                         class="store-badge beta" 
                         data-link="${this.escapeHtml(composeUrl)}"
                         tabindex="0"
                         role="button"
                         aria-label="Not on Google Play yet - apply for beta testing" /></span>`;
        }

        // Other apps without a Play link are simply coming soon
        if (!isActive && storeType === 'googlePlay') {
            return `<span class="store-badge-soon-wrap"><img src="${badge.image}" 
                         alt="Coming soon on Google Play" 
                         class="store-badge inactive" 
                         style="cursor: not-allowed; opacity: 0.6;" /></span>`;
        }
        
        // Show badge even if link is placeholder, but make it non-functional
        const cursorStyle = isActive ? '' : 'style="cursor: not-allowed; opacity: 0.6;"';
        const dataLink = isActive ? `data-link="${this.escapeHtml(link)}"` : '';
        
        return `<img src="${badge.image}" 
                     alt="${badge.altText}" 
                     class="store-badge ${isActive ? 'active' : 'inactive'}" 
                     ${dataLink}
                     ${cursorStyle}
                     tabindex="0"
                     role="button"
                     aria-label="${badge.altText}" />`;
    }

    /**
     * Setup store badge click handlers
     */
    setupStoreBadgeHandlers() {
        const badges = this.elements.grid.querySelectorAll('.store-badge');
        
        badges.forEach(badge => {
            // Remove existing listeners to prevent duplicates
            badge.replaceWith(badge.cloneNode(true));
        });

        // Add new listeners
        this.elements.grid.querySelectorAll('.store-badge').forEach(badge => {
            badge.addEventListener('click', this.handleStoreBadgeClick.bind(this));
            
            if (this.config.accessibility?.keyboardNavigation) {
                badge.addEventListener('keydown', this.handleStoreBadgeKeydown.bind(this));
            }
        });
    }

    /**
     * Handle store badge clicks
     */
    handleStoreBadgeClick(event) {
        // Beta badges open a pre-filled Gmail compose window
        if (event.target.classList.contains('beta')) {
            const composeUrl = event.target.getAttribute('data-link');
            if (composeUrl) {
                window.open(composeUrl, '_blank', 'noopener,noreferrer');
            }
            return;
        }

        // Only handle clicks for active badges
        if (event.target.classList.contains('inactive')) {
            return;
        }
        
        const link = event.target.getAttribute('data-link');
        if (link && link !== '#') {
            // Check if user is on desktop/PC
            if (this.isDesktop()) {
                // Show QR code modal instead of direct link
                this.showQRModal(link, event.target);
            } else {
                // Mobile device - open app store directly
                window.open(link, '_blank', 'noopener,noreferrer');
            }
        }
    }

    /**
     * Handle store badge keyboard interactions
     */
    handleStoreBadgeKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleStoreBadgeClick(event);
        }
    }

    /**
     * Render no results message
     */
    renderNoResults() {
        this.elements.grid.innerHTML = `
            <div class="no-results">
                <p>No records found matching your criteria.</p>
                <p>Try adjusting your search or filter options.</p>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Debounce function to limit rapid function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Handle errors gracefully
     */
    handleError(message, error) {
        console.error(message, error);
        
        if (this.elements.grid) {
            this.elements.grid.innerHTML = `
                <div class="error-message">
                    <p>Sorry, we're having trouble loading the apps.</p>
                    <p>Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    /**
     * Check if user is on desktop/PC
     */
    isDesktop() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Consider it desktop if not mobile and screen is wide enough
        return !isMobile && window.innerWidth >= 768;
    }

    /**
     * Show QR code modal for desktop users
     */
    showQRModal(storeLink, badgeElement) {
        // Find the app title from the badge's parent card
        const appCard = badgeElement.closest('.card');
        const titleElement = appCard ? appCard.querySelector('.card-title') : null;
        const appTitle = titleElement ? titleElement.textContent : 'Mobile App';
        
        // Update modal content
        document.getElementById('qrModalTitle').textContent = `Get ${appTitle}`;
        
        // Set up store links
        const isAppStore = badgeElement.alt && badgeElement.alt.includes('App Store');
        const appStoreLink = document.getElementById('qrAppStoreLink');
        const playStoreLink = document.getElementById('qrPlayStoreLink');
        
        if (isAppStore) {
            appStoreLink.href = storeLink;
            appStoreLink.style.display = 'inline-block';
            playStoreLink.style.display = 'none';
        } else {
            playStoreLink.href = storeLink;
            playStoreLink.style.display = 'inline-block';
            appStoreLink.style.display = 'none';
        }
        
        // Generate QR code
        this.generateQRCode(storeLink);
        
        // Show modal
        const modal = document.getElementById('qrModal');
        modal.style.display = 'flex';
        
        // Set up close handlers
        this.setupQRModalHandlers();
    }

    /**
     * Generate QR code for the given URL
     */
    generateQRCode(url) {
        const qrContainer = document.getElementById('qrCodeImage');
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Use QR Server API for QR code generation
        const qrSize = 200;
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=1`;
        
        const qrImage = document.createElement('img');
        qrImage.src = qrURL;
        qrImage.alt = 'QR Code';
        qrImage.style.width = `${qrSize}px`;
        qrImage.style.height = `${qrSize}px`;
        
        // Add error handling
        qrImage.onerror = () => {
            qrContainer.innerHTML = `
                <div style="width: ${qrSize}px; height: ${qrSize}px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; text-align: center; color: #666; font-size: 14px;">
                    <div>
                        QR Code not available<br>
                        <small>Please use the link below</small>
                    </div>
                </div>
            `;
        };
        
        qrContainer.appendChild(qrImage);
    }

    /**
     * Set up QR modal event handlers
     */
    setupQRModalHandlers() {
        const modal = document.getElementById('qrModal');
        const closeBtn = modal.querySelector('.qr-modal-close');
        
        // Close on X button click
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        // Close on backdrop click
        modal.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // Close on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
}

// Initialize the app gallery when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AppGallery());
} else {
    new AppGallery();
}
