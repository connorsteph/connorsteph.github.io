// Post renderer for client-side markdown rendering
// Loads markdown files and renders them with frontmatter support

class PostRenderer {
    constructor() {
        this.postContent = null;
        this.metadata = {};
    }

    async init() {
        // Get the post file from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const postFile = urlParams.get('file');

        if (!postFile) {
            this.showError('No post file specified');
            return;
        }

        try {
            await this.loadAndRenderPost(postFile);
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load post: ' + error.message);
        }
    }

    async loadAndRenderPost(postFile) {
        // Fetch the markdown file
        const response = await fetch(`/posts/${postFile}.md`);
        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.statusText}`);
        }

        const markdown = await response.text();

        // Parse frontmatter and content
        const { metadata, content } = this.parseFrontmatter(markdown);
        this.metadata = metadata;

        // Update page metadata
        this.updatePageMetadata();

        // Protect math blocks from markdown processing
        const { protectedContent, mathBlocks } = this.protectMathBlocks(content);

        // Render markdown to HTML
        const html = marked.parse(protectedContent, {
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        // Restore math blocks
        const finalHtml = this.restoreMathBlocks(html, mathBlocks);

        // Insert rendered content
        const contentContainer = document.getElementById('post-content');
        if (contentContainer) {
            contentContainer.innerHTML = finalHtml;
        }

        // Re-process MathJax after content is rendered
        if (window.MathJax && window.MathJax.typesetPromise) {
            await window.MathJax.typesetPromise([contentContainer]);
        }

        // Highlight code blocks if a library is available
        if (window.hljs) {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    protectMathBlocks(content) {
        const mathBlocks = [];
        let index = 0;

        // Replace display math blocks ($$...$$)
        let protectedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
            const placeholder = `MATHBLOCK_${index}_PLACEHOLDER`;
            mathBlocks.push({ placeholder, content: match });
            index++;
            return placeholder;
        });

        // Replace inline math ($...$) - allow multi-line
        protectedContent = protectedContent.replace(/\$([^\$]+?)\$/g, (match, mathContent) => {
            const placeholder = `MATHBLOCK_${index}_PLACEHOLDER`;
            mathBlocks.push({ placeholder, content: match });
            index++;
            return placeholder;
        });

        return { protectedContent, mathBlocks };
    }

    restoreMathBlocks(html, mathBlocks) {
        let result = html;
        for (const block of mathBlocks) {
            result = result.replace(block.placeholder, block.content);
        }
        return result;
    }

    parseFrontmatter(markdown) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);

        if (!match) {
            return { metadata: {}, content: markdown };
        }

        const frontmatter = match[1];
        const content = match[2];

        // Parse YAML-like frontmatter
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Handle arrays (tags)
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.slice(1, -1).split(',').map(v => v.trim().replace(/["']/g, ''));
                }

                metadata[key] = value;
            }
        });

        return { metadata, content };
    }

    updatePageMetadata() {
        // Update page title
        if (this.metadata.title) {
            document.title = this.metadata.title;
            const headerTitle = document.querySelector('.header-overlay h1');
            if (headerTitle) {
                headerTitle.textContent = this.metadata.title;
            }
        }

        // Update meta description
        if (this.metadata.description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', this.metadata.description);
        }

        // Update post metadata section
        const postDateEl = document.querySelector('.post-date');
        if (postDateEl && this.metadata.date) {
            postDateEl.textContent = this.metadata.date;
        }

        const postCategoryEl = document.querySelector('.post-category');
        if (postCategoryEl && this.metadata.category) {
            postCategoryEl.textContent = this.metadata.category;
        }

        const postTagsEl = document.querySelector('.post-tags');
        if (postTagsEl && this.metadata.tags) {
            const tags = Array.isArray(this.metadata.tags) ? this.metadata.tags : [this.metadata.tags];
            postTagsEl.innerHTML = tags.map(tag =>
                `<span class="tag">${tag}</span>`
            ).join('');
        }
    }

    showError(message) {
        const contentContainer = document.getElementById('post-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <h2>Error Loading Post</h2>
                    <p>${message}</p>
                    <p><a href="/posts.html">← Back to Posts</a></p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const renderer = new PostRenderer();
        renderer.init();
    });
} else {
    const renderer = new PostRenderer();
    renderer.init();
}
