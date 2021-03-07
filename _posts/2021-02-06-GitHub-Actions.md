---
layout: post
title: "GitHub Actions & Security: Best practices"
date: 2021-02-06
---

I've been diving into the security aspects of using [GitHub Actions](https://github.com/features/actions) and wanted to share some best practices in one place.  

![Image of locks on a fence](/images/20210206/jon-moore-bBavss4ZQcA-unsplash.jpg)
##### <span>Photo by <a href="https://unsplash.com/@thejmoore?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Jon Moore</a> on <a href="https://unsplash.com/s/photos/security?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>

# Forking action repositories
In the post on [Forking action repositories](https://rajbos.github.io/blog/2021/02/06/GitHub-Actions-Forking-Repositories) I show these best practices:
* Verify the code the Action is executing
* Pinning versions
* Forking repositories
* Keeping your forks up to date

# Secure your private runners
In the post on [Private runners](https://rajbos.github.io/blog/2021/02/07/GitHub-Actions-Security-Private-Runners) I explain these best practices:
* Limit the access of your private runner
* Do not use a runner for more than one repository
* Never use a private runner for you public repositories

# Do not reuse a runner, ever!
* [One runner, one workflow](https://rajbos.github.io/blog/2021/03/07/GitHub-Actions-one-workflow-per-runner)