---
layout: post
title: "Use Stryker for .NET code in Azure DevOps"
date: 2019-09-04
---

Recently I was at a customer where they where testing running test mutation with  [Stryker](https://stryker-mutator.io/stryker-net/). Mutation testing is a concept where you change the code in your System Under Test (SUT) to see if your unit test would actually fail. If they don't, your unit tests aren't specific enough for the SUT and should be re-evaluated. Since Stryker changes your code, they call it `mutations` and they check if they `survive` with the unit tests or not. Nice play on words there 😄.  

Of course this triggered me to see how this works with .NET code and if we can integrate this in Azure DevOps!

![Hero image](/images/20190829/suzanne-d-williams-VMKBFR6r_jg-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@scw1217?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Photo by Suzanne D. Williams"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Suzanne D. Williams</span></a>

## Setting up an example
To have a SUT and a set of unit tests for this, I have set up a small C# library with .NET Core and some unit tests to run. I created a solution that only contains what we need:  

![Example of Visual Studio Solution explorer with the two projects](/images/20190829/2019-08-29_SolutionExplorer.png)

To have something to unit test I added a simple class that would be instantiated with a string and we load that as a boolean value into a property of the class.  

![Layout of class1](/images/20190829/2019-08-29_StrykerDemo.Class1.png)

To check if my class setup works, I created two unit tests as an example for both the parameter values 'True' and 'False'. You can probably spot the first issue here: I am using different casings in my unit tests, but they still pass the test runs.   

![Example of unit tests for both value 'True' and 'False'](/images/20190829/2019-08-29_StrykerDemo.UnitTests.png)

I've already set up an Azure DevOps build to trigger on any pushes to the repo, with the default .NET Core template to restore the NuGet packages, run a Build and then run the Unit Tests:  
![](/images/20190829/2019-09-04_StrykerAzureDevOps.png)

The Azure DevOps build is green with the current set of tests:

![Azure DevOps build pipeline is green with these tests](/images/20190829/2019-08-29AzureDevOpsBuild.png)

Using [Stryker for .NET](https://stryker-mutator.io/stryker-net/quickstart) can by done on the CLI by installing the `dotnet tool` with this command:
``` powershell
dotnet tool install -g dotnet-stryker
```
I've ran into some configuration issues and an older version of .NET Core that I have documented [here](https://rajbos.github.io/blog/2019/09/03/fixing-error-.NET-core-dotnet-new-tool-manifest). 

When you run the tool from the CLI, you can see the results immediately and also see the changes Stryker has made to your code. 

![Commands to install and run Stryker](/images/20190829/2019-08-29WindowsTerminalInstallStryker.png)

In the screenshot above you can see that by default, running Stryker in your solution folder will not work. Stryker wants to be run from the folder containing the UnitTests project and will pick it up automatically. It will also find the solution and the project containing the code it needs to mutate. If you need, you can help Stryker find all this by adding some parameters that have been documented [here](https://github.com/stryker-mutator/stryker-net/blob/master/docs/Configuration.md#unary-operators).

## Running Stryker in the CLI
Running Stryker from the unit test project directory will start mutating your code and running the unit tests on it again. It will try out all the mutations it can find and then track if it survived all the unit tests (meaning that there was at least one unit test that failed when running against the mutation). The results are visible inline.

``` powershell
dotnet stryker --reporters "['cleartext', 'html']"
```

![Executing Stryker](/images/20190829/2019-08-29_TerminalStrykerRun.png) 

## Mutations
As you can see in the screenshot above, Stryker searches the original code for boolean expressions, strings and other things it can '[mutate](https://github.com/stryker-mutator/stryker-net/blob/master/docs/Mutators.md)'. 

The first mutation in this run was changing the line `if (isOpen == "true")` into `if (isOpen == "")` (a string mutation). This mutation is caught by the first unit test and therefore marked as 'killed'.

![Mutation example](/images/20190829/2019-09-04StrykerMutation.png)  

## Stryker report
Adding a html report parameter to the Stryker command will write a html file to your disk that can be used for finding the mutations that either survived and where killed.  

### Summary view
![Stryker report for the tests](/images/20190829/2019-08-29StrykerReport.png)  

### Details view
![Stryker detailed report for the tests](/images/20190829/2019-08-29StrykerReportDetails.png)  

## Adding Stryker to your Azure DevOps pipeline
Now you are ready to include a Stryker run into your Azure DevOps build pipeline. To do so, you can include calls to the dotnet tool commands using the normal .NET Core task. If you need help figuring out how to set up the custom commands, read my blogpost about [Running dotnet tools in Azure DevOps](https://rajbos.github.io/blog/2019/09/03/Running-dotnet-tools-in-azure-devops).  
Do note the specific arguments I pass into the Stryker command here: my mutation tests where scoring on 54%, so I needed custom thresholds to actually fail the build. 

![Azure DevOps Steps to run Stryker in the build pipeline](/images/20190829/2019-09-04_StrykerAzureDevOpsConfig.png)  

## Failed build result
Running Stryker on my current set of tests will actually fail the build because of the custom threshold. This way you can validate your unit tests and actually check to see if there are any outliers that you missed while creating the tests for your code.

![Fail the Azure DevOps build](/images/20190829/2019-09-04_AzureDevOpsFailedBuild.png)

**Note:** mutating your code and running the unit tests again means that your tests will run multiple times. This *can* add up to quite some additional time that your build needs to run!

## Next step
The next step is to include the html report in you build pipeline and upload it as an artifact. You can then download it if you need to check it.

The Stryker team seems to be working on an extension for Azure DevOps to enable the build results to show an extra tab that would open that artefact file, but it seems that this is not yet ready. Keep up to date on this by watching this [repository](https://github.com/stryker-mutator/azure-devops-mutationreport-publisher).
