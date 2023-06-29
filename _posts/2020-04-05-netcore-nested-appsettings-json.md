---
layout: post
title: "Nesting .NET Core appsettings.json"
date: 2020-04-05
tags: [Visual Studio, Visual Studio Code, .NET Core, appsettings.json, VSCode, nesting]
---

I was working on a new .NET Core Unit/Integration Test project in a solution using Visual Studio and need to load some setting from the configuration. Naturally I wanted to use the same setup for retrieving those settings as in the real project, so I added a new file `appsettings.json`. Next up I wanted to add `appsettings.Development.json` just like we use in normal projects. Somehow I expected it to be nested beneath `appsettings.json`, like in the normal project. Of course, it didn't 😄. While searching for a solution I noticed a lot of screenshots with the same issue: the files where not nested. Here is how to fix it.

![Screenshot of files placed below each other instead of nested](/images/20200405/20200405_01_Files.png)  

## The solution
The solution is updating your csproj file with a (new) item group that indicates the behavior you want:
``` xml
 <ItemGroup>
    <None Update="appsettings.Development.json">
      <DependentUpon>appsettings.json</DependentUpon>
    </None>
  </ItemGroup>
```

With this you tell Visual Studio how you want this file to be displayed!

![Fixed layout](/images/20200405/20200405_02_Fixed.png)

# Visual Studio Code
Note: unfortunately the solution above will __not__ work for Visual Studio code! 
For adding the same setup in Visual Studio Code you need to add the following to your `.vscode/settings.json` file:
``` json
"explorer.fileNesting.enabled": true,
    "explorer.fileNesting.patterns": {
        "appsettings.json": "appSettings.*.json"
    },	
```