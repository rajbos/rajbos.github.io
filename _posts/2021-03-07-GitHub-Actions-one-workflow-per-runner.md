---
layout: post
title: "GitHub Actions & Security: Best practices - One workflow per runner"
date: 2021-03-07
---

One important best practice for any Continuous Integration / Continuous Deployment setup is thinking about attack vectors for your setup. One of those vectors is the way you download your third party dependencies. Whether you are using Docker containers or libraries to build your code upon, these dependencies are external to your system. Usually these are pulled in either through a Container Registry (for Docker images) or through a Package Manager. You are downloading those dependencies at build or deploy time from an external source, usually from the internet. 

There are several ways that a malicious actor can try to leverage these dependencies in an effort to compromise your system.

This post is part of a series on best practices for using GitHub Actions in a secure way. You can find the other posts here:
* [Forking action repositories](/blog/2021/02/06/GitHub-Actions-Forking-Repositories)
* [Private runners](/blog/2021/02/07/
GitHub-Actions-Security-Private-Runners)
* [One runner, one workflow](/blog/2021/03/07/GitHub-Actions-one-workflow-per-runner)

![image of locks on a chain](/images/20210307/georg-bommeli-ybtUqjybcjE-unsplash.jpg)
###### <span>Photo by <a href="https://unsplash.com/@calina?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Georg Bommeli</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>

# One workflow per runner
The best practice here is to only use a runner for one single workflow. You might be tempted to setup a set of machines that are dedicated for all your pipelines and install multiple runners on the same machine. Or to maximize the utilization of your machines by letting **all** repositories use the same runners throughout your organization.

# Attack vectors
Some example attack vectors that you need to think about with this setup are:

1. Data Theft
2. Data Integrity Breaches
3. Availability

## Data Theft
An action could be siphoning off your data to a third party. This can be anything: from your host information (OS, IP-address, network information, etc.), your software installation, to locally installed certificates, API-keys or SSH keys. For this reason you need to severely limit the user rights the runner is operating with. Under no circumstance give it root access or network administrator access. Limit it to a service account with access to only the bare minimum it needs: does it really need any internal network access, or is an outgoing https connection enough to do its job? Don't give it access to more of your local disk then the folder it needs to operate on. Only give it write access there and even limit the read access to most of the rest of the disk. 

This is a reason to not blindly use 1 runner and give it access to all your workflows: each workflow should only have access to its own data, and not that of a different workflow. The user the runner is operating on, will have access to everything inside of its workfolder, with all consequences from that access (keep reading below).

## Data Integrity Breaches
We all use open source package managers or container images to build on top of. Most package managers and container setups use a local cache to prevent a new download each time you need a package version. If you reuse the machine, you enable the cache to be used by multiple workflows. What if workflow A runs a malicious script or action and overwrites some of your cache? Workflow B (and C and so on) will be using a package from the cache that has been overwritten with perhaps some malicious content. [Solorigate](http://xpir.it/Solorigate) was a prime example of this attack vector: one assembly overwritten without anyone noticing with the huge consequences from it.

## Availability
Having something compromise your runner does not specifically have to mean stealing your data or overwriting it. Another option can be that the malicious actors want to achieve is hurting your availability to use the workflows altogether. One scenario might be that a zero-day attack is found against your application that can be used to do harm to your company or its users. What if an attacker then has the option to flip a switch somewhere on your runner and all of a sudden you cannot deploy the fix for the zero-day? You're probably very dependent of your pipelines doing the deployment and might not have 'break the glass' setup to deploy an update to production. 

# Summary
All examples above are reasons to **not** reuse your runners for multiple workflows. Limit their access to your machines and network as much as you can and consider setting something up where each execution always gets a new and clean environment, to prevent security issues from it. Using the [hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) from GitHub might even be a better option: GitHub always gives you a new clean instance
