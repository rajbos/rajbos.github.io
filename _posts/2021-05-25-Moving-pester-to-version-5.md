---
layout: post
title: "Pester tests: moving from v4 to v5"
date: 2021-05-25
---

This one took me way to many trials and searches to figure out, so I wanted to store it here in case I need it later on.  
Maybe someone else will find this useful as well 😄.

![Pester site header image](/images/20210525/20210525_PesterHeader.png)

# The premise
We have a pipeline for [GDBC](https://www.globaldevopsbootcamp.com) from June 2019 that uses [Pester](https://pester.dev) tests written in PowerShell to verify the outcome of our pipeline: we create (a lot of) resources in Azure and Azure DevOps and want to check if they actually exists.

We run the tests inside a PowerShell task in Azure DevOps and install the Pester module with this:
``` powershell
Install-Module -Name Pester -Force -SkipPublisherCheck
Import-Module Pester
```
This of course installs the latest version. After moving things to a different environment, I skipped the tests for a while (booh!) and yesterday decided to add them back. And lo and behold: things where not working anymore. 

The tricky part was getting things to work with a Pester file that holds parameters that we need to pass into it.

## Pester file has parameters
``` powershell
param (
    [string] $region,
    [string] $pathToJson,
    [string] $runDirectory
)
```
# Parameters we need:
To set things up, we need to set the parameters with some values to use:
``` powershell
$region="LocalDevOpsBootcamp"
$dataFilePath="c:\temp"
$datafilename="data-999.json"
```

# Pester 4.0
With the previous version of Pester we called Pester and added a `Data` object to pass in the variable values.

``` powershell
Invoke-Pester
 -Script 'GDBC-AzureDevopsProvisioning.Tests.ps1'
 -Data = @{
     region = '$region'; 
     pathToJson = '$dataFilePath/$datafilename'; 
     runDirectory = 'AzureDevOps-provisioning' } 
 -OutputFile Test-Pester.XML
 -OutputFormat NUnitXML
```

## Error running the v4 setup against v5
This gave the following warning / error with version 5:
```
WARNING: You are using Legacy parameter set that adapts Pester 5 syntax to Pester 4 syntax. This parameter set is deprecated, and does not work 100%. The -Strict and -PesterOption parameters are ignored, and providing advanced configuration to -Path (-Script), and -CodeCoverage via a hash table does not work. Please refer to https://github.com/pester/Pester/releases/tag/5.0.1#legacy-parameter-set for more information.

System.Management.Automation.RuntimeException: No test files were found and no scriptblocks were provided.

 at Invoke-Pester<End>, C:\Program Files\WindowsPowerShell\Modules\Pester\5.2.1\Pester.psm1: line 5082
 at <ScriptBlock>, D:\a\_temp\272537fd-8fdd-42fc-b176-803d9ca859d6.ps1: line 7
 at <ScriptBlock>, <No file>: line 1
```

# Pester 5.*
This is the part that took me way to long to figure out. You can run Pester with a container by calling `Invoke-Pester -Container $container` and add the parameters to pass along to the test.  
That is step 1. 

If you also want to add settings, you need to **wrap the container in a configuration**!

So the steps are:
1. Create a container
1. Add the parameters **and** the testfile(s) to the container
1. Create a configuration
1. Add your settings on the configuration
1. Set the container as the `run` in the configuration
1. Run Pester with the configuration

## Example

``` powershell
# create a new container that will be executed
$container = New-PesterContainer 
 -Path './gdbc2019-provisioning/AzureDevOps-provisioning/GDBC-AzureDevopsProvisioning.Tests.ps1' 
 # include the parameters to pass into the Pester file
 -Data @{
     region = '$region'; 
     pathToJson = 
     "$dataFilePath/$datafilename"; 
     runDirectory = './gdbc2019-provisioning/AzureDevOps-provisioning' 
     } 

# create a new configuration with our settings
$config = New-PesterConfiguration
$config.TestResult.OutputFormat = "NUnitXML"
$config.TestResult.OutputPath = "Test-Pester.XML"

# configure the run with the new container from step 1
$config.Run.Container = $container

# actually call Pester
Invoke-Pester -Configuration $config 
```

More information can be found here: 
* [PesterConfiguration](https://pester-docs.netlify.app/docs/commands/New-PesterConfiguration)
* [Data driven tests with Pester](https://pester.dev/docs/usage/data-driven-tests)