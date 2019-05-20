---
layout: default
title: Tools
---
<style>
    .pnl{float:left;margin-right:7px;}
</style>

<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
<div class="panel-heading" markdown="1">

## Tools and references for feature reference
<div>

</div>
</div>
</div>

<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
<div class="panel-heading" markdown="1">

### Development (General)
</div>
<div class="panel-body" markdown="1">

Visual Studio Code: [https://code.visualstudio.com/download](https://code.visualstudio.com/download)  
ARM Template plugin: [https://marketplace.visualstudio.com/items?itemName=msazurermtools.azurerm-vscode-tools](https://marketplace.visualstudio.com/items?itemName=msazurermtools.azurerm-vscode-tools)  

Git for windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)  

PowerShell extension Posh Git:
``` powershell
Install-Module posh-git -Scope CurrentUser
Add-PoshGitToProfile
```

</div>
</div>
</div>
</div>


<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
<div class="panel-heading" markdown="1">

### Azure DevOps Tasks
</div>
<div class="panel-body" markdown="1">

|Task|Link|Description|
|---|---|---|
|WhiteSource Bolt|[marketplace](https://marketplace.visualstudio.com/items?itemName=whitesource.ws-bolt)|Scan your solution for open source issues and known vulnerabilities. Needs the full product for file and line-number specific reports, but provides a good start.|
|SonarQube|[marketplace](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarqube)|Analyzing solutions for code smells, unit test coverage and other technical dept. Needs a SonarQube server or SonarCloud (SaaS offering of the server)|
|Visual Studio Test Platform Installer||Task to install the necessary test tools on a (clean) Agent server to enable running code coverage information from unit tests|
|Analyze test results|[documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/test/test-analytics?view=vsts#install-the-analytics-extension)[marketplace](https://marketplace.visualstudio.com/items?itemName=ms.vss-analytics)|Analyze your test results from inside Azure DevOps! Gives you insight into the most failing tasks and total progression.|
|Analytics|[marketplace](https://marketplace.visualstudio.com/items?itemName=ms.vss-analytics)|Get new insights into the health and status of your work items.| 

</div>
</div>
</div>
</div>

<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
<div class="panel-heading" markdown="1">

### Interesting stuff
</div>
<div class="panel-body" markdown="1">

|Link|Description|
|---|---|
|[GitHub Repo](https://github.com/vanderby/SonarQube-AzureAppService)|How to host SonarQube in an Azure [App Service](https://blogs.msdn.microsoft.com/premier_developer/2018/12/23/sonarqube-hosted-on-azure-app-service/)|
|[Azure Quick Start ARM Templates](https://github.com/Azure/azure-quickstart-templates)|ARM templates for a lot of different Azure resources. Good starting point.|
|[Recover Deleted Azure DevOps Release Definition](https://blogs.msdn.microsoft.com/aseemb/2017/11/22/how-to-undelete-a-deleted-release-definition/)|PowerShell script to recover a deleted Azure DevOps release definition (within 4 weeks after deletion!)|

</div>
</div>
</div>
</div>

<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
<div class="panel-heading" markdown="1">

### Development (Blazor)
</div>
<div class="panel-body" markdown="1">
Blazor related links:
* Context menu element: [https://github.com/stavroskasidis/BlazorContextMenu](https://github.com/stavroskasidis/BlazorContextMenu)
* Complete CRUD using Entity Framework and Web API: [https://www.codeproject.com/Articles/1244729/ASP-NET-Core-Blazor-CRUD-using-Entity-Framework-an](https://www.codeproject.com/Articles/1244729/ASP-NET-Core-Blazor-CRUD-using-Entity-Framework-an)

</div>
</div>
</div>
</div>


<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
<div class="panel-heading" markdown="1">

### Miscellaneous
</div>
<div class="panel-body" markdown="1">

* Unsplash for great images: [www.unsplash.com](https://www.unsplash.com)
* Download Azure Icons from the Portal: [Azure Icon Downloader Chrome Extension](https://buildazure.com/2019/04/12/azure-icon-downloader-chrome-extension/)
* `[Console]::ResetColor()` for resetting the console colors in PowerShell. I somehow have this issue a lot (mostly from VS Code) where my colors are wrong. Usually because of an error or warning message that got posted that didn't reset the colors.    
Running this command will fix it.
</div>
</div>
</div>
</div>
