// Shared navigation and layout components

// Apply theme before paint (this script loads synchronously in <head>).
// Dark mode is the default unless the visitor explicitly chose light.
if (localStorage.getItem('serieworks-theme') !== 'light') {
    document.documentElement.classList.add('dark');
}

document.addEventListener('DOMContentLoaded', function() {
    const headerHTML = `
        <div class="header-content">
            <a href="index.html" class="header-logo">
                <img src="assets/logo.svg" class="logo-light" alt="Serieworks logo" />
                <img src="assets/logo-dark.svg" class="logo-dark" alt="Serieworks logo" />
            </a>
            <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav class="header-nav">
                <a href="/" class="header-link">Apps</a>
                <a href="beta.html" class="header-link">Beta</a>
                <a href="about.html" class="header-link">About</a>
                <a href="contact.html" class="header-link">Contact</a>
                <button class="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false" title="Toggle dark mode">
                    <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
                    </svg>
                    <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" fill="currentColor"/>
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span class="theme-toggle-label">Dark mode</span>
                </button>
            </nav>
        </div>
    `;
    
    const footerHTML = `
        <div class="footer-content">
            © 2025 Serieworks. All rights reserved. | 
            <a href="privacy.html" class="footer-link">Privacy Policy</a>
        </div>
    `;
    
    // Insert header if element exists and is empty
    const header = document.querySelector('.header');
    if (header && !header.querySelector('.header-content')) {
        header.innerHTML = headerHTML;
        console.log('Header inserted');
    }
    
    // Insert footer if element exists and is empty
    const footer = document.querySelector('.footer');
    if (footer && !footer.querySelector('.footer-content')) {
        footer.innerHTML = footerHTML;
    }
    
    // Add footer spacer if it doesn't exist
    if (footer && !document.querySelector('.footer-spacer')) {
        const spacer = document.createElement('div');
        spacer.className = 'footer-spacer';
        footer.parentNode.insertBefore(spacer, footer);
    }
    
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.header-nav');
    
    console.log('Hamburger found:', hamburger);
    console.log('Nav found:', nav);
    
    // Dark mode toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const themeLabel = themeToggle.querySelector('.theme-toggle-label');
        const updateThemeToggle = (isDark) => {
            themeToggle.setAttribute('aria-pressed', String(isDark));
            if (themeLabel) {
                themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
            }
        };
        updateThemeToggle(document.documentElement.classList.contains('dark'));
        themeToggle.addEventListener('click', function() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('serieworks-theme', isDark ? 'dark' : 'light');
            updateThemeToggle(isDark);
        });
    }

    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.header-content')) {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when clicking a link
        const navLinks = nav.querySelectorAll('.header-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }
});
