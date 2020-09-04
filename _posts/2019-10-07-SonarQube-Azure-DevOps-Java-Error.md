---
layout: post
title: "SonarQube analysis on a Java project - fixing error 'Project was never analyzed'"
date: 2019-10-07
---

Today I was configuring a SonarQube Analysis in [Azure DevOps](https://dev.azure.com) on a Java project. Following the [documentation](https://sonarcloud.io/documentation/analysis/scan/sonarscanner-for-azure-devops/) I still got this error:  
```
[ERROR] Failed to execute goal org.sonarsource.scanner.maven:sonar-maven-plugin:3.7.0.1746:sonar (default-cli) on project 'prefix-project' Project was never analyzed. A regular analysis is required before a branch analysis -> [Help 1]
```

Given the error message says it is an error for the project `prefix-project` I guessed that the plugin wanted to link everything to a project with that key in SonarQube. Since I was creating this in a different Project Team, there might be an issue with the new service connection (those are tied to the team project). So to test, I created a project in SonarQube with the same key. 

Running another build resulted in the same error.
Running a build on the master branch, just to make sure it wasn't related to a different branch and I need to run it first on on the master branch: same error.

![Build Error](/images/20191007/20191007_BuildError.png)

In the pom file I noticed that there was an extra `groupId` added:
``` xml
 <groupId>com.organizationname</groupId>
 <artifactId>prefix-project</artifactId>
```

## Fixed project key
And running the build in debug mode showed that it was using that combination as a project key for the SonarQube project. So, changed the project key in SonarQube to use that:
`com.organizationname:prefix-project`


## Tasks
Using that project key with the default tasks now works.

1. Prepare step before running with Maven:  
![Prepare before maven](/images/20191007/20191007_BuildDefPrepare.png)  

2. Update Maven build tasks to push to SonarQube:  
![Prepare before maven](/images/20191007/20191007_BuildDefMaven.png)  
