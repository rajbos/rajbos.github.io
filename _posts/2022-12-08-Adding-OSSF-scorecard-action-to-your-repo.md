---
layout: post
title: "Improving your GitHub repositories security setup by adding the OSSF scorecard action"
date: 2022-12-08
tags: [GitHub, GitHub Actions, OSSF, Security, Open Source Security Foundation]
---

Recently I've started to add the [OSSF scorecard action](https://github.com/ossf/scorecard-action) to my (action) repositories. This is a GitHub action that will run the [OSSF scorecard](https://github.com/ossf/scorecard) checks against your repository to see if you are following best practices, like having a security policy, using a code scanning tool, etc. Using this badge can give your users a quick overview of the security of your repository. OSSF stands for 'Open Source Security Foundation' and is an initiative to improve the security of open source repositories.

## Scorecard action
The scorecard action will do three things (if you use the default settings):
1. Analyze your repository for the checks
2. Upload the results to the GitHub Security tab (using a SARIF file)
3. Upload the results to the OSSF API (A web API that you can even host yourself)
With the data uploaded to the OSSF API you can then retrieve a badge with your latest score and show that on your repository:

![Screenshot of the OSSF badge in a repo, showing a score of 7.1](/images/2022/20221208/20221208_00_OSSF_badge.png)

## Scoring
The action checks your repository against [several checks](https://github.com/ossf/scorecard#scorecard-checks) and then calculates a score for each check on a scale of 0 to 10. Based on the risk for that check, the score is then multiplied with a weight. The final score is the average of all the weighted scores. The higher the score, the better.

Some of the checks that are executed are:
* Branch-Protection: Is branch protection enabled for the default branch?
* Are GitHub Action versions pinned to SHA hashes, following [best practices](/blog/2021/02/06/GitHub-Actions)?
* Is the repository using a code scanning tool? Note that this check currently only supports CodeQL and SonarCloud
* Is there a security policy defined?
* Is there a definition file for Dependabot?

## Setting it up
Setting is up is as easy as going to the [OSSF scorecard action](https://github.com/ossf/scorecard-action#workflow-example) repo and copy the workflow example. Add that to you a new workflow file in your repo and run it from the default branch (usually `main`). After the first run, you can add a link to your README.md file to show the badge.

The result will be a badge showing the latest score:
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/devops-actions/load-runner-info/badge)](https://api.securityscorecards.dev/projects/github.com/devops-actions/load-runner-info)

## Code scanning alerts
The [default workflow](https://github.com/ossf/scorecard-action#workflow-example) also uploads the check results as a SARIF file to the Code Scanning Alerts that you can find on the Security tab of your repository. Each check can give one or more results, so you will get an alert for each result. That way you can fix the issues one by one.

![Screenshot of an alert about dependency pinning that is not followed](/images/2022/20221208/20221208_01_Code_scanning_alert.png)

Even better is that most of these alerts will give you actionable suggestions on how to fix the issue. For example, the alert above will give you a link to the [Step Security](https://app.stepsecurity.io/securerepo/) Application that can analyze your repository and give you a pull request with the changes to fix the issue. They focus on three things:

* Restrict permission for the GITHUB_TOKEN
* Add security agent for GitHub hosted runner (Ubuntu only)
* Pin actions to a full SHA hash

![Screenshot of the three options Step Security gives you to improve your workflow](/images/2022/20221208/20221208_02_ImproveWorkflow.png)

### Restrict permission for the GITHUB_TOKEN
One of the best practices is to always indicate what permissions you want to allow for the GitHub token that will be used in your workflow. The default setting is to permissive: it is `read` and `write` for everything in your repo. I've been advocating that people always make this read-only at the organization level.

Since you cannot see what the organization permissions are, it's a best practice to always specify the rights. You can add it to the top of your workflow file:

```yaml
permissions: read-all
```

And now you can override it at the job level if you need to. For example, if you need to push to a branch, you can add `write` to the `contents` permission:

```yaml
jobs:
  build:
    permissions:
        contents: write
    runs-on: ubuntu-latest
    steps:
     # etc
```

### Add security agent for GitHub hosted runner (Ubuntu only)
This setting is something I want to look into more. It seems that you can add a security agent to your GitHub hosted runner (available only for Ubuntu). It's an extra product from [Step Security](https://github.com/step-security/harden-runner) which is available for free. It will analyze the network traffic in the job and log that in their system. After a couple of runs they know what kind of traffic is to be expected, and then you can convert that to basically a firewall rule. Any violations will then be logged and blocked. This can give you a better perimeter defense (as by default all traffic is allowed).

Definitely something to look into more!

### Pin actions to a full SHA hash
The last option is to pin your actions to a full SHA hash. This is a best practice that I've been [advocating for a while](/blog/2021/2021/02/06/GitHub-Actions). It's a bit more work, but it will make sure that your workflow will not be affected by a malicious actor pushing a new version of an action. What I really like is that this setting will analyze your workflow file (either pasted in or just all workflows in your public repo) and then suggest the SHA hashes of the actions, by looking at their latest version! Even better, they store the latest version in the comment next to the SHA hash, so you can understand where the hash comes from. Even Dependabot understands that comment and will update it in their version update PRs!