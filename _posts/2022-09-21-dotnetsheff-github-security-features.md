---
layout: post
title: "Presentation dotnetsheff - Protect your code with GitHub security features"
date: 2022-09-21
---


I have the pleasure of virtually speaking at [dotnetsheff](https://dotnetsheff.co.uk/) and these are the slides for it:

Creating modern software has a lot of moving parts. We all build on top of the shoulders of giants by leveraging closed/open source packages or containers that other people have shared. That makes securing our software a lot more complex as well!

In this session you'll learn what possible attack vectors you need to look for, how to protect yourself against them and how to leverage GitHub's features to make your life easier!

Topics:

- Signed Commits
- Dependabot updates
- Dependency scanning for known vulnerabilities
- Secret scanning (and revoking) out of the box
- Using CodeQL

You can download the slides [here](https://devopsjournal.io/slides/20220921%20dotnetsheff%20-%20Protect%20your%20code%20with%20GitHub%20security%20features.pdf).

[![Opening slide of the presentation](/images/2022/20220921/20220921_OpeningSlide.png)](https://devopsjournal.io/slides/20220921%20dotnetsheff%20-%20Protect%20your%20code%20with%20GitHub%20security%20features.pdf)


## Questions:
Some questions that came up during the presentation:
Q: Can we configure Dependabot to use conventional commits?
A: No you can't. There are several issues on the repo that ask for this, but they have not included it. What you can do, is work with prefixes in the commit message. Read more on this from the [docs](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#commit-message)

Q: Can you run Dependabot locally?
A: You can through a local install or from a Docker container, for example using this [project](https://github.com/dependabot/dependabot-script). But for a feature rich experience, you should use the GitHub setup.

------------------------------------------
## GitHub Advanced Security
Want to learn more about these GitHub Advanced Security features?  
Check out the LinkedIn Learning course I made for it:  
[![Image of my GitHub Advanced Security course at LinkedIn Learning](/images/LinkedIn_Learning/GitHub_Advanced_Security_02_900x505.png)](https://www.linkedin.com/learning/github-advanced-security)  
#### Click the image to go to LinkedIn Learning