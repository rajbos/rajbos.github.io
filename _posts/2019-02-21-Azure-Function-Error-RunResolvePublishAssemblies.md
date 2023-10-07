---
layout: post
title: "Fixing Azure Function Error RunResolvePublishAssemblies"
date: 2019-02-21
---

I ran into an issue with a new Azure Function I created: when I tried to run it, I got an error message about a `RunResolvePublishAssemblies` setting.

# The target "RunResolvePublishAssemblies" does not exist in the project
![](/images/2019/20190221/2019_02_21_01_PowerShell_Example.png)

Digging around the internet did not give an indication where to look. Most examples pointed to years old [issues](https://github.com/Azure/azure-functions-vs-build-sdk/issues/92) that indicated this message for dotnet core version 1.0. I am running a preview version of 3.0, so that could be the issue.

Testing creating another Function but with Visual Studio did have the same result: the error occurs there as well.

# Finding the issue
Eventually I grabbed another working project with Azure Functions that we where running for a couple of months and went through all its settings to figure out what the issue could be.

Checked items:
* The project SDK had been set correctly to `Microsoft.NET.Sdk`
* The `host.json` pointed to a correct function host version (`2.0`)

Eventually I found the culprit! Because the `global.json` isn't present, the dotnet core version wasn't fixed to any version and that is why it uses a version that doesn't work.

# The fix
Add a `global.json` file into the root of the project folder with this content, pinning the sdk version to something working for Azure Functions, and build the project again.

``` json
{
  "sdk": {
    "version": "2.1.502"
  }
}
```

![](/images/2019/20190221/2019_02_21_01_PowerShell_Working.png)