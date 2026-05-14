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

## Markdown Writing Guidelines

The following apply when writing or editing `.md` files, particularly blog posts in `_posts/`.

### Writing Style

- Write in first person with a direct, conversational tone — as if explaining to a knowledgeable colleague.
- Open posts by stating the context or problem immediately; skip lengthy introductions.
- Use concrete specifics throughout: actual commands, real product names, version numbers, and URLs.
- Share personal experience and opinions plainly ("I think", "I found", "I wanted to") without excessive hedging.
- Use casual, natural language — contractions and informal phrases are appropriate.
- Structure posts with `##` / `###` headers; numbered lists for steps, bullet lists for features or gaps.
- Include screenshots to support key claims rather than just describing them.
- Link to external resources inline with descriptive anchor text, not in a separate references section.
- Keep each post focused on one main topic; avoid padding with unnecessary background.
- End naturally when the story or explanation is complete — no forced "In conclusion" summaries.
- Admit mistakes and struggles openly; the reader learns from the struggle, not just the solution.

### AI Writing Tropes to Avoid

Source: [tropes.fyi/directory](https://tropes.fyi/directory) — refresh with `check-ai-tropes.prompt.md`.

**Sentence structure**
- Negative parallelism: "It's not X — it's Y" / "not because X, but because Y"
- Triple negation: "Not A. Not B. Just C."
- Rhetorical Q&A: self-posed questions immediately answered ("The result? Devastating.")
- Anaphora abuse: the same sentence opener repeated multiple times in a row
- Tricolon overuse: stacked rule-of-three patterns back-to-back
- "It's worth noting" and variants: "Importantly", "Notably", "Interestingly" as filler transitions
- False ranges: "from X to Y" where X and Y aren't on any real spectrum
- Superficial analysis: trailing "-ing" phrases that add no meaning ("reflecting broader trends")

**Tone**
- "Here's the kicker" / "Here's the thing" / "Here's what most people miss": false suspense before unremarkable observations
- "Think of it as...": patronising analogies that assume the reader needs hand-holding
- "Imagine a world where...": AI invitation to futurism
- False vulnerability: polished, risk-free "honesty" that sounds performative
- "The truth is simple": asserting obviousness instead of proving the point
- Grandiose stakes: inflating every argument to world-historical significance
- Vague attributions: "experts say", "several publications" without naming sources
- "Let's break this down" / "Let's unpack this" / "Let's dive in": unnecessary hand-holding preamble
- Invented concept labels: "supervision paradox", "acceleration trap" used as if they are established terms

**Formatting**
- Em-dash addiction: 20+ em-dashes per piece
- Bold-first bullets: every list item starting with a bolded phrase
- Unicode decoration: → arrows and curly quotes instead of standard keyboard characters

**Composition**
- Fractal summaries: "tell them what you'll say; say it; summarise it" applied at every level
- Dead metaphor beating: one metaphor repeated 5–10 times throughout the piece
- Historical analogy stacking: rapid-fire company or tech history to build false authority
- One-point dilution: the same argument restated 8 different ways across thousands of words
- Listicle in disguise: "The first... The second... The third..." used to avoid bullet points
- "Despite its challenges...": rigid formula that acknowledges problems only to immediately dismiss them
- The signposted conclusion: "In conclusion...", "To sum up...", "In summary..."

**Word choice**
- "Delve" and friends: "certainly", "utilize", "leverage" (as verb), "robust", "streamline", "harness"
- "Tapestry" and grand nouns: "landscape", "paradigm", "synergy", "ecosystem" when overused
- Magic adverbs: "quietly", "deeply", "fundamentally", "remarkably", "arguably"
- "Serves as" dodge: "serves as", "stands as", "marks", "represents" instead of "is"