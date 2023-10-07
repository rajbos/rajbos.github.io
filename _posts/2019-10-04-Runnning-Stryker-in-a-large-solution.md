---
layout: post
title: "Running Stryker on a large .NET / core solution"
date: 2019-10-04
---


## TL;DR
[Stryker](https://stryker-mutator.io/stryker-net/) cannot run for an entire solution with multiple test projects (YET), so we need to help it a little and run each project by itself and then join the results. Finding a way to do so started by checking in with the Stryker team on [GitHub](https://github.com/stryker-mutator/stryker-net/issues/740). I ❤️ OSS!
They are working at making this part easier, so I checked out their code to see if I could help with that. That proved to be rather hard! There is a lot going on under the covers. Still want to help, but first I tried to get a quick fix that I can bring back to the team that wants to run Stryker for their entire solution file, with 112 projects in it (and only growing 😱). Yes, they should see what else needs fixing 😁.

![Stryker logo](/images/2019/20191004/2019/20191004_Stryker_Logo.png)

## Using Stryker in .NET code
I previously posted about using Stryker for .NET in your Azure Pipeline (find it [here](/blog/2019/09/04/Use-Stryker-Azure-DevOps)). After running it for one project, I now want to run it for a lot of projects, in the same solution. Currently, this is not available in the Stryker tooling. After [reaching](https://github.com/stryker-mutator/stryker-net/issues/740) out to Stryker team, I had confirmation that the way I wanted to do things, seemed like the correct way to go:

1. Run Stryker on each project
1. Gather the output files from each run
1. Join all files together
1. Run the full report with the new file

I created all code to do this in a PowerShell file and have shared that on [GitHub](https://github.com/rajbos/Stryker.MultipleProjectRunner). All information on how to do things is in de readme of that repository.


### Files
I've used these file to set things up:
* Run Stryker.ps1
* Stryker.data.json
* StrykerReportEmpty.html

The PowerShell file is the entry point of course. It will use the json file for configuration so we can push in multiple project files to mutate. All the generated json will be copied over to a new output folder and will then be joined together,
From that, I can paste it into the HTML file and store that as a new result file. That gives us the final html file that is self contained.

## Next step
The next step is to update the code in the repo so I can do things like running multiple projects in multiple runs through this script (for example in Azure DevOps, where this can be parallelized), and join the resulting json files back together with an extra call at the end. That means I need to make the current code a little bit more modularized 😄.

For now, this is already a working solution, so: Happy mutating!

## Update:
For the final setup with all steps running in parallel in Azure DevOps you can find the end result [here](/blog/2019/10/11/Parallelizing-a-long-Stryker-Run-in-Azure-DevOps).