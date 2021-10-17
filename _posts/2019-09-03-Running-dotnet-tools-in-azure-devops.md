---
layout: post
title: "Running .NET Core tools in Azure DevOps"
date: 2019-09-03
---

I wanted to run .NET Core tools in Azure DevOps and ran into some installation issues. I tried installing the tool I needed globally, yet the agent could not find it. 

## Local tools to the rescue
In the latest versions of .NET Core 3.0 (currently still in preview), you can install tools `locally`. This means that you can install the tool in the current folder, with its own version and thus independent from other tools or versions on your machine. More information can be read [here](https://medium.com/@bilalfazlani/net-core-local-tools-are-here-fe9ac2464481).

## Calling the installation of the tool in Azure DevOps
To actually install the tool (locally) through the .NET Core tasks you need to run the command in a specific way. This took quite some testing to figure this out. I wish this was documented a little better, so here it is for myself in the future 😁:  

![Example of the configuration in Azure DevOps](/images/20190903/20190903_ToolInstall.png)

Do note that the `custom command` to run is just `tool` and the parameter input gets the name of the action and the tool.

In this case I am installing [Stryker](https://stryker-mutator.io/stryker-net/) to start with mutation testing.

### Error: 'Cannot find any manifests file'
Just running the installation in the work folder will give the error below. .NET Core wants a config file for local tools. Find more information about that [here](/blog/2019/09/03/fixing-error-.NET-core-dotnet-new-tool-manifest).

``` powershell
Cannot find any manifests file. Searched:
C:\Apps\TFSAgent\_work\7\s\.config\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\s\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\.config\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\dotnet-tools.json
```

To get a new manifest, add an extra .NET Core task and run this custom command:
``` powershell
dotnet new tool-manifest
```

## Run the .NET Core Tool
After setting up a manifest and the installation itself, you can now run the .NET Core tool itself by using a custom command again:  

![Running the .NET Core tool in Azure DevOps](/images/20190903/20190903_ToolRun.png)