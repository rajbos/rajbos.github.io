---
layout: post
title: "GitHubs magic files"
date: 2021-11-26
tags: [GitHub, magic, files, configuration, pull request templates, issue forms templates, dependabot configuration]
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
|release.yml|.github|Automatically generated release notes||[Automatically generated release notes](https://docs.github.com/en/enterprise-server@3.5/repositories/releasing-projects-on-github/automatically-generated-release-notes)|
|workflow.yml|.github/workflows/|||[Workflows](https://docs.github.com/en/github/automating-your-workflow/automating-workflows-with-github-actions)|
|action.yml/action.yaml|root||Configuration file for an actions repository||
|dependency-review-config.yml|.github|no|Dependency review configuration file|[Dependency review](https://github.com/actions/dependency-review-action#configuration-options)|
|$GITHUB_STEP_SUMMARY|workflow||Job summary output in markdown|[Job summary](https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables)|

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
