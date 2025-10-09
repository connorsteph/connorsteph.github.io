/**
 * Posts List Manager
 * Dynamically loads and renders blog posts from posts.json
 */

async function loadPosts() {
    try {
        const response = await fetch('/posts/posts.json');
        const data = await response.json();
        renderPosts(data.posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        // Fallback to showing an error message
        const postsContainer = document.querySelector('.posts-list');
        if (postsContainer) {
            postsContainer.innerHTML = '<p>Unable to load posts. Please try again later.</p>';
        }
    }
}

function renderPosts(posts) {
    const postsContainer = document.querySelector('.posts-list');
    if (!postsContainer) return;

    // Clear existing content
    postsContainer.innerHTML = '';

    // Sort posts by date (most recent first)
    const sortedPosts = posts.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    // Render each post
    sortedPosts.forEach(post => {
        const article = createPostPreview(post);
        postsContainer.appendChild(article);
    });

    // If no posts, show a message
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts yet. Check back soon!</p>';
    }
}

function createPostPreview(post) {
    const article = document.createElement('article');
    article.className = 'post-preview';

    // Create title and link
    const title = document.createElement('h2');
    const link = document.createElement('a');
    link.href = post.url;
    link.textContent = post.title;
    title.appendChild(link);

    // Create metadata section
    const meta = document.createElement('div');
    meta.className = 'post-meta';

    const date = document.createElement('span');
    date.className = 'post-date';
    date.textContent = post.date;

    const category = document.createElement('span');
    category.className = 'post-category';
    category.textContent = post.category;

    meta.appendChild(date);
    meta.appendChild(category);

    // Create excerpt
    const excerpt = document.createElement('p');
    excerpt.className = 'post-excerpt';
    excerpt.textContent = post.excerpt;

    // Create tags
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'post-tags';

    post.tags.forEach(tagText => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = tagText;
        tagsContainer.appendChild(tag);
    });

    // Assemble the article
    article.appendChild(title);
    article.appendChild(meta);
    article.appendChild(excerpt);
    article.appendChild(tagsContainer);

    return article;
}

// Load posts when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosts);
} else {
    loadPosts();
}

