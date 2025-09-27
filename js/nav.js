// Central configuration for all pages
const PAGES = [
    { id: 'home', href: '/', text: 'Home', paths: ['/', '/index.html'] },
    { id: 'about', href: '/about.html', text: 'About', paths: ['/about.html'] },
    { id: 'projects', href: '/projects.html', text: 'Projects', paths: ['/projects.html'] }
];

// External links that are always shown
const EXTERNAL_LINKS = [
    { href: 'https://github.com/connorsteph', text: 'GitHub', target: '_blank' }
];

// Navigation component
function createNavigation(currentPageId = null) {
    // Get pages excluding the current page
    const pageLinks = PAGES.filter(page => page.id !== currentPageId);

    // Combine page links with external links
    const navLinks = [...pageLinks, ...EXTERNAL_LINKS];

    const linksHTML = navLinks.map(link =>
        `<a href="${link.href}"${link.target ? ` target="${link.target}"` : ''}>${link.text}</a>`
    ).join('');

    return `
        <nav>
            <div class="nav-container">
                <div class="nav-links">
                    ${linksHTML}
                </div>
                <button id="darkModeToggle" class="dark-mode-toggle" aria-label="Toggle dark mode">
                    <span class="dark-mode-icon">🌙</span>
                </button>
            </div>
        </nav>
    `;
}

// Export for use in other scripts
window.PAGES = PAGES;
window.createNavigation = createNavigation;