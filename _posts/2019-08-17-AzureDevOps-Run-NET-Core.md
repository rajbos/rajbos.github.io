---
layout: post
title: "Run .NET Core programs in Azure DevOps"
date: 2019-08-17
---

Recently I wanted to build and run a .NET core console application in Azure DevOps and found out you cannot do that with the default .NET core tasks.

![](/images/20190817/sam-truong-dan--rF4kuvgHhU-unsplash.jpg)  
<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@sam_truong?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Sam Truong Dan"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Sam Truong Dan</span></a>

The default tasks in Azure DevOps and [tutorials](https://docs.microsoft.com/en-us/azure/devops/pipelines/languages/dotnet-core?view=azure-devops) are more geared towards web-development and publishing a zip file that can be used with a WebDeploy command.

For an application,I would have thought that you could run the compiled assembly by calling `dotnet run path-to-assembly` on it. Turns out that the run command is used to run the code from a project, not from a compiled assembly (see the [docs](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-run?tabs=netcore21)).

You can just call `dotnet path-to-assembly`, but the .NET core tasks in Azure DevOps will not let you do that: you can select a custom command, but you cannot leave that command empty for example.

## Option 1: Publish the application to self-contained
Here's how to go around that limitation: publish the application for the platform(s) you want to run: that way you'll have an executable that can be executed with a PowerShell task. I choose the Windows platform as a target and published the files to a separate `publish` folder.  
![Azure Build Pipeline overview](/images/20190816/20190816_06_AzureDevOpsBuild.png).

You can then run it in a release.
The release just consists of extracting the build artefact, overwriting the application settings with an [Azure DevOps Extension](https://marketplace.visualstudio.com/items?itemName=sergeyzwezdin.magic-chunks) and running the executable.

![Azure Release Pipeline Task running the executable](/images/20190816/20190816_06_AzureDevOpsRelease.png)

## Option 2: Run the assembly
An even easier way to run the assembly is to call the dotnet command on the assembly itself, just do it in a PowerShell task:

![Azure Release Pipeline with Task calling the assembly](/images/20190817/20190817_01_AzDo-Run-dll.png)
