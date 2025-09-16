// Component loader system
class ComponentLoader {
    constructor() {
        this.currentPage = this.detectCurrentPage();
    }

    // Detect which page we're currently on using the PAGES configuration
    detectCurrentPage() {
        const path = window.location.pathname;

        // Wait for PAGES to be available from nav.js
        if (typeof window.PAGES === 'undefined') {
            return null;
        }

        // Find the page that matches the current path
        const currentPage = window.PAGES.find(page =>
            page.paths.some(pagePath =>
                path === pagePath || path.endsWith(pagePath)
            )
        );

        return currentPage ? currentPage.id : null;
    }

    // Load and inject navigation component
    loadNavigation() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder && window.createNavigation) {
            navPlaceholder.outerHTML = window.createNavigation(this.currentPage);
        }
    }

    // Initialize all components
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadComponents());
        } else {
            this.loadComponents();
        }
    }

    // Load all components
    loadComponents() {
        this.loadNavigation();
    }
}

// Initialize component loader
const componentLoader = new ComponentLoader();
componentLoader.init();