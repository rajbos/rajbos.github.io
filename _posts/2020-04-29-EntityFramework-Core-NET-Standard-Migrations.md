---
layout: post
title: "Using EntityFramework Core tooling with .NET Standard"
date: 2020-04-23
---

I want to target .NET Standard so I can always use my libraries in any project later on, independently of its target framework (as long as it supports the .NET Standard version I'm targeting).

![](/images/2020/20200429/hans-vivek-NMv5zwS3fVA-unsplash.jpg)
###### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@oneshotespresso?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Photo from Hans Vivek"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Hans Vivek</span></a>

Today I had an issue with using the Entity Framework Core tools in a .NET Standard Library: the EF Core tools don't support the .NET Standard framework: they can only target .NET Core or .NET Classic (Full framework).

This means that when you use a .NET Standard project to host your database setup in, you will get a nice error message when you run `dotnet ef migrations add InitialCreate`:

```
Startup project 'Provisioning.DataLibrary.csproj' targets framework '.NETStandard'. There is no runtime associated with this framework, and projects targeting it cannot be executed directly. To use the Entity Framework Core .NET Command-line Tools with this project, add an executable project targeting .NET Core or .NET Framework that references this project, and set it as the startup project using --startup-project; or, update this project to cross-target .NET Core or .NET Framework. For more information on using the EF Core Tools with .NET Standard projects, see https://go.microsoft.com/fwlink/?linkid=2034781
```
The documentation [link](https://docs.microsoft.com/en-us/ef/core/miscellaneous/cli/dotnet#other-target-frameworks?WT.mc_id=DOP-MVP-5003719) does point you in the right direction, but it wasn't as easy to find. Next time I run into this issue, I should be able to find the solution quicker 😄.

##### Do note: I happen to still have the version '2.2.0-rtm-35687' of the EF Core tools installed, not sure how this behavior is with the newer versions.

## Solution setup
The docs already indicate to create a dummy project with a dependency on the .NET Standard Library. What they don't clearly explain, is that you then need to do some extra steps to get the EF Core tooling (like migrations) working.

![Screenshot of the solution folders](/images/2020/20200429/20200429_SolutionSetup.png)
I've setup my solution like above:
* Provisioning.DataLibrary holds the DbContext with all of its models and targets .NET Standard 2.0 in this case.
* Provisioning.ConsoleApp is the dummy project with a dependency on the DataLibrary and targets .NET Core 3.1.

You need to add the EF Core designer package to the dummy project for it to get all the commands you want to use:
```powershell
cd Provisioning.ConsoleApp
dotnet add package Microsoft.EntityFrameworkCore.Design
```

Also note that I am using the `appsettings.json` to read the connection string to the database to use for EntityFramework, so I've included them to the console app: that is what EF Core will be using for running everything, so it needs to find those files as well (don't forget to mark them as `Copy always` to actually get them in the correct bin folder.).

I usually open the `Package Manager Console` to execute actions like calling the EF Core Tools, just to stay in the same window. If you open it, you will start in the folder of the solution file. To use the EF Core tools, you'd normally change into the correct folder: in this case `Provisioning.DataLibary` ad then run the tools, like the migration actions:

```powershell
cd Provisioning.DataLibrary
dotnet ef migrations add InitialCreate
```

This will give you the error above: `Provisioning.DataLibrary` is a .NET Standard library and the tools cannot analyze this.

## Correct commands
To get the EF Core tools to work, you can stay in the main (solution) folder and indicate everything the tools need to find the correct references:

```powershell
dotnet ef migrations add InitialCreate --project Provisioning.DataLibrary --startup-project Provisioning.ConsoleApp
```

So, with `--project Provisioning.DataLibrary` it knows where it needs to create the migrations + folders for it.
And with `--project Provisioning.ConsoleApp` it can find a .NET Core project to target.

In the end it's not that complicated, but certainly not intuitive.
