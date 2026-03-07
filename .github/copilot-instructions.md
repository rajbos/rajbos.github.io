# GitHub Copilot Instructions

## Project Overview
This is a Jekyll-based static site hosted on GitHub Pages, using the `jekyll-theme-cayman` theme. It serves as a DevOps journal/blog.

## Critical Workflows
- **Task Automation**: ALWAYS check `Make.ps1` for common tasks before creating custom scripts.
  - **New Post**: Run `.\Make.ps1 -Command new-post` to generate a new post with correct front matter.
  - **New Images**: Run `.\Make.ps1 -Command new-images` to create the daily image folder structure (`images/YYYY/YYYYMMDD`).
- **Build**: Standard Jekyll build process (`bundle exec jekyll build/serve`).

## Content Conventions
- **Posts**: Located in `_posts/`.
  - **Naming**: `YYYY-MM-DD-title.md`.
  - **Front Matter**:
    ```yaml
    ---
    layout: post
    title: "Title Here"
    date: YYYY-MM-DD
    tags: [Tag1, Tag2]
    ---
    ```
- **Images**:
  - Store in `images/YYYY/YYYYMMDD/`.
  - Reference using absolute paths: `/images/YYYY/YYYYMMDD/filename.png`.
- **Links**: Use the `absolute_url` filter for internal links: `{{ "/blog/about" | absolute_url }}`.

## Architecture & Patterns
- **Layouts**:
  - `default.html`: Base template with navigation and footer.
  - `post.html`: Specific layout for blog posts.
- **Includes**:
  - `head.html`: HTML head section.
  - `giscus.html`: Comments integration.
  - `analytics.html`: Analytics tracking.
- **Configuration**: Main settings in `_config.yml`.
- **Dependencies**: Managed via `Gemfile`.

## Tech Stack
- **Core**: Jekyll (Ruby), Liquid templating.
- **Scripting**: PowerShell (`Make.ps1`).
- **Styling**: CSS/SCSS (Cayman theme).

When helping out with relative urls, always use the forward slash (/) as the delimiter, even on Windows systems.
Image paths start from the image folder, so when an image path is copied in, it should look like this: `/images/2025/20251220/20251220_01_AgentTaskPanel.png`. Convert any backslashes (\) to forward slashes (/) when needed and remove prefix paths.