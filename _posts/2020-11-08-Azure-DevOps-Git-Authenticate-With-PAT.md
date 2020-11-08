---
layout: post
title: "Azure Repos: Authenticate Git with a PAT"
date: 2020-11-08
---

Sometimes you have these weird things you run into, and I'm sure I will not be able to find this one if I don't store it here.

![Image of frozen binoculars](/images/20201108/hakan-aldrin-NSnXEpIl6xs-unsplash.jpg)
###### Photo by <a href="https://unsplash.com/@greystoke?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Hakan Aldrin</a>

# Configuring Git with a PAT token with Azure DevOps
Usually in Windows I use the Windows Credential Manager for storing authentication against remote Git repositories. You can also use the SSH setup that [Azure DevOps](https://dev.azure.com?WT.mc_id=DOP-MVP-5003719) supports as a widely used alternative. 

This time I was setting things up for a user with a Docker container and didn't want to setup any of those options: I was already using a [Personal Access Token](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops?WT.mc_id=DOP-MVP-5003719) for accessing the [REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops/?WT.mc_id=DOP-MVP-5003719) and wanted to reuse that for the Git repository as well.

Searching around took quite a while until I found an obscure reference within the Git LFS repo that indicated you could setup Git with an extra authorization header with the PAT token in it. Seriously: can't even find the repo I found this in.

## Solution (repo based)
After some messing around I got things working, so here is the solution for future reference.

``` powershell
function SetupAuthentication {
    param (
        [string] $organization
        [string] $project
        [string] $repoName,
        [string] $userName,
        [string] $PAT        
    )

    # convert the Personal Access Token to a Base64 encoded string
    $B64Pat = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(":$PAT"))

    # store the extra header for git to use
    git config --global --add http.https://$userName@dev.azure.com/$organization/$project/_git/$repoName.extraHeader "AUTHORIZATION: Basic $B64Pat"
}
```

Note that this is specific for the **repository** you are using.

## Solution (project based)
If you want to skip configuring this for every repo, you can also leave the repo name off this setting like the example below:

``` powershell
    # store the extra header for git to use
    git config --global --add http.https://$userName@dev.azure.com/$organization/$project/_git/.extraHeader "AUTHORIZATION: Basic $B64Pat"
```
Note that this is specific for the **project** you are using.

## Solution (organization based)
If you want to skip configuring this for every repo, you can also leave the repo name off this setting like the example below:

``` powershell
    # store the extra header for git to use
    git config --global --add http.https://$userName@dev.azure.com/$organization/_git/.extraHeader "AUTHORIZATION: Basic $B64Pat"
```
Note that this is specific for the **organization** you are using.