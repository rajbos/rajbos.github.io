---
layout: post
title: "Setup an internal GitHub Actions Marketplace"
date: 2021-10-14
tags: [GitHub, GitHub Actions, Marketplace, Governance, Internal, Security]
---

One of the best practices of using GitHub Actions is to [fork all actions](/blog/2021/2021/02/06/GitHub-Actions-Forking-Repositories) that you want to use to your internal actions organization. If often use `organizationname-actions` for that, just like I am doing for my own personal setup here: [rajbos-actions](https://github.com/rajbos-actions).

After forking the repositories I always get the question:

* What now?
* How do we handle internal discovery?
* How can we have a process that gives our engineers control over the actions that we use?
* How can we do all this in a secure way?
* Can we automate this process? How do I stay up to date with the parent repository?

This post describes my way of working, and how I set up a GitHub Actions Marketplace.

![Image of the Actions Marketplace](/images/2021/20211014/20211014_Marketplace.png)

The reasons for forking are [plentiful](/blog/2021/02/06/GitHub-Actions-Forking-Repositories), for example:
- Take control over the Actions as a backup for your production organization (since they are downloaded just-in-time by the runner)
- Have a formal moment in your organization that marks the end of a security check on the actions' source code (very important!)
- Have a central location for all the actions that can be used inside your production organization (combines nicely with the next item)
- Block actions from the marketplace from being used in your production organization (see item above)

Want to know more? Check out a previous user group session on it [here](/blog/2021/05/28/Solidify-show-Using-GitHub-Actions-Securely) or my 2021 session on [GitHub Universe 2021](/blog/2021/10/27/GitHub-Universe-Session)!

After setting the internal marketplace up (see below) that will host the 'blessed' actions, we also need to prevent any other actions from being used in our production organization. You have control over this in the organization settings:

![Screenshot of actions permissions in GitHub](/images/2021/20211014/20211014_Limit.png)

# Internal Actions Marketplace
The reason for having an internal actions marketplace is to have a central location for all the actions that can be used inside our production organization. This is to prevent any actions from the public marketplace from being used in our production organization, without being checked for security risks first.

![Organization setup example from above](/images/2021/20211014/20211014_Organizations.png)

## Guidelines for the actions organization
1. DevOps Engineers own the actions when they fork them
1. Before forking actions there is a full security review
1. Requests for adding actions go through an internal repository by adding issues
1. Setup an internal marketplace to discover the internal actions
1. Have a communication plan on new actions, for example by having an inner source sharing platform (newsletter?)

# Full marketplace process
The process for adding actions to the marketplace is as follows:
1. User finds an action on the marketplace
1. Request through an issue to include it
1. Manual security validation
1. Issue gets labeled `security-check`
1. Security validation on the issue (scan the source repo)
1. Decide on the risk of forking the action and using it
1. Sign off by security team [optional, can be handled by the next step]
1. Issue gets labeled `security-approved`
1. Fork it and own the maintenance
1. Share fixes back to the parent repo

## Request through an issue to include it
I've setup a (start of a) example project [github-actions-requests](https://github.com/rajbos/github-actions-requests) that is used to request actions to be added to the internal marketplace.

To do so:
* a user needs to create an issue in a specifically setup repository, describing the action and the reason for requesting it. It helps if they already have an example repo for which they would like to use it.
* a DevOps engineer with a security mindset / background checks out the actions repository and reviews the code (see more below)
* after the initial and manual check, the engineer labels the issue with `security-check`
* an automated security check is done on the actions repository, with communication in the issue (security scores for example)

## Manual security validation
A DevOps engineer can check out the actions repository and review the code. This is done by:
- looking at the setup of the action: is it JavaScript, Typescript or using a Docker container?
- is the action only doing what it is meant to do?
- does the action read files from disk outside of the work folder? (e.g. your ssh keys)
- does the action read any environment variables?
- what does it do with all the information it has access to? (e.g. does it sent is out to an external endpoint?)
- does it use the [GitHub Token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) for anything? If so, is it safe?
- does it support GitHub Enterprise Server (GHES) if you need it? (e.g. does it use the `github.com` domain for anything, or does it use the `GITHUB_API_URL` environment variable?)

## Security validation
For the security validation you can use your own internal setup. You need something that runs a [Software Composition Analysis (SCA)](https://wiki.owasp.org/images/b/bd/Software_Composition_Analysis_OWASP_Stammtisch_-_Stanislav_Sivak.pdf) scan and from that get security alerts for any dependencies that have them.

There are lots of tools available for this, for example [Black Duck](https://www.synopsys.com/software-integrity/security-testing/software-composition-analysis.html) or [White Source](https://www.whitesourcesoftware.com/resources/blog/software-composition-analysis/). GitHub already has [Dependabot](https://github.blog/2020/2020-06-01-keep-all-your-packages-up-to-date-with-dependabot/#stop-using-vulnerable-dependencies-dependabot-alerts-and-security-updates) available that can be used for free on public repos. Since a fork is already a public repo, you can use it to scan the actions source code as well.

For our final setup I want to have it automated as much as we can, so I'll be describing that process here. After the initial validation is completed and satisfies internal requirements, I want to label the repository with `security-validation` and run automated security validation on it. More on that below, but I am setting that up as well in the [example repo here](https://github.com/rajbos/github-actions-requests).
The results from the checks will be added to the issue as badges from the different systems, with deep links into those systems to check the analysis. That can then be used for the final checks.

### Dependabot
For Software Composition Analysis, we can use Dependabot to scan the actions source code for the packages that it uses. You can see the results of one of my actions in the repositories [Dependency Graph](https://github.com/rajbos/github-action-load-available-actions/network/dependencies):

![Screenshot of the dependency graph](/images/2021/20211014/20211014_DependencyGraph.png)

Here you find the direct dependencies (in this case from the `packages.json` file of the repository) and all the 'transient' dependencies. A transient dependency is a dependency used by one of your direct dependencies. And since the transient dependency can have its own dependencies... it can be a long list. This is why some research shows that 70% of the code you deploy, was never created by you, but pulled in through a dependency. This is of course why a Software Composition Analysis (SCA) is so important to know about the dependencies that you have and match them to a known vulnerability database, also called a 'Common Vulnerabilities and Exposures' or 'CVE'. Some examples of these databases are the [National Vulnerability Database from NIST](https://nvd.nist.gov/) or the [CVE database from Mitre](https://cve.mitre.org/).

GitHub has its own [GitHub Advisory Database](https://github.com/advisories) as well, with lots of vulnerabilities listed in it:

![Screenshot of GitHub Advisory Database](/images/2021/20211014/20211014_GH_Advisories.png)

### Security Advisories
After Dependabot has scanned the actions source code, it knows which dependencies are being used. Next, it will generate a list of security advisories for the packages that it found. It can even generate pull requests to the repository to update the vulnerable packages to a non-vulnerable version. Since we're using it here on a public fork, we don't use it ourselves. The action publisher should use it on their end to fix the issues found. You could of course use it on your fork and then send a Pull Request to the parent repo to fix the issues, and let the publisher know that they can use these features as well.

In this setup we can use the findings from the Dependabot scan to validate if we can use the action without large vulnerabilities in the packages used.

### CodeQL
[CodeQL](https://codeql.github.com/) is a tool that can be used to scan the actions source code for vulnerabilities and available for free on public repositories, which our forks are. You configure it as a workflow like I've done [here](https://github.com/rajbos/github-action-load-available-actions/blob/main/.github/workflows/codeql-analysis.yml). It will use action minutes for its execution.

Be aware that it by default scans the entire repository. In my case, I have a Typescript based action. That means that the Typescript is transpiled to JavaScript and then uploaded to the repository. So CodeQL will then scan everything. This meant that I found an [issue](https://github.com/moment/moment/issues/5946) in `moment.js` through the JavaScript in the repository. Only checking the Typescript code doesn't find that for example of course, since it is not in that part of the code.

The CodeQL workflow will upload its scan results to GitHub, that can be found by going to 'Security' and then 'Code scanning alerts':
![Screenshot of the scanning alert on the JavaScript code](/images/2021/20211014/20211014_SecurityAlert.png)

You can then review the vulnerability listed and check the recommendation.
##### Note: finding the source of the code vulnerability in the JavaScript code can be very hard. Transpile your Typescript with the [inlineSourceMap](https://www.typescriptlang.org/tsconfig#inlineSourceMap) setting to make it easier to find the actual Typescript / dependency source.

### Container scanning
Since the Actions can also be run as a container, we need to check those dependencies as well. That means scanning the container from the image setting in the [action.yaml](https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action#creating-an-action-metadata-file). This setting can also refer to a Dockerfile in the root of the repository:

``` yaml
# action.yml
name: 'Hello World'
description: 'Greet someone and record the time'
inputs:
  who-to-greet:  # id of input
    description: 'Who to greet'
    required: true
    default: 'World'
outputs:
  time: # id of output
    description: 'The time we greeted you'
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.who-to-greet }}
```

Scanning the containers can be done by using something like [Trivy](https://github.com/aquasecurity/trivy) or [Anchore](https://github.com/anchore/anchore-engine).

## Security approved
When you have done all the security checks, we can do a formal approval of the action and on board it to our own actions organization on GitHub. Labeling the issue as `security-approved` will trigger a workflow that:
- Forks the repository to the `organization-actions` organization
- Updates the issue with that information
- Closes the issue since the request has been fulfilled

## Fork it and own the maintenance
Now that we have forked the action, it's up to us to maintain it, update it with the latest changes from the parent repo and fix any issues that might arise (and send those back to the parent repo!). Keeping everything up to date with incoming changes from the parent repo is something that I blogged about earlier [here](/blog/2021/02/06/GitHub-Actions-Forking-Repositories).

##### Note: We also need a process to handle new code scanning alerts on the repository, and a way to keep the CodeQL workflow running, since it is automatically stopped after 90 days of no new code changes in the repository. Then we also need to handle any new security alerts from CodeQL as well.

# Internal marketplace
Now that we have all that setup, we need to have a good way to discover the actions that are available within our actions organization. We can use the default repo overview page, but that doesn't feel very user friendly. We want a searchable list of actions, with more information then the default repository description. Since there is nothing available out of the box, I created something myself.

![Screen shot of internal marketplace at https://rajbos-actions.github.io/actions-marketplace/](/images/2021/20211014/20211014_Marketplace.png)

With the setup from [actions-marketplace](https://github.com/rajbos/actions-marketplace) I've created an actions marketplace out of the box: you can fork it, configure it and use [GitHub Pages](https://guides.github.com/features/pages/) to host your website. With it your internal users have a central place to search for internal actions. I also want to include links in it to the internal workflows that use the actions, so you can find examples easily. For the Marketplace maintainers, this will also give them a way to track the actions internal usage: if the action is no longer used in any workflow, you might want to remove it from the Marketplace and save you some maintenance work.

## Setup the Marketplace
The marketplace repo has been setup with three main components:

1. Gathering the available actions repositories in an organization
1. Gather the **used** actions from an organization
1. Host the marketplace with GitHub Actions to display the info from the previous steps

### Gathering the available actions repositories in an organization
The [`get-action-data.yml`](https://github.com/rajbos/actions-marketplace/blob/main/.github/workflows/get-action-data.yml) workflow loads all the repositories from an organization it has access to, checks the root directory for an `action.yml` or `action.yaml` file and parses it for information. The result will be a json file stored in the target repository with a specific branch named `gh-pages`.

### Gather the used actions from an organization
The [`get-action-usages.yml`](https://github.com/rajbos/actions-marketplace/blob/main/.github/workflows/get-action-usages.yml) workflow loads all the repositories from an organization (can be a different one then the other step) it has access to, checks the workflows directory for all files with a `.yml` extension and parses it for information. The result will be a json file stored in the target repository with a specific branch named `gh-pages`.


# Summary
In this post I've given you a way to get started with an Internal Marketplace for GitHub Actions, to take back responsibility for the usage and maintenance of the actions. I also shown how to incorporate some security checks and some examples of setting all this up.

Got any feedback or more questions on how to set things up? Please let me know!

###### Note: the [github-actions-requests](https://github.com/rajbos/github-actions-requests) example repository that I am setting up currently only does the first few steps. I'm still building the rest of the workflow 😄.

## Current status:
Currently the `github-actions-request`:
* is triggered by labeling the issue
* searches for a uses statement in the last comment of the issue
* if found, it forks the repository to the `organization-actions` organization (hardcoded in the workflow at the moment)
* adds a CodeQL workflow file to the forked repository

Since the 'organization-actions' organization has been setup to enable the Dependency Graph and Dependabot alerts, I don't need to do that in the workflow. I just need a way (after a certain amount of time) to check if there are any alerts and included that back into the issue information.
