// Injects the shared navigation into #nav-placeholder and marks the current section.
class ComponentLoader {
    constructor() {
        this.currentPage = this.detectCurrentPage();
    }

    detectCurrentPage() {
        if (typeof window.PAGES === 'undefined') return null;
        const path = window.location.pathname;
        const page = window.PAGES.find(p =>
            p.paths.some(pp => path === pp || (pp !== '/' && path.endsWith(pp))) ||
            (p.prefixes || []).some(pre => path.startsWith(pre))
        );
        return page ? page.id : null;
    }

    loadNavigation() {
        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder && window.createNavigation) {
            placeholder.outerHTML = window.createNavigation(this.currentPage);
        }
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadNavigation());
        } else {
            this.loadNavigation();
        }
    }
}

new ComponentLoader().init();
