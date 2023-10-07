---
layout: post
title: "Fixing .NET Core tool update issues"
date: 2020-09-18
---

I had an issue running an  [EntityFramework](https://docs.microsoft.com/en-us/ef/?WT.mc_id=DOP-MVP-5003719) command after updating the NuGet packages to the latest version and searching got me to multiple steps and sites to get things fixed. Grouping them here for future reference.

If it helps you as well, please let me know! Always nice to see these posts helping someone else as well.

# The trigger message
This was the initial message that got me on this path:
```
The EF Core tools version '2.2.0-rtm-35687' is older than that of the runtime '3.1.8'. Update the tools for the latest features and bug fixes.
```

![Image of hands](/images/2020/20200918/clay-banks-LjqARJaJotc-unsplash.jpg)
#### <span>Photo by <a href="https://unsplash.com/@claybanks?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Clay Banks</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>

# Use the search Luke!
The number one skill you need as a developer / engineer / person who needs to do this, is asking for help. Learning how to use your google skills to find solution is one way to do it. Even after ~15 years of programming I do this all day long.

For this one, I had to use multiple sources to find a fix.
![Image of all the tabs to get this figured out](/images/2020/20200918/2020/20200918_01_SearchResults.png)

# .NET Core Tools
A [.NET Core tool](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools?WT.mc_id=DOP-MVP-5003719) is a special NuGet package that contains a console application and can be installed in several ways:
* As a global tool
* As a global tool in a custom location
* As a local tool (from version 3.0 and up)
In this case I am using the default, so a global tool.

# Updating .NET Core tools.
Installing or updating any global [.NET Core tool](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools?WT.mc_id=DOP-MVP-5003719#update-a-tool) can be done with the same command:
``` powershell
> dotnet tool update --global dotnet-ef
```
#### Do note: you can use `donet tool install` as well, but the update command does the same thing and will install the tool if it is not installed yet.

# Errors during the update:
Unfortunately running the update resulted in the following error. Seems like we are going down the rabbit hole again...
``` powershell
> dotnet tool update --global dotnet-ef
Tool 'dotnet-ef' has multiple versions installed and cannot be updated.
```

# Fixing the errors
The [.NET Core tools](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools?WT.mc_id=DOP-MVP-5003719) are installed in your user folder by default. There is no centralized storage of what versions are installed, the commands will be found if they can be found in this folder. So, you can look what it contains:
![](/images/2020/20200918/2020/20200918_02_NET_Tools.png)

Each tool has its own folder and in that are folders for each version.
Since there is no centralized storage (the tools folder can be seen as storage of course), deleting the folder for the tool can be used as a first step. You can try to remove a specific version in this folder, but I decided to delete it completely.
#### Note: I had a preview version in here, that might have been the cause of things.
``` powershell
del C:\Users\<USERNAME>\.dotnet\tools\.store\dotnet-ef
```

After deleting that folder and running the [EntityFramework](https://docs.microsoft.com/en-us/ef/?WT.mc_id=DOP-MVP-5003719) command again, you probably get the same error as I had:
``` powershell
Failed to create shell shim for tool 'dotnet-ef': Command 'dotnet-ef' conflicts with an existing command from another tool.
Tool 'dotnet-ef' failed to install.
```
That folder holds information about the version of the tool installed and not the console application itself.
Turns out you also need to remove the executable itself. Makes sense when you find that out, but it was not that intuitive the first time.

So remove the executable:
``` powershell
del C:\Users\<USERNAME>\.dotnet\tools\dotnet-ef.exe
```

Now you can run the update again. You can specify a version if you want to or leave it off to get the latest.
``` powershell
> dotnet tool update --global dotnet-ef --version 3.1.8
```