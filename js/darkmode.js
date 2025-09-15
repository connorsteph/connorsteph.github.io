// Dark mode functionality
class DarkModeToggle {
    constructor() {
        this.themeKey = 'preferred-theme';
        this.init();
    }

    init() {
        // Set initial theme
        this.setInitialTheme();

        // Wait for DOM to be ready before setting up event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setInitialTheme() {
        const savedTheme = localStorage.getItem(this.themeKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        let theme;
        if (savedTheme) {
            theme = savedTheme;
        } else {
            theme = prefersDark ? 'dark' : 'light';
        }

        this.applyTheme(theme);
    }

    setupEventListeners() {
        // Try to set up toggle button listener immediately
        this.attachToggleListener();

        // Set up MutationObserver to watch for dynamically added navigation
        this.setupNavigationObserver();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.themeKey)) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    attachToggleListener() {
        const toggleButton = document.getElementById('darkModeToggle');
        if (toggleButton && !toggleButton.hasAttribute('data-dark-mode-ready')) {
            toggleButton.addEventListener('click', () => this.toggle());
            toggleButton.setAttribute('data-dark-mode-ready', 'true');
            return true;
        }
        return false;
    }

    setupNavigationObserver() {
        // Watch for navigation being dynamically inserted
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if navigation was added
                            if (node.tagName === 'NAV' || node.querySelector?.('nav')) {
                                if (this.attachToggleListener()) {
                                    // Successfully attached listener, stop observing
                                    observer.disconnect();
                                }
                            }
                        }
                    });
                }
            });
        });

        // Start observing document changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Fallback: stop observing after 5 seconds
        setTimeout(() => {
            observer.disconnect();
        }, 5000);
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        this.applyTheme(newTheme);
        localStorage.setItem(this.themeKey, newTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update the icon in the toggle button
        const icon = document.querySelector('.dark-mode-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
}

// Initialize dark mode toggle
window.darkModeToggle = new DarkModeToggle();

// Export for potential use in other scripts
window.DarkModeToggle = DarkModeToggle;