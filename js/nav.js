// Site navigation: a fixed left column (top bar on phones).
// Every page includes <div id="nav-placeholder"></div> as the first child of <body>;
// components.js replaces it with the markup built here.

const PAGES = [
    { id: 'home',    n: '01', text: 'Contents', href: '/',              paths: ['/', '/index.html'] },
    { id: 'about',   n: '02', text: 'About',    href: '/about.html',    paths: ['/about.html'] },
    { id: 'work',    n: '03', text: 'Work',     href: '/projects.html', paths: ['/projects.html', '/projects-front.html'], prefixes: ['/projects/'],
      // Shown under Work while you are anywhere in the section: a direct way into each story.
      sub: [
        { text: 'ATOM-1',            href: '/projects/atom1.html' },
        { text: 'Bandits',           href: '/projects/bandits.html' },
        { text: 'Poincaré maps',     href: '/projects/poincare.html' },
        { text: 'Positronium hydride', href: '/projects/q_chem.html' },
        { text: 'Visual servoing',   href: '/projects/visual_servoing.html' },
        { text: 'Ataxx',             href: '/projects/ataxx.html' },
      ] },
    { id: 'notes',   n: '04', text: 'Notes',    href: '/posts.html',    paths: ['/posts.html', '/post.html'], prefixes: ['/posts/'] },
    { id: 'contact', n: '05', text: 'Contact',  href: '/contact.html',  paths: ['/contact.html'] },
];

const EXTERNAL_LINKS = [
    { href: 'https://github.com/connorsteph', text: 'GitHub ↗', target: '_blank', rel: 'noopener' },
    { href: 'https://www.linkedin.com/', text: 'LinkedIn ↗', target: '_blank', rel: 'noopener' }, // TODO: your LinkedIn URL
    { href: '/cv.html', text: 'CV ↗' },
];

function createNavigation(currentPageId = null) {
    const path = window.location.pathname;
    const toc = PAGES.map(p => {
        const cur = p.id === currentPageId ? ' aria-current="page"' : '';
        let html = `<a href="${p.href}"${cur}><span class="n">${p.n}</span><span class="t">${p.text}</span></a>`;
        if (p.sub && p.id === currentPageId) {
            html += '<div class="sub">' + p.sub.map(s => {
                const here = path === s.href || path.endsWith(s.href) ? ' aria-current="page"' : '';
                return `<a href="${s.href}"${here}>${s.text}</a>`;
            }).join('') + '</div>';
        }
        return html;
    }).join('');

    const ext = EXTERNAL_LINKS.map(l =>
        `<a href="${l.href}"${l.target ? ` target="${l.target}"` : ''}${l.rel ? ` rel="${l.rel}"` : ''}>${l.text}</a>`
    ).join('');

    return `
        <nav class="sidebar" aria-label="Sections">
            <a class="masthead ink" href="/">Connor<br>Stephens</a>
            <div class="toc">${toc}</div>
            <div class="spacer"></div>
            <div class="ext">${ext}</div>
        </nav>
    `;
}

window.PAGES = PAGES;
window.createNavigation = createNavigation;
