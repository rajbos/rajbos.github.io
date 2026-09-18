---
name: blog-writing
description: Write, edit, or review blog posts for this Jekyll site in Rob Bos' voice while avoiding known AI writing tropes. Use whenever creating a new post in _posts/, rewriting or expanding an existing post, drafting a section or intro, or reviewing a draft for AI tells before publishing.
---

# Blog writing

This site is a personal DevOps journal. Posts should read like Rob wrote them: first person, direct, concrete, opinionated. The single biggest quality risk is prose that reads as machine-generated, so trope avoidance is part of writing, not a separate polish step.

## When to use this skill

- Creating a new post in `_posts/`
- Rewriting, expanding, or restructuring an existing post
- Drafting an intro, a section, or a conclusion
- Reviewing a draft before it gets published
- Any request to "make this sound less like AI"

## Workflow

1. If it's a new post, run `.\Make.ps1 -Command new-post` to generate the file with correct front matter. Run `.\Make.ps1 -Command new-images` when the post needs screenshots.
2. Draft the content following the voice rules below.
3. Self-review against [references/ai-tropes.md](references/ai-tropes.md) before showing the draft. Do not skip this — the catalogue is long and the failure modes are easy to miss while drafting.
4. Report any trope you deliberately kept and why.

## Voice

- First person, conversational, as if explaining to a knowledgeable colleague.
- Open with the context or the problem. No warm-up paragraph.
- Be concrete: real commands, real product names, version numbers, actual URLs.
- State opinions plainly ("I think", "I found", "I wanted to") without hedging them into mush.
- Contractions and informal phrasing are fine and expected.
- `##` / `###` headers, sentence case. Numbered lists for steps, bullets for features or gaps.
- Include screenshots to back up claims rather than describing what you saw.
- Link inline with descriptive anchor text. No separate references section.
- One topic per post. Cut background that doesn't serve it.
- Admit the mistakes and dead ends. That's usually the valuable part.
- Stop when the story is done. No summary section.

## Repo conventions

- Post filename: `_posts/YYYY-MM-DD-title.md`
- Front matter: `layout: post`, `title`, `date`, `tags`
- Images live in `images/YYYY/YYYYMMDD/` and are referenced from the image root with forward slashes: `/images/2025/20251220/20251220_01_AgentTaskPanel.png`
- Internal links use the `absolute_url` filter: `{{ "/blog/about" | absolute_url }}`

## Trope self-review

Read [references/ai-tropes.md](references/ai-tropes.md) and check the draft against it. The ones that show up most often in technical blog posts:

- Negative parallelism ("It's not X, it's Y")
- Rhetorical questions answered immediately
- Preamble and signposting instead of just making the point
- Short fragments as standalone paragraphs for emphasis
- Em dashes everywhere
- Bold-first bullets
- Rule-of-three stacking
- Invented concept labels used as if they're established terms
- Grandiose stakes on a mundane topic
- A signposted conclusion

For each hit: name the trope, quote the passage, and rewrite it in Rob's voice. Don't just flag it.

## Keeping the catalogue current

The trope list drifts as models change. Refresh it with the `check-ai-tropes` prompt (`.github/prompts/check-ai-tropes.prompt.md`), which pulls from [tropes.fyi/directory](https://tropes.fyi/directory). The other standing source is [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).

When you refresh `references/ai-tropes.md`, keep the compact summary in `.github/copilot-instructions.md` in sync.
