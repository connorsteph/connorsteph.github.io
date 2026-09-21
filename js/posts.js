/**
 * Notes list: renders posts/posts.json as index rows, with a category filter.
 */

let ALL_POSTS = [];
let ACTIVE_CATEGORY = '';

async function loadPosts() {
    try {
        const response = await fetch('/posts/posts.json');
        const data = await response.json();
        ALL_POSTS = (data.posts || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
        buildFilters(ALL_POSTS);
        renderPosts(ALL_POSTS);
    } catch (error) {
        console.error('Error loading posts:', error);
        const list = document.querySelector('.posts-list');
        if (list) list.innerHTML = '<p class="d" style="padding: 14px 0;">Unable to load notes.</p>';
    }
}

function buildFilters(posts) {
    const holder = document.getElementById('postFilters');
    if (!holder) return;
    const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
    cats.forEach(cat => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.category = cat;
        b.setAttribute('aria-pressed', 'false');
        b.textContent = cat;
        holder.appendChild(b);
    });
    holder.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        ACTIVE_CATEGORY = b.dataset.category || '';
        holder.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        renderPosts(ALL_POSTS.filter(p => !ACTIVE_CATEGORY || p.category === ACTIVE_CATEGORY));
    });
}

function renderPosts(posts) {
    const list = document.querySelector('.posts-list');
    if (!list) return;
    list.querySelectorAll('.row, p').forEach(el => el.remove());

    if (posts.length === 0) {
        const p = document.createElement('p');
        p.className = 'd';
        p.style.padding = '14px 0';
        p.textContent = 'No notes yet.';
        list.appendChild(p);
        return;
    }

    posts.forEach(post => {
        const a = document.createElement('a');
        a.className = 'row notes-cols';
        a.href = post.url;

        const date = document.createElement('span');
        date.className = 'n';
        date.textContent = shortDate(post.date);

        const body = document.createElement('span');
        const t = document.createElement('span');
        t.className = 't';
        t.textContent = post.title;
        const d = document.createElement('span');
        d.className = 'd';
        d.textContent = post.excerpt || '';
        body.appendChild(t);
        body.appendChild(document.createElement('br'));
        body.appendChild(d);

        const cat = document.createElement('span');
        cat.className = 'g';
        cat.textContent = post.category || '';

        a.appendChild(date);
        a.appendChild(body);
        a.appendChild(cat);
        list.appendChild(a);
    });
}

function shortDate(s) {
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\./g, '');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosts);
} else {
    loadPosts();
}
