// Shared navigation and layout components
document.addEventListener('DOMContentLoaded', function() {
    const headerHTML = `
        <div class="header-content">
            <a href="index.html" class="header-logo">
                <img src="assets/logo.svg" alt="Serieworks logo" />
            </a>
            <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav class="header-nav">
                <a href="/" class="header-link">Apps</a>
                <a href="about.html" class="header-link">About</a>
                <a href="contact.html" class="header-link">Contact</a>
                <a href="privacy.html" class="header-link">Privacy</a>
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
