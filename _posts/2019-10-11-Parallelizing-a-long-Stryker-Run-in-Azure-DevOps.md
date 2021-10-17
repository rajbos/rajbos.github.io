---
layout: post
title: "Parallelizing a long Stryker Run in Azure DevOps"
date: 2019-10-11
---

I've been working on a [Stryker](https://stryker-mutator.io/stryker-net/) run for a larger .NET solution (115 projects and counting) and wanted to document on the final setup in Azure DevOps. 

You can find more information on what Stryker is and how this can be used on a .NET project with an example on this previous [blog post](/blog/2019/09/04/Use-Stryker-Azure-DevOps). 

In this post you can find how I got to this point: [link](/blog/2019/10/04/Runnning-Stryker-in-a-large-solution).

![Bird soaring](/images/20191011/dallas-reedy-NEJFAS1Okho-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@dallasreedy?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Photo by Dallas Reedy"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Dallas Reedy</span></a>

# Final Setup in Azure DevOps
You can find the repository with all the scripts on [GitHub](https://github.com/rajbos/Stryker.MultipleProjectRunner). I call these scripts in the Azure DevOps pipelines.

## High level overview
See the screenshot below for the final setup. Jobs 1 & 2 will run in parallel since they aren't linked to any other job as a [dependency](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/phases?view=azure-devops&tabs=classic#dependencies&WT.mc_id=DOP-MVP-5003719). This enables us to run multiple Stryker jobs (each with multiple projects!) at the same time. If there are enough eligible agents in the build pool, we can fan out this rather extensive task. Depending on the number of unit tests and the code that is being tested, mutation testing can easily take a while.

Task 3 **does** have a dependency on the other tasks, so it will run when task 1 and 2 are completed successfully. 

![Build overview](/images/20191011/20191011_01_Overview.png)  


## Running Stryker on a set of projects
Job 1 and 2 have the same taskgroup that will run.  
##### Note: read my previous [post](/blog/2019/10/04/Runnning-Stryker-in-a-large-solution) on the set up I use to run Stryker on a set of projects. This job runs Stryker on all projects in a given folder by creating a specific configuration file for that part of the solution. The next task then uploads all the json files back into Azure DevOps so they will be available for downloading in a later step. This is needed because each agent job will/can run on a different agent and therefore the json files will be generated in a different folder. 
![Build overview](/images/20191011/20191011_02_RunStrykerfromSettingsfile.png)  
Because each job can run on a different agent, we need to build the solution on each agent to make sure that Stryker can run. I've asked the Stryker team why they need this method and to see if we can do that once instead of in each job [here](https://github.com/stryker-mutator/stryker-net/issues/762). Still, the tradeoff with the ability to run on different agents is worth it. If I can change this setup, I will update this post.

After building the solution I need to make sure that the agent has the Stryker tooling installed. I don't like to do that on an agent by hand or by baking tools like this into an agent image. I'd rather have the tool installation available in the build itself. That enables us to add new agents to the pool when needed, without us having to do something to make sure all our tooling works. Checking for a .NET Core tools on a server can be done with the code in this [GitHub Gist](https://gist.github.com/rajbos/b148e9833a5d08165188dbe00cc32301). 
Using PowerShell I then download the files from my [GitHub repository](https://github.com/rajbos/Stryker.MultipleProjectRunner) that has all the code we need to [run Stryker on multiple projects](/blog/2019/10/04/Runnning-Stryker-in-a-large-solution) and join their results. Those results are then copied into the Artifact directory. That way I can pick them up and upload them to the Artifacts linked to this build.

I update the settingsfile here to correct the hard-coded paths in the configuration.json so the tools can find them in the agents source code directory. 

## Joining the Stryker results
![Build overview](/images/20191011/20191011_03_CreateStrykerReport.png)  
This job will first download all the artifacts from the other jobs so we have them available. By using the same code in my [GitHub repository](https://github.com/rajbos/Stryker.MultipleProjectRunner), I can now join those json files and create a new report from it. 

As a final step I upload the generated HTML file (self contained btw, very nice) to the artifacts for the build so they can be downloaded and analyzed.

### Todo
What I haven't done yet, is failing the build on a low mutation score. I'm not sure what is helpful here: I could store the results from each run and use the lowest score to verify it against a threshold, or I could try to calculate an overall score from the results files. Unfortunately that information is not stored in the results json, so that is [currently not possible](https://github.com/stryker-mutator/stryker-net/issues/763). Still, having a (regular) checkup on you unit tests is already a nice improvement to have!