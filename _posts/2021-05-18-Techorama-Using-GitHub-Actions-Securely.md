---
layout: post
title: "Techorama: Using GitHub Actions Securely"
date: 2021-05-18
---

Today I got to deliver my [session](https://techorama.nl/speakers/session/how-to-secure-your-github-actions/) "Using GitHub Actions Securely" at Techorama, my favorite conference. I could feel the pressure at the start of the session: this is Techorama, so you need to deliver this one top notch!

I think I had some viewers (wasn't visible to me) and I got a couple of questions during the session that I wanted to dive deeper into and address them here. 

![Image of myoctocat.com](/images/20210518/20210518_MyOctocat.png)

I think the sessions have been recorded, but will only be shared with the attendees of the conference. So if you weren't there...

# Slidedeck
I you want to look up some things from the slides or visit one of the many links in there, you can look at the slide deck here:
[here](/slides/20210518%20GitHub%20Actions%20security%20Techorama.pdf).

# Question: Running SAST tools on pull requests from forks
Full question: Secrets are not shared with forks and Action runs from forks cannot use secrets from your repo. How do you run SAST (SonarCloud) on pull requests from forks?
**Answer:**
This was around the part where I was talking about the dangers of running a workflow on a Fork from a Pull Request on a public repository.  
![Image of workflow triggers as play: pull_request_target most importantly](/images/20210518/20210518_ForkTriggers.png)  
If you want to know more about this topic, follow that link to [https://xpir.it/gh-pwn-request](https://xpir.it/gh-pwn-request).

You can still run a SAST tool on a pull request. Just don't blindly run it on a pull request from a forked repo: you don't now what changes someone made before creating the PR. 

What you **can** do, is run a basic workflow with the pull_request trigger that does the security scans on any dependency you want to verify. If that one succeeds (add enough checks to have a feeling of trusting the changes), add a label to the Pull Request.
That label can then trigger a secondary workflow that does the execution of the SAST tool. This secondary workflow can then run with the `pull_request_target` trigger AND the existence of the label. Since adding a label can only be done by a maintainer of the repository, so that is a good safety measure to take.
Additionally you can use [code owners](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-code-owners) in the repository to trigger an additional notification to for example your security engineer in the team to have an extra look. For example when the PR changes something in your `.github` folder, like a workflow file.


# Question: Is a reputation check (comment/starts) a good enough validation for GitHub Actions
**Answer:** you can __try__ to use the reputation check together with the name of the publisher of an action to gauge some things around a GitHub Action. For example, you can see the community involvement with that Action. But really checking if the Action is being maintained can only be done by looking into issues and following the discussions there. It's probably good to check if the Action has been created by the vendor of the tool it's targeting. If the vendor themselves is maintaining it, they have their name attached to it and hopefully they see that as a responsibility to keep their action up to date and as a way to engage the community to enable people to use their product more. So the cloud Actions from Google, AWS and Microsoft Azure are probably good enough to use.

The problem here is that still, you are pulling in code from the internet and you should check what that code is actually doing. Will you really trust the publisher on their blue eyes that they will not screw things up? And after all, we are still humans, so a mishap is a regular thing 😄.

So in my opinion: trust is good, but verification is better.