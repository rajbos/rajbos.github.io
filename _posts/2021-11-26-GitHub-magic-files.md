---
layout: post
title: "GitHubs magic files"
date: 2021-11-26
---

I keep coming across files in GitHub that have some mystic magic feeling to them. There's always a small incantation to come with them: the have to have the right name, the right extension *and* have to be stored in the right directory. I wanted to have an overview of all these spells for myself, so here we are 😉.

![Photo of a cauldron with a person pointing a want to it, mist coming out of the cauldron](/images/20211126/20211126-github-magic-files.jpg)
###### Photo by <a href="https://unsplash.com/@art_maltsev?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Artem Maltsev</a> on <a href="https://unsplash.com/s/photos/magic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
# Overview
A list of all the magic files / links that I came across in GitHub.

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
|FORM-NAME.yml|.github/ISSUE_TEMPLATE/||Issue templates with forms (in Beta for github.com, not available for GHES)|[Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)|
|config.yml|.github/ISSUE_TEMPLATE/||Issue templates configuration settings|[Template chooser](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#configuring-the-template-chooser)|
|issue_template.md|.github/ISSUE_TEMPLATE/||Issue template|[Template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#configuring-the-template)|
|Url query|In the url link||Create an issue with certain fields filled in with values|[Create issue with url query](https://docs.github.com/en/enterprise-server@3.4/issues/tracking-your-work-with-issues/creating-an-issue#creating-an-issue-from-a-url-query)|
|pull_request_template.md|root, /docs, /.github or in the PULL_REQUEST_TEMPLATE directory||Create the default body for a Pull Request|[Using a PR template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)|
|workflow.yml|workflow-templates|only available in .github repo|Store starter workflows for your organizations|[Starter workflow templates](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/creating-starter-workflows-for-your-organization)|
|dependabot.yml|.github/||Dependabot configuration file|[Dependabot configuration](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/configuration-options-for-dependency-updates#open-pull-requests-limit)|
|codeql-config.yml|.github/codeql/codeql-config.yml (convention, not required)|sort of|CodeQL configuration file. Can also be stored in an external repository (hence .github repo works). If using external repo, referencing can by done by using `owner/repository/filename@branch` |[CodeQL config](https://docs.github.com/en/code-security/code-scanning/using-codeql-code-scanning-with-your-existing-ci-system/configuring-codeql-runner-in-your-ci-system#using-a-custom-configuration-file)|
|secret_scanning.yml|.github/secret_scanning.yml||Secret scanning configuration file|[Secret scanning](https://docs.github.com/en/code-security/secret-scanning/configuring-secret-scanning-for-your-repositories)|
|README.md|root|yes, see below|Project readme, also used on marketplace if the repo is published to the marketplace||
|README.md|.github/username/username||Profile readme|[About readme's](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)|
|README.md|organizations .github **repo** or .github-private **repo**: profile/README.md||Organization readme|[Organization readme](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile)|
|release.yml|.github|Automatically generated release notes||[Automatically generated release notes](https://docs.github.com/en/enterprise-server@3.5/repositories/releasing-projects-on-github/automatically-generated-release-notes)|
|workflow.yml|.github/workflows/|||[Workflows](https://docs.github.com/en/github/automating-your-workflow/automating-workflows-with-github-actions)|
|action.yml/action.yaml|root||Configuration file for an actions repository||
|$GITHUB_STEP_SUMMARY|workflow||Job summary output in markdown|[Job summary](https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables)|
|{{repo}}/releases/latest|link||To permalink to the latest release as any time.|[Permalink to latest release](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases)|

Some of these are extra tricky, like for example the organization profile lives in a different directory and repo then the user profile readme: `.github` or in `.github-private` repo in the org and then in a folder named `profile`: README.md.  

![Screenshot of creating the .github repo](/images/20211126/20211126-org-profile.jpg.png)
