# Draft Posts

This folder contains draft posts that are not yet published and will not appear in the public posts listing.

## How to Use

### Creating a New Draft
1. Copy `template.html` to create your new draft
2. Rename it to something descriptive (e.g., `my-new-post-draft.html`)
3. Replace the placeholder values:
   - `POST_TITLE` → Your post title
   - `POST_DESCRIPTION` → Brief description
   - `POST_DATE` → Draft date
   - `POST_CATEGORY` → Category name
   - `POST_TAGS` → HTML for tags like `<span class="tag">math</span>`

### Publishing a Draft
When your draft is ready to publish:

1. **Copy the file** from `drafts/` to `posts/` (remove "-draft" from filename)
2. **Remove draft indicators**:
   - Remove "DRAFT:" from the title and header
   - Remove the entire `<div class="draft-notice">` section
   - Change "DRAFT - " to just the actual date
3. **Add to posts listing**: Add the post to the posts list in `posts.html`

### Draft Features
- Clear visual indicators that it's a draft
- Publishing instructions included in the template
- Same MathJax and styling support as published posts
- Not indexed or listed publicly

### Example Workflow
```
drafts/my-post-draft.html  →  posts/my-post.html
```

Then add to `posts.html`:
```html
<article class="post-preview">
    <h2><a href="/posts/my-post.html">My Post Title</a></h2>
    <div class="post-meta">
        <span class="post-date">January 20, 2024</span>
        <span class="post-category">Category</span>
    </div>
    <p class="post-excerpt">Brief description...</p>
    <div class="post-tags">
        <span class="tag">tag1</span>
        <span class="tag">tag2</span>
    </div>
</article>
```
