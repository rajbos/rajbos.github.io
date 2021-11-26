---
layout: post
title: "GitHubs magic files"
date: 2021-11-26
---

I keep coming across files in GitHub that have some mystic magic feeling to them. There's always a small incantation to come with them: the have to have the right name, the right extension *and* have to be stored in the right directory. I wanted to have an overview of all these spells for myself, so here we are 😉.

![Photo of a cauldron with a person pointing a want to it, mist coming out of the cauldron](/images/20211126/20211126-github-magic-files.jpg)
###### Photo by <a href="https://unsplash.com/@art_maltsev?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Artem Maltsev</a> on <a href="https://unsplash.com/s/photos/magic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
# Overview
A list of all the magic files that I came across in GitHub.

|Filename|Location|.github repo support|Description|Docs|
|---|---|---|---|---|
|CONTRIBUTING.md|root, /docs or .github|yes|How to contribute to a project|[guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)|
|CODE_OF_CONDUCT.md||yes|Code of conduct||
|CODEOWNERS|||List of people who can make changes to the files or folders|
|CITATION.cff|root|no|Let others know how to citate your work|[cff](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)|
|LICENSE.md||no|||
|FUNDING.md||yes|||
|SECURITY.md||yes|||
|SUPPORT.md||yes|||
|FORM-NAME.yml|.github/ISSUE_TEMPLATE/||Issue templates|[templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)|
|config.yml|.github/ISSUE_TEMPLATE/||Issue templates configuration settings|[template chooser](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#configuring-the-template-chooser)|
||.github/?||Dependabot configuration file||
||.github/?||CodeQL configuration file||
|README.md|root / ? ||Project readme, also used on marketplace if the repo is published to the marketplace|
|README.md|.github/user/||Profile readme||
|README.md|.github/organization/||Organization readme||
|workflow.yml|.github/workflows/|||[workflows](https://docs.github.com/en/github/automating-your-workflow/automating-workflows-with-github-actions)|
|action.yml/action.yaml|root||Configuration file for an actions repository||