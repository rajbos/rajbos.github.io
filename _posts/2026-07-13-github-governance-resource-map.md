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
- [GitHubs magic files]({{ "/blog/2021/11/26/GitHub-magic-files" | absolute_url }}) — the hidden config files GitHub looks for in your repos
- LinkedIn Learning: [25 GitHub configuration files you should be using](https://www.linkedin.com/learning/25-github-configuration-files-you-should-be-using)
- [GitHub Access Tokens explained]({{ "/blog/2022/01/03/GitHub-Tokens" | absolute_url }}) — PATs, fine-grained tokens, and when to use which
- [Working with GitHub secrets without admin rights]({{ "/blog/2022/11/02/GitHub-secrets-without-admin-rights" | absolute_url }})
- [Configuration as Code for the GitHub platform]({{ "/blog/2022/03/12/GitHub-config-as-code" | absolute_url }}) — automating user onboarding, team creation, and repository setup

## GitHub Actions governance and supply chain controls

For Actions, I focus on dependency trust, update control, and visibility:

- [Using GitHub Actions with Security in Mind (session recording)](https://www.youtube.com/watch?v=Ers-LcA7Nmc)
- [Maturity levels of using GitHub Actions securely]({{ "/blog/2021/12/11/GitHub-Actions-Maturity-Levels" | absolute_url }}) — an 8-level framework from version pinning to a full request process
- [GitHub Actions & Security: Best practices - Forking Action repositories]({{ "/blog/2021/02/06/GitHub-Actions-Forking-Repositories" | absolute_url }})
- [Setup an internal GitHub Actions Marketplace]({{ "/blog/2021/10/14/GitHub-Actions-Internal-Marketplace" | absolute_url }})
- [How GitHub Actions versioning works]({{ "/blog/2022/10/19/How-GitHub-Actions-versioning-works" | absolute_url }})
- [Analyzing the GitHub marketplace — dependency security is a big issue]({{ "/blog/2022/09/18/Analysing-the-GitHub-marketplace" | absolute_url }})
- [Really keeping your GitHub Actions usage secure]({{ "/blog/2025/03/16/Really-keepingyour-GitHub-Actions-usage-secure" | absolute_url }}) — written after the tj-actions supply chain compromise
- Book: [GitHub Actions in Action](https://www.manning.com/books/github-actions-in-action) on Manning.com — co-authored, includes the security chapters

## GitHub Advanced Security

- [Conference session: Protect your code with GitHub security features (YouTube)](https://www.youtube.com/watch?v=dZYiveyMWXg)
- [GHAS code security configurations]({{ "/blog/2024/04/27/GHAS-code-security-configuration" | absolute_url }}) — rolling out GHAS policies across an org with the new configuration UI
- [Dependabot alert triaging in GitHub]({{ "/blog/2023/10/07/Dependabot-alert-triaging" | absolute_url }}) — hidden UI filters that make alert triage much faster
- [Making the case for GitHub's Secret scanning]({{ "/blog/2023/01/22/Making-the-case-for-secret-scanning" | absolute_url }}) — analysis of 14,000 forked repos that found 1,300+ exposed secrets
- LinkedIn Learning: [GitHub Advanced Security](https://www.linkedin.com/learning/github-advanced-security/github-advanced-security?autoplay=true) — my course covering Dependabot, CodeQL, and secret scanning
- LinkedIn Learning: [GitHub Advanced Security for Azure DevOps](https://www.linkedin.com/learning/learning-github-advanced-security-for-azure-devops/) — the same pillars but inside Azure DevOps pipelines

## Copilot governance

This is the section teams ask for most right now:

- [Successfully scaling GitHub Copilot to thousands of developers (GitHub Universe 2024)]({{ "/blog/2024/10/30/GitHub-Universe-slides" | absolute_url }}) — slides and recording from my session
- [GitHub Copilot Premium Requests]({{ "/blog/2025/06/17/Copilot-premium-requests" | absolute_url }}) — model multipliers, per-plan allowances, and budget controls
- [AI Billing and Business Value]({{ "/blog/2026/05/15/ai-billing-business-value" | absolute_url }})
- [AI Engineering Fluency]({{ "/blog/2026/05/15/ai-engineering-fluency-extension" | absolute_url }}) — VS Code extension that tracks token usage, model choices, and fluency score
- LinkedIn Learning: [Responsible GitHub Copilot: Creating Reliable Code Ethically](https://www.linkedin.com/learning/responsible-github-copilot-creating-reliable-code-ethically)
- [Xebia Copilot premium request and usage overviews](https://xebia.github.io/github-copilot-premium-reqs-usage/)
- [Copilot updates and announcements](https://tech.xebia.ms/)
- [GitHub Copilot model changes notifier](https://github.com/rajbos/github-copilot-model-notifier)
- [GitHub Copilot Extensions]({{ "/blog/2024/09/14/GitHub-Copilot-Extensions" | absolute_url }}) — how to build and govern extensions in Copilot Chat
- [GitHub Copilot App is now in Technical Preview]({{ "/blog/2026/05/14/github-copilot-app" | absolute_url }})

### Copilot security and governance research
- [Running MCP servers securely (research notes)](https://github.com/rajbos/rajbos.github.io/blob/dda323daca33e0def9a88908d0805dd9fbce3787/_posts/2026-03-13-Running-MCP-servers-securily.md)
- [Where the GitHub Copilot extension points break governance]({{ "/blog/2026/05/01/Copilot-extension-governance-concerns" | absolute_url }}) — CLI plugins, local extensions, APM, gh skill, MCP servers, and VS Code registries