---
layout: post
title: "Fixing error in .NET Core tool installation"
date: 2019-09-03
---

Last week I was testing some .NET tooling and wanted to install a tool locally instead of globally. To do so you run this command:  

```powershell
dotnet tool install dotnet-stryker
```

While running (either locally or in an [Azure DevOps](https://dev.azure.com) task) I got this error message:  

```cmd
[command]"C:\Program Files\dotnet\dotnet.exe" tool install dotnet-stryker
Cannot find any manifests file. Searched:
C:\Apps\TFSAgent\_work\7\s\StrykerDemo.UnitTests\.config\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\s\StrykerDemo.UnitTests\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\s\.config\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\s\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\.config\dotnet-tools.json
C:\Apps\TFSAgent\_work\7\dotnet-tools.json
C:\Apps\TFSAgent\_work\.config\dotnet-tools.json
C:\Apps\TFSAgent\_work\dotnet-tools.json
C:\Apps\TFSAgent\.config\dotnet-tools.json
C:\Apps\TFSAgent\dotnet-tools.json
C:\Apps\.config\dotnet-tools.json
C:\Apps\dotnet-tools.json
C:\.config\dotnet-tools.json
C:\dotnet-tools.json
```

![.NET Core logo](/images/20190903/20190903-dotnet-core-logo.png)

Searching around on the internet for the file it is searched (throughout the whole folder tree), I found that you need to run this command to create a local manifest:

``` powershell
dotnet new tool-manifest
```

Yet doing so resulted in the following error message and the default prompt to choose a template to run.  
``` powershell
No templates matched the input template name
```

Apparently the command to generate the manifest wasn't available on my machine. Further searching lead to this [GitHub issue](https://github.com/dotnet/cli/issues/10499) that pointed out this was recently added in .NET Core 3.0, so it seemed that it could be coming from an old preview version?

Checking the runtimes I had installed with `dotnet --list-runtimes`, pointed out that I was indeed running on on older version of the preview for .NET Core 3.0. 

``` powershell
Microsoft.NETCore.App 2.2.4 [C:\Program Files\dotnet\shared\Microsoft.NETCore.App]
Microsoft.NETCore.App 3.0.0-preview-27113-06 [C:\Program Files\dotnet\shared\Microsoft.NETCore.App]
Microsoft.NETCore.App 3.0.0-preview-27114-01 [C:\Program Files\dotnet\shared\Microsoft.NETCore.App]
```

Downloading and installing the [latest preview](https://dotnet.microsoft.com/download/dotnet-core/3.0) (3.0.0-preview8-28405-07 at the time of writing) fixed the issue and I could carry on with figuring out my other steps that I was actually working on 😄.