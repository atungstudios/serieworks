/**
 * Serieworks Configuration
 * Central configuration for the app gallery
 */

const CONFIG = {
    // API Configuration
    api: {
        endpoint: 'apps.json',
        timeout: 10000 // 10 seconds
    },

    // UI Configuration
    ui: {
        placeholderImage: 'https://placehold.co/300x180?text=App+Image',
        scrollThreshold: 200,
        debounceDelay: 300,
        throttleDelay: 100,
        animationDuration: 300
    },

    // App Categories
    categories: [
        { value: 'all', label: 'All Categories' },
        { value: 'educational', label: 'Educational' },
        { value: 'game', label: 'Game' },
        { value: 'productivity', label: 'Productivity' },
        { value: 'social', label: 'Social' },
        { value: 'health', label: 'Health & Fitness' },
        { value: 'finance', label: 'Finance' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'news', label: 'News' },
        { value: 'travel', label: 'Travel' }
    ],

    // Store Badge Configuration
    storeBadges: {
        appStore: {
            image: 'assets/app-store-badge.svg',
            altText: 'Download on the App Store'
        },
        googlePlay: {
            image: 'assets/google-play-badge.svg',
            altText: 'Get it on Google Play'
        }
    },

    // SEO and Meta Information
    seo: {
        siteName: 'Serieworks',
        description: 'Discover innovative mobile apps by Serieworks. Educational tools, games, productivity apps and more.',
        keywords: ['mobile apps', 'iOS', 'Android', 'productivity', 'games', 'education']
    },

    // Feature Flags
    features: {
        showOnlyProduction: true,
        enableAnalytics: false,
        enableDarkMode: false,
        enableLazyLoading: true
    },

    // Accessibility
    accessibility: {
        announceChanges: true,
        keyboardNavigation: true,
        focusManagement: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
