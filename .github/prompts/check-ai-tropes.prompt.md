---
mode: 'agent'
description: 'Check a blog post for common AI writing tropes and suggest rewrites.'
---

Fetch the current trope list from `https://tropes.fyi/directory` and cross-check it against `https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing`. Update the full catalogue in `.github/skills/blog-writing/references/ai-tropes.md` (keep the examples and the `Last refreshed:` date), then update the `### AI Writing Tropes to Avoid` section inside `## Markdown Writing Guidelines` in `.github/copilot-instructions.md` with a fresh compact summary grouped by category (sentence structure, tone, formatting, composition, word choice) so the two stay in sync. Then review the blog post provided as context against that list. For each trope found, name it, quote the offending passage, and suggest a specific rewrite that matches the author's natural writing style as defined in the `### Writing Style` section of the same file.
