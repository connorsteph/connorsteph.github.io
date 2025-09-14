// Navigation component
function createNavigation(isHomePage = false) {
    const navLinks = isHomePage
        ? [
            { href: '/projects.html', text: 'Projects' },
            { href: '/cv.html', text: 'CV' },
            { href: 'https://github.com/connorsteph', text: 'GitHub', target: '_blank' }
          ]
        : [
            { href: '/', text: 'Home' },
            { href: '/projects.html', text: 'Projects' },
            { href: '/cv.html', text: 'CV' },
            { href: 'https://github.com/connorsteph', text: 'GitHub', target: '_blank' }
          ];

    const linksHTML = navLinks.map(link =>
        `<a href="${link.href}"${link.target ? ` target="${link.target}"` : ''}>${link.text}</a>`
    ).join('');

    return `
        <nav>
            <div class="nav-container">
                <div class="nav-links">
                    ${linksHTML}
                </div>
            </div>
        </nav>
    `;
}

// Export for use in other scripts
window.createNavigation = createNavigation;