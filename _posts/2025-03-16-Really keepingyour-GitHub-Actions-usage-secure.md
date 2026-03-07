---
layout: post
title: Really keeping your GitHub Actions usage secure
date: 2025-03-16
tags: [Security, GitHub, GitHub Actions]
---

Last Friday what we expected happened: a much used GitHub Action got compromised, read all about it here at the StepSecurity blog where they explain that they detected the issue and jumped into action: [Step Security Blog](https://www.stepsecurity.io/blog/harden-runner-detection-tj-actions-changed-files-action-is-compromised).

![Photo of a person in a yellow raincoat overlooking a horseshoe bent in a road, watching from above](/images/2025/20250316/20250316-SplashImage.jpg)  

## So what happened?
What happened? An Action that was used by over 23.000 public repositories (and who knows how many more private repositories) suffered a compromise where an attacker added malicious code to leak out repository secrets. They also updated all version tags to the new commit, so that anyone who is not following the best practices around GitHub Actions was now leaking out sensitive data, out into the open for public repos (as their Action logs are publicly available as well). The CVE (Common Vulnerability Enumerator) logged for this incident can be found [here as CVE-2025-30066](https://nvd.nist.gov/vuln/detail/cve-2025-30066).

Of course this incident happened on a Friday, just before most people log off for the weekend. There is a good chance your workflow did run in a compromised state, so check your logs!

## How to fix this?
StepSecurity stepped into action and published a version of the action that was not compromised in their own Actions organization: [https://github.com/step-security/changed-files](https://github.com/step-security/changed-files). They create point in time backups for several actions so that their customers can rely on secured and locked down actions, as they need to follow an approval and validation process before the copy of the action is updated. This process helps finding compromises in updates of the action, and keeps the end user safer.

In the mean time the repository has been purged of the malicious code and is back online. Good change a lot of people did not even notice their repository was leaking out information!

## Fixing is nice, but only if you were aware at all
Having a backup of the action for people to switch to can be very helpful, especially since the original GitHub repository got removed leading to errors when the workflows reliant on the action started to run during this period. Knowing about the actual backup is of course then a different challenge. The news about the attack did bubble up through the GitHub Advisories Database, but you will only get a notification if you actual have Dependency Security Alerts enabled on your repository (I have a [video](https://www.linkedin.com/learning/github-advanced-security-ghas/vulnerable-alerts-management?resume=false) on that on LinkedIn Learning).

## How do I prevent this from happening to me?
Al this leads me to the information I wanted to share here. Given the way the GitHub Actions ecosystem works, I bet a lot of people will not be aware of what happened during this attack. Having Dependency Security Alerts on is a good way to at least get a notification, but do realize this is happening after the fact and your workflows might already have been compromised. 

There are two ways to really protect yourself from these types of attacks:

- Use a service from a company like StepSecurity that will validate, secure and store backups of the actions you use. This will prevent downtime in the case that the action gets removed, like it temporarily was in this case.
- Setup your own backups of the Actions you (or you company) uses. Doing so gives you a point in time backup of the action code (so you can still run your workflow). An additional benefit is that you can control when the backup gets updated, and add extra reviews and security checks to it!
- Next to that it is super important to use tools to know what dependencies you have in your supply chain. You should have GitHub's Dependency Graph and Security Alerts enabled on everything (available for free for public repos). The paid version also gives you dashboards with an overview of your entire organization / enterprise.

You can also run these inventories yourself, but using for example the [devops-actions/load-used-actions](https://github.com/devops-actions/load-used-actions) that I maintain.

## Setting up a your own backup process
Ever since GitHub Actions became available, I have been advocating to take control over the actions you rely on. My earliest blogposts around this topic are from 2021!

This process comes with a couple of steps:

1. Fork actions to an organization you own. I recommend a completely separate organization so it is clear what information is stored in that location.
Take ownership over the updates of the actions by using the GitHub Fork Updater. This will give you a process that allows you to review every single update, before you can use the update in your workflows. You can then add extra security checks in that process as well.  
2. This will lead to setting up an [internal marketplace](blog/2021/10/14/GitHub-Actions-Internal-Marketplace) for your organization to use. This will allow you to take inventory over you used actions (and for example easily show you in what workflows a certain actions is used). Additionally you can then setup a request process for actions to be added, so that you can even run all your required security checks up front.

Going through these steps is unfortunately something that every user and company needs to go through to secure their pipelines, which is a key action to take when looking at supply chain security with a security framework like [slsa.dev](https://slsa.dev). And do not think your security responsibility stops with taking ownership over the actions repo! When the action pulls in dependencies, you need to secure those dependencies as well! I have seen actions that download binaries or shell scripts on execution and start running them. Or what about docker images that get downloaded just in time? 

## Next steps
Want to know more? I have presented a session on Using GitHub Actions with Security in Mind several times. A recording from GitHub Universe 2021 can be found [here](https://www.youtube.com/watch?v=Ers-LcA7Nmc).   

I have also co-authored a book on GitHub Actions that also includes these security aspects. You can get that book on [Manning.com](https://www.manning.com/books/github-actions-in-action).  

If you want to deep dive into the security tools GitHub has available, then find my course on [GitHub Advanced Security](https://www.linkedin.com/learning/github-advanced-security) on LinkedIn Learning.
