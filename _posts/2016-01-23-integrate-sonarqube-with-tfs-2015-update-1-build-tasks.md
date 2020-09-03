---
layout: post
title: "Integrate SonarQube with TFS 2015 update 1"
date: 2016-01-23
---
While migrating CI stuff from Jenkins into TFS 2015 SP1 I ran into [this](https://devblogs.microsoft.com/devops/build-tasks-for-sonarqube-analysis/?WT.mc_id=DOP-MVP-5003719) blog post from Microsoft explaining how to include [SonarQube](http://www.sonarqube.org/) runs information in the TFS Build Tasks. We have been running SonarQube on our projects for about a year now to gain some insights into Code Coverage and basic code smells. I sure don't want to lose the information Sonar gives us. 

The problem was that we weren't getting any results into SonarQube. The default way TFS runs the UnitTests is that it generates a trx file with coverage information in it. Unfortunately,when you have a VS Professional license, it will not generate the code coverage. You'd need a Enterprise license for it!

In Jenkins, we used [OpenCover](https://github.com/OpenCover/opencover) to generate the coverage data, which integrates into the calls to the SonarQube runner. Its open source, which is a big plus.

## Step 1:
Create a new location on the server to place the coverage reports into. I've used `C:\OpenCover\` for this, and let OpenCover generate a file for each assembly we're testing, using the name of the assembly as the filename for the xml report.

## Step 2:
Add arguments to the SonarQube build step to tell Sonar where to find the coverage report. This needs to be done in the start step:

Add this argument to 'Additional Settings': 
```
/d:sonar.cs.opencover.reportsPaths="C:\OpenCover\SolutionName.AssemblyName.UnitTests.opencover.xml": Sonar settings
```
![TFS screenshot](/images/20160123_01.png)

## Step 3:
Add in an additional Command Line build task to start the OpenCover tools. As you can see, I've added this after the build step. I think Sonar needs the build step for some data, but I need to test if it still works when we move that step out of the Sonar Start and End steps. Running the OpenCover tool should be enough, but I'm not sure of that.

Add these arguments:
``` xml

-output:"C:\OpenCover\SolutionName.AssemblyName.opencover.xml"

-register:user

-target:"C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\CommonExtensions\Microsoft\TestWindow\vstest.console.exe"

-targetargs:" \"{path_to_tfs_workfolder}\bin\Release\SolutionName.AssemblyName.UnitTests.dll"
```

## Step 4:
Run the build and see some coverage results!