---
layout: post
title: GitHub governance reference links I share with teams
date: 2026-07-13
tags: [GitHub, Governance, GitHub Enterprise, GitHub Actions, GHAS, GitHub Copilot]
description: "A public resource map to share after GitHub governance conversations, grouped by Enterprise, Actions, and Copilot."
---

After almost every governance conversation, I get the same follow-up question: "Can you send the links again?", so here are some common references around different topics:
- Enterprise governance foundations
- GitHub Actions governance and supply chain controls
- GitHub Advanced Security
- GitHub Copilot governance
Of course these can be combined with other best practices, like the [GitHub Well Architected Framework](https://learn.github.com/well-architected), GitHub Security Lab, and GitHub Security Advisories.

## Enterprise governance foundations

If you are still shaping your platform baseline, these are the references I send first:

- [GitHub Advisory Database](https://github.com/advisories)
- [GitHubs magic files]({{ "/blog/2021/11/26/GitHub-magic-files" | absolute_url }})
- [GitHub Access Tokens explained]({{ "/blog/2022/01/03/GitHub-Tokens" | absolute_url }})

## GitHub Actions governance and supply chain controls

For Actions, I focus on dependency trust, update control, and visibility:

- [Using GitHub Actions with Security in Mind (session recording)](https://www.youtube.com/watch?v=Ers-LcA7Nmc)
- [Really keeping your GitHub Actions usage secure]({{ "/blog/2025/03/16/Really-keepingyour-GitHub-Actions-usage-secure" | absolute_url }})

## GitHub Advanced Security

- [Conference session: Protect your code with GitHub security features (YouTube)](https://www.youtube.com/watch?v=dZYiveyMWXg)

## Copilot governance

This is the section teams ask for most right now:

- [AI Engineering Fluency: track usage, models, and token patterns](https://github.com/rajbos/ai-engineering-fluency/)
- [Xebia Copilot premium request and usage overviews](https://xebia.github.io/github-copilot-premium-reqs-usage/)
- [Copilot updates and announcements](https://tech.xebia.ms/)
- [GitHub Copilot model changes notifier](https://github.com/rajbos/github-copilot-model-notifier)
- [Blogpost: AI Billing and Business Value]({{ "/blog/2026/05/15/ai-billing-business-value" | absolute_url }})

### Copilot Security policies and research notes
- [Running MCP servers securely (research notes)](https://github.com/rajbos/rajbos.github.io/blob/dda323daca33e0def9a88908d0805dd9fbce3787/_posts/2026-03-13-Running-MCP-servers-securily.md)
- [Where the GitHub Copilot extension points break governance]({{ "/blog/2026/05/01/Copilot-extension-governance-concerns" | absolute_url }})