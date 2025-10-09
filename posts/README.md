# Posts Directory

This directory contains blog posts and their metadata.

## Adding a New Post

### 1. Create the Post HTML File

Copy `template.html` to create your new post:

```bash
cp posts/template.html posts/your-post-name.html
```

Edit the new file and replace:
- `POST_TITLE` - The title of your post
- `POST_DESCRIPTION` - Meta description for SEO
- `POST_DATE` - Publication date (e.g., "January 15, 2024")
- `POST_CATEGORY` - Category (e.g., "Mathematics", "Machine Learning", "Software Development")
- `POST_TAGS` - Tags as HTML spans (e.g., `<span class="tag">math</span>`)

### 2. Update posts.json

Add your post metadata to `posts/posts.json`:

```json
{
  "posts": [
    {
      "title": "Your Post Title",
      "url": "/posts/your-post-name.html",
      "date": "Month Day, Year",
      "category": "Category Name",
      "excerpt": "A brief description of your post (1-2 sentences).",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}
```

**Important:** Posts are automatically sorted by date (most recent first), so you can add new entries anywhere in the array.

### 3. That's it!

The posts page will automatically display your new post. No need to manually edit `posts.html`.

## Draft Posts

Keep draft posts in the `drafts/` directory. They won't be included in the main posts listing. When ready to publish:

1. Move the file from `drafts/` to `posts/`
2. Remove "DRAFT:" from the title and any draft notices
3. Add the entry to `posts.json`

## Features

- **Automatic Loading**: Posts are dynamically loaded from `posts.json`
- **Automatic Sorting**: Posts are sorted by date (most recent first)
- **MathJax Support**: All posts support mathematical expressions
- **Consistent Styling**: Template ensures consistent look across all posts

