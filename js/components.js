// Component loader system
class ComponentLoader {
    constructor() {
        this.isHomePage = this.detectHomePage();
    }

    // Detect if we're on the home page
    detectHomePage() {
        const path = window.location.pathname;
        return path === '/' || path === '/index.html' || path.endsWith('index.html');
    }

    // Load and inject navigation component
    loadNavigation() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder && window.createNavigation) {
            navPlaceholder.outerHTML = window.createNavigation(this.isHomePage);
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