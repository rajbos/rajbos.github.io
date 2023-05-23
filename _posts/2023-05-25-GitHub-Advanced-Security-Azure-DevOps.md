---
layout: post
title: "GitHub Advanced Security for Azure DevOps"
date: 2023-05-23
tags: [GitHub Advanced Security, Supply Chain, Security, DevOps, Azure DevOps, GHAS, GHAzDo, Advanced Security]
---

Microsoft is bringing some of the GitHub Advanced Security tools to Azure DevOps. I have been playing with it for a while and they have presented the latest state at Microsoft Build 2023, which includes a  [Public Preview!](https://analyticsindiamag.com/microsoft-makes-github-advanced-security-for-azure-devops-available-in-public-preview/). That means you can try it out yourself, and I can finally share my experiences with you! Since I teach a lot people on how to use this on GitHub, you can find some of the differences between the two implementations in this post as well 😉.

![High tech security image](/images/2023/20230523/adi-goldstein-EUsVwEOsblE-unsplash.jpg)  
##### Photo by <a href="https://unsplash.com/@adigold1?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Adi Goldstein</a> on <a href="https://unsplash.com/photos/EUsVwEOsblE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

## What is GitHub Advanced Security?
GitHub Advanced Security (GHAS) is a set of tools that help you secure your code and your pipelines. It includes the following tools:
- Code scanning
- Dependabot / Dependency scanning
- Secret scanning

If you want to dive deeper into that functionality, check out my LinkedIn Learning Course [here](https://devopsjournal.io/blog/2022/10/19/LinkedIn-Learning-GHAS).

### Dependabot / Dependency scanning
Scans you repository for known manifest files, like package.json, and checks if there are any vulnerabilities in the packages you are using. It will then create a pull request to update the package to a newer version that does not have the vulnerability. It can also automate creating pull requests for version updates as well.

### Secret scanning
Scans your repository for known secrets, like passwords, and notifies you if it finds any. It will also notify you if you push a commit that contains a secret. It will also scan your pull requests for secrets and notify you if it finds any.

### Code scanning
Scans your code for known vulnerabilities using CodeQL (or another Static Application Security Tool, aka SAST). It can also scan your pull requests for vulnerabilities and notify you if it finds any.

# GitHub Advanced Security for Azure DevOps
Microsoft is bringing the features from GHAS into Azure DevOps as customers have been asking for this for a while. It's an example of the way they operate both products now, since the new features will get build for GitHub first, and if it makes sense, they might build some of these features into Azure DevOps as well.

You can see the synergy here as well as of course: any known secret scanning patterns from GHAS can also be used in Azure DevOps, since they can share that between the companies.

## How to get started with GitHub Advanced Security for Azure DevOps

First you will need to enable Advanced Security on the repository level, for which you will need Project Admin level access of course:  

![Screenshot of getting to the repository settings, where you can find a new setting 'Advanced Security' that can be toggled on/off](/images/2023/20230523/20230518_EnablingGHAS.png)  

After enabling the feature (on a repo by repo basis, since it will cost you license seats in the future), you will get a new 'Advanced Security' tab in your repository menu. This will show you the results of the scans that have been done on your repository.

![Overview of the Advanced Security alerts for a repo in Azure DevOps](/images/2023/20230523/20230518%20GHAZDo%20overview.png)

After enabling the feature you will get some extra menu options left and right, as well as extra tasks for your Azure Pipelines.

# Turning on Secret scanning
Secret scanning is turned on automatically when you turn on Advanced Security. It will start a background job that will scan your repository for secrets. It will also scan you repos entire history: all commits and branches will be checked, for known secret patterns. One additional feature is 'push protection'. This will prevent you from pushing a commit that contains a secret. This is a great feature to prevent secrets from being pushed to your repository and 'stop the leak' of new alerts flowing in.

![UI to enable push protection](/images/2023/20230523/20230518%20Secret%20scanning%20push%20protection.png)

# 
# Using dependency scanning
To get started with Dependency scanning you need to inject it into a pipeline. This can be done by adding the following task to your pipeline:

``` yaml
  - task: AdvancedSecurity-Dependency-Scanning@1
```

The next time this pipeline will run, it will scan you repository for known manifest files, like `.csproj` for C# projects, or `package.json` for NodeJS projects. From those manifest files it gathers the information about the packages you are pulling in, and can check the underlying ecosystem for the dependencies of those packages as well (libraries build on other libraries as well). It will then check if there are any vulnerabilities in the packages you are using. You can check each package you use, and all of their dependencies as well, with their version numbers against the National Vulnerability Database ([NVD](https://nvd.nist.gov/) from the NIST institute). Also registered in the NVD is which version is no longer vulnerable (if applicable). 

On GitHub that information is used to create a pull request to update the package to a newer version that does not have the vulnerability. It can also automate creating pull requests for version updates as well. This is not available for GitHub Advanced Security for Azure DevOps. I do expect this will be added later, but for now you will have to create the pull requests yourself. 

In the alert you will get information on the package version that you use, the first non-vulnerable version, as well as the type of vulnerability, so that you can learn on the type of attack vector for this alert.  
![Screenshot of a Dependency alert](/images/2023/20230523/20230518%20Dependency%20Alert.png)  

# Using Code Scanning
For enabling Code Scanning you need to inject CodeQL into an Azure Pipeline as well (other SAST tools will work as well, as long as they upload a [SARIF](https://sarifweb.azurewebsites.net/) file):


``` yaml  
    - task: AdvancedSecurity-Codeql-Init@1
      inputs:
        languages: 'csharp'

    - task: AdvancedSecurity-Codeql-Autobuild@1

    - task: AdvancedSecurity-Codeql-Analyze@1

    - task: AdvancedSecurity-Publish@1
```	

There are a couple of steps to note here:

1. Init will create a local, empty database that will be filled with all the code paths your code is taking (for example: Method A is calling Method B). You also feed it one of the supported languages (C#, Java, C/C++, Python, JavaScript/TypeScript, Go, or Ruby).
2. The auto-build step will try to build you application, based on known patterns for the language you have selected. Sometimes the auto build fails for certain projects, you can then use your own build steps in its place.
3. With Analyze you run all the CodeQL queries against the database that was created in step 1. This will also create a SARIF file that contains all the results of the queries (if a query has a result, it will become an alert).
4. The Publish step will actually upload the SARIF file to the Advanced Security service, which will then show you the results in the UI.

The queries that will be run can be found in the CodeQL repository on [github.com](https://github.com/github/codeql). There is a default set with low noise ratios, but you can also use [extended queries](https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/customizing-code-scanning#using-queries-in-ql-packs) by configuring them this way:

``` yaml
    - task: AdvancedSecurity-Codeql-Analyze@1
      inputs:
        querysuite: 'security-and-quality'
```
##### Note that in Azure DevOps you configure this on the `Analyze` task where as you do that in GitHub in the `Init` step.  

Do be aware that adding more extensive queries will increase the duration of the pipeline, as well as the amount of alerts you will get: the extended queries have a bit more noise and potentially also more false positives. For example from my demo application I went from 4 normal alerts to 7 extra alerts when I added the extended queries from `security-and-quality`. 

The advise is to run these queries at _least_ on a pull request, as well as on a schedule: the community who builds these queries is super active (150~200 pull requests a month in that repository), so you will get new queries that might find vulnerabilities in your code.

When a result of the queries is present, you will see those come by in the logs as well:  
![Screenshot of the log indicating it found two issues](/images/2023/20230523/20230518%20Codescanning%20alerts%20in%20logs.png)  

From the upload of the SARIF file you will then get the alerts generated in the Advanced Security overview:
![Screenshot of the code scanning alerts](/images/2023/20230523/20230518%20CodeScanning%20Alerts.png)  

When you open up an alert you get more information on the detail page:
![Screenshot of the alert detail page](/images/2023/20230523/20230518%20CodeScanning%20Alert%20detail.png)

From here you can again learn more about the vulnerability found, with links back to the Common Weakness Enumeration number (CWE) on the [Mitre site](https://cwe.mitre.org).


# Addressing the alerts
To fix the alerts you will need to actually fix the finding it self. There is not yet a way to dismiss the alerts in Azure DevOps (something we do have on the GitHub side). 

## Fixing secret scanning alerts
For secret scanning the UI currently shows the warning that you need to treat this secret as a leaked value, and fixing can only be done by revoking the secret.  
![Screenshot of a secret scanning alert showing you need to revoke the secret](/images/2023/20230523/20230518%20Secret%20scanning%20alert.png)   
Since there is no way to dismiss this alert through the UI yet, the only way to get rid of this alert is to rewrite the history of the repository so that the commit is no longer in the history. I expect that dismissing alerts will be added in the future, but for now this is the only way to get rid of the alert.

## Fixing dependency scanning alerts
To get rid of a dependency scanning alert you will need to create a pull request to upgrade the dependency to a version that is no longer vulnerable. When the detection scan runs again, the alert will get closed. You have a link back to the pipeline that detected that the vulnerable dependency is no longer present: 
![Screenshot of the closed alert](/images/2023/20230523/20230518_DependencyAlertClosed.png)

## Addressing code scanning alerts
Fixing Code Scanning alerts is a bit more involved, as you will need to actually fix the code that is causing the alert. After fixing the issue, the next scan will close the alert and will link back to the scan that closed the alert. From it, you can find the commit that fixed the issue as well, so you have that end-to-end traceability.

Note that currently you cannot exclude code from the CodeQL scanning (on GitHub you can). That also means that your unit test suite for example, will get scanned as well, with a good change it finds some issues there as well (I had the same issue with my test project).

## Dashboarding
For an overall overview of how you are doing across the entire project or organization, you'll have to look at [Microsoft Defender for DevOps](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction), which is a tool in Microsoft Azure. Since I don't have Defender integrated yet (I think you need a feature flag to enable that), I don't have any screenshots yet. I will add them when I have the access!

The integration does make sense from the Azure perspective and integrate it in the tools folks on Azure Cloud use. But if you only use Azure DevOps, then I would expect an overview to find repeat patterns or dependencies in you Azure DevOps Organization as well. I would not be surprised if they add that overview somewhere in the future. 

## Summarizing
Overall, most of the initial features are already in, with definitely some different choices made comparing it with GitHub's implementation (for example dashboarding). You can see it is early days, but I expect the rest of the features / finetuning will happen fast, now that the initial part has been integrated (which is often the most work).

We now have good security features integrated into Azure DevOps, right into the developer experience, which is where this needs to land in my opinion: with the folks who can act on the findings and fix them early on in their process. I hope they integrate the [dependency-review-action](https://github.com/actions/dependency-review-action) equivalent for Azure DevOps next, so developers will also be enabled to stop the leak (of incoming vulnerable dependencies). 

If you want to know more or have questions, use the comments below!