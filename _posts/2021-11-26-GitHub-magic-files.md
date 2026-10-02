---
layout: post
title: "GitHubs magic files"
date: 2021-11-26
tags: [GitHub, magic, files, configuration, pull request templates, issue forms templates, dependabot configuration, GitHub Copilot]
description: "A reference guide to GitHub magic configuration files, covering filenames, locations, and purpose from CODEOWNERS and dependabot.yml to action.yml and more."
---

I keep coming across files in GitHub that have some mystic magic feeling to them. There's always a small incantation to come with them: the have to have the right name, the right extension *and* have to be stored in the right directory. I wanted to have an overview of all these spells for myself, so here we are 😉.

![Photo of a cauldron with a person pointing a want to it, mist coming out of the cauldron](/images/2021/20211126/20211126-github-magic-files.jpg)
###### Photo by <a href="https://unsplash.com/@art_maltsev?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Artem Maltsev</a> on <a href="https://unsplash.com/s/photos/magic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

# Overview
A list of all the magic files / links that I came across in GitHub. I also created a LinkedIn Learning Course for ~25 of these files, with more detail how to use them. You can find that course on [LinkedIn Learning](https://www.linkedin.com/learning/25-github-configuration-files-you-should-be-using).

|Filename|Location|.github repo support|Description|Docs|
|---|---|---|---|---|
|CNAME|root|no|Alias for the GitHub Pages site|[Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)|
|CONTRIBUTING.md|root, /docs or /.github|yes|How to contribute to a project|[Guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)|
|CODE_OF_CONDUCT.md|root, /docs or /.github|yes|Code of conduct|How to behave for this project [Code of Conduct](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project)|
|CODEOWNERS|root, /docs or /.github||List of people who can make changes to the files or folders|[Code owners info](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)|
|CITATION.cff, CITATION.md, and others|root or inst/CITATION|no|Let others know how to citate your work|[cff](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)|
|LICENSE or LICENSE.md or LICENSE.txt or LICENSE.rst|root|no||[License](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)|
|FUNDING.yml|.github folder|yes|Display a Sponsor button in your repo and send people to platforms where they can fund your development|[Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository)|
|SECURITY.md|root, .github or docs folder|yes|Instructions for how to report a security vulnerability|[Security policy](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)|
|SUPPORT.md|root, .github or docs folder|yes|Tell people how to get help for the code in the repo|[Docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-support-resources-to-your-project)|
|workflow.yml|workflow-templates|only available in .github repo|Store starter workflows for your organizations|[Starter workflow templates](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/creating-starter-workflows-for-your-organization)|
|dependabot.yml|.github/||Dependabot configuration file|[Dependabot configuration](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/configuration-options-for-dependency-updates#open-pull-requests-limit)|
|codeql-config.yml|.github/codeql/codeql-config.yml (convention, not required)|sort of|CodeQL configuration file. Can also be stored in an external repository (hence .github repo works). If using external repo, referencing can by done by using `owner/repository/filename@branch` |[CodeQL config](https://docs.github.com/en/code-security/code-scanning/using-codeql-code-scanning-with-your-existing-ci-system/configuring-codeql-runner-in-your-ci-system#using-a-custom-configuration-file)|
|secret_scanning.yml|.github/secret_scanning.yml||Secret scanning configuration file|[Secret scanning](https://docs.github.com/en/code-security/secret-scanning/configuring-secret-scanning-for-your-repositories)|
|README.md|.github, root, or docs directory|yes, see below|Project readme, also used on marketplace if the repo is published to the marketplace|[About readme's](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)|
|README.md|.github/username/username||Profile readme|[About readme's](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)|
|README.md|organizations .github **repo** or .github-private **repo**: profile/README.md||Organization readme|[Organization readme](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile)|
|release.yml|.github|Automatically generated release notes||[Automatically generated release notes](https://docs.github.com/en/enterprise-cloud@latest/repositories/releasing-projects-on-github/automatically-generated-release-notes#configuring-automatically-generated-release-notes)|
|workflow.yml|.github/workflows/|||[Workflows](https://docs.github.com/en/github/automating-your-workflow/automating-workflows-with-github-actions)|
|auto-assign.yml|.github/workflows/ in the `demo-repository` that the organization onboarding [Tasks](https://github.com/devex-metrics) create for you|no|Workflow that runs the [Auto Assign](https://github.com/marketplace/actions/auto-assign-issues-prs) action (`pozil/auto-assign-issue`) to add assignees and reviewers to issues and pull requests when they are opened. See the [example file](https://github.com/devex-metrics/demo-repository/blob/main/.github/workflows/auto-assign.yml)|[Learn how automation works on GitHub](https://docs.github.com/actions)|
|action.yml/action.yaml|root||Configuration file for an actions repository||
|dependency-review-config.yml|.github|no|Dependency review configuration file|[Dependency review](https://github.com/actions/dependency-review-action#configuration-options)|
|$GITHUB_STEP_SUMMARY|workflow||Job summary output in markdown|[Job summary](https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables)|

## GitHub Copilot Files
With the rise of AI-powered development tools, GitHub Copilot has introduced its own set of magic files to help customize the AI experience for your specific repository context. These files help Copilot understand your project better and provide more relevant suggestions.

|Filename|Location|.github repo support|Description|Docs|
|---|---|---|---|---|
|copilot-instructions.md|.github/|yes|Repository-wide custom instructions providing context and coding guidelines to GitHub Copilot for all requests in the repository|[Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)|
|NAME.instructions.md|.github/instructions/||Path-specific custom instructions that apply to files matching the `applyTo` glob pattern defined in the file's YAML frontmatter. Both repository-wide and path-specific instructions are used when both apply|[Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)|
|AGENTS.md|anywhere in the repository||Agent instructions for Copilot coding agent. The nearest file in the directory tree takes precedence. `CLAUDE.md` and `GEMINI.md` at the repository root are also supported as alternatives for other AI agents|[Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)|
|NAME.prompt.md|.github/prompts/||Reusable prompts for specific and repetitive tasks that can be invoked in Copilot Chat. Supports YAML frontmatter for metadata like description and which tools to use|[Prompt Files](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files)|
|NAME.agent.md|.github/agents/|yes|Custom agent profiles with YAML frontmatter defining the agent's name, description, available tools, and MCP server configurations. Allows creating specialized agents with tailored expertise for specific development tasks. Available on GitHub.com, VS Code, JetBrains, Eclipse, and Xcode|[Custom Agents](https://docs.github.com/en/copilot/reference/custom-agents-configuration)|
|managed-settings.json|.github-private/copilot/|no|Enterprise-managed Copilot settings for clients such as Copilot CLI, VS Code, the GitHub Copilot app, and cloud agent. The older `.github-private/.github/copilot/settings.json` path remains supported for compatibility|[Enterprise-managed settings](https://docs.github.com/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/configure-enterprise-managed-settings)|
|lsp-config.json|.github/||Repository-level language-server configuration for Copilot CLI|[Configure language servers](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/add-lsp-servers)|

Note: content exclusion (preventing Copilot from accessing certain files) is **not** configured via a file - it is set up through your repository or organization settings on GitHub.com. See the [content exclusion docs](https://docs.github.com/en/copilot/how-tos/configure-content-exclusion/exclude-content-from-copilot) for more details.

These files help you customize the AI experience by:
- Providing repository-specific context and coding guidelines through custom instructions
- Applying specific instructions to certain file types or directories
- Guiding Copilot's coding agents with information about your project conventions
- Creating reusable prompts for common development tasks in your project
- Building specialized custom agents with their own tools and MCP server configurations
- Distributing enterprise-wide plugin standards, MCP configs, and hooks to Copilot users automatically

## Sharing custom agents across an organization

Organization-level custom agents live in the `/agents` directory at the root of the organization's `.github` or `.github-private` repository. Both repository names work the same way: agents merged into the default branch become available to every member of the organization, even if they cannot access the repository that contains the agent profiles. A private `.github-private` repository keeps the source restricted, while an internal or public `.github` repository lets members view and contribute to the profiles.

GitHub also provides a useful test path. Put a draft agent in `.github/agents/` inside the `.github-private` repository. That version is only available to people with access to the repository and only while they run a task against that repository. When it is ready, move the profile from `.github/agents/` to the root-level `/agents` directory and merge it into the default branch. The [organization setup documentation](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/prepare-for-custom-agents) explains the shared repository, and the [testing and release guide](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/test-custom-agents) covers this promotion flow.

The organization-level `/agents` directory is for agent profiles. To distribute skills, package them in an Agent Plugins 1.0 plugin and use the enterprise-managed plugin settings described below.

## Enterprise-managed Copilot settings

The enterprise-managed settings file lives in the `.github-private` repository at `copilot/managed-settings.json`. GitHub still accepts the older `.github-private/.github/copilot/settings.json` location, but new configurations should use `managed-settings.json`. The file is downloaded by supported Copilot clients and lets an organization set defaults that users cannot override for the keys it manages.

The available settings include `model`, `enabledPlugins`, `extraKnownMarketplaces`, and `strictKnownMarketplaces`. Administrators can also control permission bypassing with `disableBypassPermissionsMode`, and govern MCP access with `allowedMcpServers` and `deniedMcpServers`. These controls are useful when an organization wants to provide a known set of plugins and tools instead of relying on every developer to configure them locally.

Managed settings apply to [Copilot CLI](https://docs.github.com/copilot/how-tos/use-copilot-agents/coding-agent/manage-agents), [VS Code](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-policies), the [GitHub Copilot app](https://docs.github.com/copilot/how-tos/use-copilot-agents/manage-agents), and the [cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/manage-agents), depending on the setting. The [enterprise-managed settings documentation](https://docs.github.com/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/configure-enterprise-managed-settings) lists the supported clients and keys. Managed values take precedence over local values for settings controlled by the organization, and clients refresh the configuration periodically. GitHub also supports team-specific overrides for organizations that need different policies for different groups.

Enterprise-managed settings are also the place to standardize [Copilot plugins](https://docs.github.com/en/copilot/concepts/agents/about-plugins). An Agent Plugins 1.0 package can include a `plugin.json` manifest, reusable `skills/`, an `mcp.json` configuration, and a `com.github.copilot/` directory for Copilot-specific resources. The `enabledPlugins` and marketplace settings in `managed-settings.json` control which of these plugins are available to enterprise users.

Copilot CLI also supports repository-level language-server configuration in `.github/lsp-config.json`. User-level configuration belongs in `~/.copilot/lsp-config.json`, so that file is useful but isn't a repository magic file.

Just like the other magic files, these need to be named exactly right and placed in the correct directories to work their magic ✨.

Then there is a whole list of templates you can configure for issues / pull requests / discussion:

|Filename|Location|.github repo support|Description|Docs|
|---|---|---|---|---|
|FORM-NAME.yml|.github/ISSUE_TEMPLATE/||Issue templates with forms (in Beta for github.com, not available for GHES)|[Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)|
|config.yml|.github/ISSUE_TEMPLATE/||Issue templates configuration settings|[Template chooser](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#configuring-the-template-chooser)|
|issue_template.md|.github/ISSUE_TEMPLATE/|yes|Issue template|[Template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#configuring-the-template)|
|Url query|In the url link||Create an issue with certain fields filled in with values|[Create issue with url query](https://docs.github.com/en/enterprise-server@3.4/issues/tracking-your-work-with-issues/creating-an-issue#creating-an-issue-from-a-url-query)|
|pull_request_template.md|root, /docs, /.github or in the PULL_REQUEST_TEMPLATE directory|yes|Create the default body for a Pull Request|[Using a PR template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)|
|Discussion category templates|/.github/DISCUSSION_CATEGORY_TEMPLATES|?|Create discussion category templates|[Create discussion category forms](https://docs.github.com/en/discussions/managing-discussions-for-your-community/creating-discussion-category-forms)|

Some of these are extra tricky, like for example the organization profile lives in a different directory and repo then the user profile readme: `.github` or in `.github-private` repo in the org and then in a folder named `profile`: README.md.

![Screenshot of creating the .github repo](/images/2021/20211126/20211126-org-profile.jpg.png)

## Magic links
There are also some magic links that can be super useful.

|Link setup|Description|Documentation|
| --- | --- | --- |
|github.com/OWNER/REPO/releases/latest|Permalink to the latest release|[Permalink to latest release](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases)|
|github.com/userhandle.keys|Get the public part of a users SSH key||
|github.com/userhandle.gpg|Get the public part of a users GPG key||
|github.com/userhandle.png|Get the profile picture of a user||
|avatars.githubusercontent.com/userhandle?s=32|Easy method to show user profile pictures anywhere. The `s` parameter is the size. Example output: ![Rob's avatar, which is a face only photo of his dog: Flynn](https://avatars.githubusercontent.com/rajbos?s=32)||
|github.com/owner/repo#readme|Scroll the repo link to open up with the README text on the page. Since GitHub shows the file content of the repo first, this can be helpful to push you users down the page into the README section. This works because the README is based on a header in the page, so this is just normal HTML behaviour. |

## Atom feeds
A lot of things have atom feeds enabled. The things in all caps need to be configured:

|Link setup|Description|
|---|---|
|github.com/OWNER/REPO/commits.atom|Get an RSS feed for the commits in that repo|
|github.com/OWNER/REPO/commits/BRANCH.atom|Get an RSS feed for all the commits in that branch|
|github.com/OWNER/REPO/wiki.atom| Feed for the wiki in that repo|
|github.com/OWNER/REPO/discussions.atom|Get an RSS feed for the discussions in that repo|
|github.com/OWNER/REPO/releases.atom|Get an RSS feed for the releases in that repo|
|github.com/USER.atom|Get an RSS feed for the user's public activity|
|github.com/security-advisories|Get an RSS feed for ALL the security advisories|

There should also be a feed for issues, but I continuously get HTTP:406 errors on github.com/OWNER/REPO/issues.atom.
Other the user specific feeds can be loaded by making an authenticated call to `https://api.github.com/feeds`.

You can get an entire firehose of ALL issues on the GitHub platform if you want to: `- https://github.com/issues?q=`.

# Personal views
- github.com/issues - get a list of issues that are either created by you, or assigned to you
- github.com/pulls - get a list of pull requests that are either created by you, or assigned to you
- github.com/discussions - get a list of discussions that are either created by you, or assigned to you

## Using separate git configurations with SSH for the same user
You can add a `-` to the ssh url, to have different ssh configs on you machine and use the right one for the right repo.
Exampe: `git@github.com-myworkaccount:devops-actions/load-used-actions`.
This boils down to using a separate hostname (github.com-myworkaccount) to use for the configured repo (devops-actions/load-used-actions).
