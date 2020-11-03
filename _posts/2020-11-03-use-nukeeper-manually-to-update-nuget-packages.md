---
layout: post
title: "Use NuKeeper 'manually' to update NuGet packages"
date: 2020-11-03
---

While building up a scheduled pipeline for updating our [NuGet](https://docs.microsoft.com/en-us/nuget?WT.mc_id=DOP-MVP-5003719) dependencies I found [NuKeeper](https://nukeeper.com/) to help with automatically updating the packages we use. If you don't know [NuKeeper](https://nukeeper.com/), it is an open source project that will go through your .NET solution and check with the configured NuGet sources to see if there are any packages that have available updates. If there are updates, it can update your project (or solution) and even generate a Pull Request for you. 

With the DevOps mindset of handling these updates as technical debt, I wanted to run this check automatically each day, get any updates if possible and start our build pipeline to verify if it works.

##### Side note: it uses the normal NuGet flow to check for updates and uses that flow for authenticated/private package sources as well.  


NuKeeper can handle multiple platforms as you can see below. Currently I was running this on GitLab, so the examples given here might need some small tweaks to push the Pull Request for a different platform. The manual check with NuKeeper will work regardless of the platform.
![NuKeeper supported platforms](/images/20201103/20201103NuKeeperSupport.png)  

## Flow
With NuKeeper the normal flow is usually just a one line command:
```
nukeeper repo <repo url> <token>
```

## The issue
The setup I'm working with has an on-premises [GitLab](https://gitlab.com) instance. Even thought NuKeepers [documentation](https://nukeeper.com/platform/gitlab/) states that they support GitLab, it is only the cloud version hosted by GitLab.com. When you use the [nukeeper repo](https://nukeeper.com/commands/repository/) commands, you'll get an error that the url is not a known platform. After adding a parameter indicating it is a GitLab environment, it will tell you that it cannot execute against that url.

## Solution
To still get everything working, I needed to set things up manually with this flow:
```
1. Check for updates on the project/solution
2. If there are no updates, stop the run
3. If there are updates, pull them in
4. Create a new branch
5. Commit and push the changes to origin
6. Create a Pull Request
```

Since we already have a continuous integration pipeline setup, the pull request automatically starts a pipeline that will build and test the solution, so that will make sure the incoming changes don't break anything.

# Checking with NuKeeper manually
I wanted to run NuKeeper and then find out if there are updates available. Currently this is not possible to do in one call: there are some output parameters available, but nothing that is easily usable out of the box.

I used the output to csv parameter, that at least returns all output as an array that I can loop through
``` powershell
    # get update info
    $updates = .\nukeeper inspect --outputformat csv
```

Then you can do a (most ugly) search through the results to see if there are any updates found by NuKeeper:
``` powershell
    # since the update info is in csv, we'll need to search
    $updatesFound = $false
    foreach ($row in $updates) {
        if ($row.IndexOf("possible updates") -gt -1) {
            Write-Host "Found updates row [$row]"; 
            if ($row.IndexOf("0 possible updates") -gt -1) {
                Write-Host "There are no updates"
            }
            else {
                Write-Host "There are updates"
                $updatesFound = $true
                break
            }
        }
    }
```

When updates where found, I can create the new branch and create a Pull Request by hand:
``` powershell
    $branchName = CreateNewBranch
    UpdatePackages
    CommitAndPushBranch -branchName $branchName
    CreateMergeRequest -branchName $branchName -branchPrefix $branchPrefix -gitLabProjectId $gitLabProjectId
```

In UpdatePackages I use the NuKeeper command to update the solution/project:
``` powershell
function UpdatePackages {
    .\nukeeper update
}
```

The full code is available in this [GitHub Gist](https://gist.github.com/rajbos/c4ff9619b9da7dd7f9062d69e0d364e5). I've split this up between the NuKeeper code (nukeeper.ps1) and the GitLab code (gitlab.ps1) for easier reuse.