---
layout: post
title: "GitHub Actions & Security: Best practices"
date: 2021-02-06
---

I've been diving into the security aspects of using [GitHub Actions](https://github.com/features/actions) and wanted to share some best practices in one place. If you like to get an overview through a presentation setting instead of a blog, you can also find one of my conference sessions on it [here](/blog/2021/05/28/Solidify-show-Using-GitHub-Actions-Securely). 

![Image of locks on a fence](/images/20210206/jon-moore-bBavss4ZQcA-unsplash.jpg)
##### <span>Photo by <a href="https://unsplash.com/@thejmoore?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Jon Moore</a> on <a href="https://unsplash.com/s/photos/security?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>

# Forking action repositories
In the post on [Forking action repositories](/blog/2021/02/06/GitHub-Actions-Forking-Repositories) I show these best practices:
* Verify the code the Action is executing
* Pinning versions
* Forking repositories
* Keeping your forks up to date

Additionally (and especially in an enterprise setting), you'll want to create your own internal market place for actions. How to set it up and have a good security process around it can be found [here](/blog/2021/10/14/GitHub-Actions-Internal-Marketplace)

# Secure your private runners
In the post on [Private runners](/blog/2021/02/07/GitHub-Actions-Security-Private-Runners) I explain these best practices:
* Limit the access of your private runner
* Do not use a runner for more than one repository
* Never use a private runner for you public repositories

# Do not reuse a runner, ever!
* [One runner, one workflow](/blog/2021/03/07/GitHub-Actions-one-workflow-per-runner)

# Untrusted input 
An overview from GitHub on [untrusted input](https://securitylab.github.com/research/github-actions-untrusted-input), from the issue title to the commit message, if you act upon them (even just echoing them to the output!), they can be misused and therefor are an attack vector.

# Preventing pwn requests
It used to be the case that you would trigger your workflow by using the `pull_request` in the trigger definition. That scope had to much rights, so GitHub has dialed that down. The scope with more rights (to your access token with some write permissions for example) has now been created to be `pull_request_target`. You need to be really careful with [using that scope](https://securitylab.github.com/research/github-actions-preventing-pwn-requests). Best practice here is to use a label for the pull request so you can manually check the PR and authorize its actual execution.

You need to be very careful with incoming Pull Requests from any fork: potentially they are changing scripts/commands in your workflow or even the workflow itself. There have been examples where a PR was send in that updated the workflow and made good use of the 10 concurrent jobs available for open source projects to generate some bitcoin for the attacker. This is why we can't have nice things 😲!
