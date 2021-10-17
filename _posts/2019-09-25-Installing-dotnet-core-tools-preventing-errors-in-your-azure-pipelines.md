---
layout: post
title: "Installing .NET Core tools: Preventing errors in your Azure Pipelines"
date: 2019-09-25
---

I ran into a weird thing in .NET Core Global tools: If you try to install the tools while they are already installed on that system, .NET Core will throw an error and exit with a non-zero exit code. 

**This is not helpful in a Continuous Integration (CI) scenario!**

## Expected installation
Normally you expect that you run an install command like this:
``` PowerShell
dotnet tool install dotnet-stryker -g
```
And the tool would install. This is correct if you run it once.

In Azure DevOps you would call the command from a .NET Core task, as I previously described [here](/blog/2019/09/03/Running-dotnet-tools-in-azure-devops).

![Install command in Azure Pipelines](/images/20190925/2019-09-25_InstallCommand.png)

If you run the pipeline again, or the command locally, you get an error indicating that the tool is already installed!  
![](/images/20190925/2019-09-25_InstallFails.png)  

This behavior seems rather odd to me: if the tool is already installed, then great. Perform a no-op (no operation) and go ahead with the next command. 

In [this issue](https://github.com/dotnet/cli/issues/9482) on GitHub this behavior is described. The team has made a choice about doing it this way, even though they are not sure that this was the [right choice](https://github.com/dotnet/cli/issues/11494#issuecomment-499716465). The current debate seems to be if the decision can be reverted (that would mean a breaking change from the old behavior) or adding a new parameter that would enforce the expected behavior.

# Workaround
The work around for this issue is almost as weird as the issue it self. You run the `update` command for the tool:

``` PowerShell
dotnet tool update dotnet-stryker -g
```

Outcome:
* if the tool is not installed, it will install the latest version!

Seems strange behavior to me, but ok... At least it will return an exit code of 0 and we can move along.

If you run the command again, the tool will try to upgrade to the latest version, which is what I would expect.
The logs do seem to indicate an interesting story... It seems to  reinstall that same version (given there is no newer version available)...! 

![Result of dotnet update](/images/20190925/2019-09-25_UpdateCommandResult.png)  

Strange way of implementing this functionality, at least there is a work around to prevent the CI build from failing.


## Update for multiple parallel executions
I needed to run a dotnet tool parallel on multiple machines in the same pipeline and then this method does not work. Seemed like a conflict when running the update command during the same time window.

To circumvent this, I had to create a small PowerShell script to check the output of the `dotnet tool list -g` command and first manually check if the tool was installed. You can find the code for it in this [Gist](https://gist.github.com/rajbos/b148e9833a5d08165188dbe00cc32301).
##### Note: Not sure why the last exitcode is not 0 when running the regular .NET Core command in an Azure DevOps pipeline, so I had to enforce a normal exit code.