---
layout: post
title: Running GHAzDo CodeQL on self-hosted runners
date: 2024-01-22
tags: [GitHub Advanced Security for Azure DevOps, Azure DevOps, GHAZDo]
---

When you start running CodeQL scans on your Azure DevOps environment on self-hosted runners, you'll learn that you have to do one extra step and that is install (and keep up to date!) the CodeQL bundle on your self-hosted runners. 

If you don't do this, you'll get an error like this:  
![Screenshot of a run on a self hosted runner](/images/2024/20240122/20240122_01_ErrorMessage.png)  

Following the url in the error will bring you to the [docs](https://learn.microsoft.com/en-us/azure/devops/repos/security/configure-github-advanced-security-features?view=azure-devops&tabs=yaml#extra-prerequisites-for-self-hosted-agents) where you might notice the following three bullets:

1. Pick the latest CodeQL release bundle from GitHub.
1. Download and unzip the bundle to the following directory inside the agent tool directory, typically located under `_work/_tool: ./CodeQL/0.0.0-[codeql-release-bundle-tag (i.e. codeql-bundle-v2.14.2)]/x64/`
1. Create an empty file at `./CodeQL/0.0.0-[codeql-release-bundle-tag (i.e. codeql-bundle-20221105)]/x64.complete`

Getting this configuration right took me longer then I like to admit, so here it is for future reference to get this correct next time:  

# 1. Download the latest version of the bundle
Get the bundle itself for the OS and bitness of the OS the runner is using. In my case I was executing the runner on my Windows 11 laptop, s I needed `codeql-bundle-win64.tar.gz`:
![Screenshot of the codeql-action that hosts the binaries](/images/2024/20240122/20240122_02_Versionnumber.png)

> Note: If you need to automate this, then use the link [https://github.com/github/codeql-action/releases/latest](https://github.com/github/codeql-action/releases/latest) to quickly get to the latest version of the bundle.

# 2. Place the contents of the bundle in the right location on the runner
Go to you runner and get the subfolder `codeql` into the correct location. This took a couple of tries because the docs are confusing.

The correct location looks like this:
`runner\_work\_tool\CodeQL\0.0.0-codeql-bundle-v2.15.5`

Where I have the following remarks:
- `runner`: location where I have installed the runner service itself. This folder name is for you to choose.
- `0.0.0-codeql-bundle-v2.15.5`: this is the version of the bundle you are using. Since I downloaded `v2.15.5` and this bundle is used for all previous versions, this is used in the folder name as well. During testing I found that `0.0.0-v2.15.5` also works.

# 3. Create the `.complete` file at the correct folder
As the docs state, there needs to be a file with the `bitness.complete` name in the right location. I made the mistake of placing that into the `x64` folder, but it needs to be in the version folder. So in my case it needs to be in `0.0.0-codeql-bundle-v2.15.5`.

With that, my folder structure looks like this:  
![Example of the folder structure, showing the x64.complete file in the version folder, and not in x64](/images/2024/20240122/20240122_03_Folderstructure.png)
