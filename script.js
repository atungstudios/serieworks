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
            this.apps = data;
            this.filteredApps = this.getProductionApps();
        } catch (error) {
            throw new Error(`Failed to load apps: ${error.message}`);
        }
    }

    /**
     * Get only production-ready apps if feature flag is enabled
     */
    getProductionApps() {
        if (this.config.features.showOnlyProduction) {
            return this.apps.filter(app => app.status === 'production');
        }
        return this.apps;
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
    filterApps() {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        const selectedCategory = this.elements.categoryFilter.value;

        this.filteredApps = this.getProductionApps().filter(app => {
            const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
            const matchesSearch = !searchTerm || 
                app.title.toLowerCase().includes(searchTerm) ||
                app.description.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });

        this.renderApps();
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
            const card = this.createAppCard(app);
            fragment.appendChild(card);
        });

        this.elements.grid.appendChild(fragment);
        this.setupStoreBadgeHandlers();
    }

    /**
     * Create a single app card element
     */
    createAppCard(app) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const imageSrc = this.getAppImage(app);
        const categoryClass = `card-category ${app.category}`;
        const categoryDisplay = this.formatCategoryName(app.category);

        card.innerHTML = `
            <div class="card-image">
                <img src="${imageSrc}" 
                     alt="${this.escapeHtml(app.title)} screenshot" 
                     onerror="this.onerror=null;this.src='${this.config.ui.placeholderImage}';" 
                     ${this.config.features.enableLazyLoading ? 'loading="lazy"' : ''} />
            </div>
            <div class="card-content">
                <div class="card-title-category-row">
                    <div class="card-title">${this.escapeHtml(app.title)}</div>
                    <div class="${categoryClass}">${categoryDisplay}</div>
                </div>
                <div class="card-desc">${this.escapeHtml(app.description)}</div>
                <div class="card-links">
                    ${this.createStoreBadge('appStore', app.appStore)}
                    ${this.createStoreBadge('googlePlay', app.playStore)}
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Get app image with fallback
     */
    getAppImage(app) {
        return app.image && app.image.trim() !== '' ? app.image : this.config.ui.placeholderImage;
    }

    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Create store badge HTML
     */
    createStoreBadge(storeType, link) {
        const badges = this.config.storeBadges || {
            appStore: { image: 'assets/app-store-badge.svg', altText: 'Download on the App Store' },
            googlePlay: { image: 'assets/google-play-badge.svg', altText: 'Get it on Google Play' }
        };
        
        const badge = badges[storeType];
        if (!badge) return '';
        
        // Show badge even if link is placeholder, but make it non-functional
        const isActive = link && link !== '#';
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
        // Only handle clicks for active badges
        if (event.target.classList.contains('inactive')) {
            return;
        }
        
        const link = event.target.getAttribute('data-link');
        if (link && link !== '#') {
            window.open(link, '_blank', 'noopener,noreferrer');
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
                <p>No apps found matching your criteria.</p>
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
}

// Initialize the app gallery when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AppGallery());
} else {
    new AppGallery();
}
