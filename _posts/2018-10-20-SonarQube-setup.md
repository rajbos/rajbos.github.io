---
layout: post
title: "SonarQube setup for Azure DevOps"
date: 2018-10-20
---

During installation and setting up a [SonarQube](https://www.sonarqube.org/) server for usage in an Azure DevOps Build I found some things that I didn't remember from previous installation, so I wanted to log that in this post, so the next time I have somewhere to find these things in one place.

![Cool dog by Zach Lucero](/images/2018_10_20_Zach_Lucero_Dog.png)  
<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@zlucerophoto?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Zach Lucero"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-1px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M20.8 18.1c0 2.7-2.2 4.8-4.8 4.8s-4.8-2.1-4.8-4.8c0-2.7 2.2-4.8 4.8-4.8 2.7.1 4.8 2.2 4.8 4.8zm11.2-7.4v14.9c0 2.3-1.9 4.3-4.3 4.3h-23.4c-2.4 0-4.3-1.9-4.3-4.3v-15c0-2.3 1.9-4.3 4.3-4.3h3.7l.8-2.3c.4-1.1 1.7-2 2.9-2h8.6c1.2 0 2.5.9 2.9 2l.8 2.4h3.7c2.4 0 4.3 1.9 4.3 4.3zm-8.6 7.5c0-4.1-3.3-7.5-7.5-7.5-4.1 0-7.5 3.4-7.5 7.5s3.3 7.5 7.5 7.5c4.2-.1 7.5-3.4 7.5-7.5z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Zach Lucero</span></a>

## Installation on Azure
For installation on an Azure environment I used the same [Azure QuickStart ARM template](https://github.com/Azure/azure-quickstart-templates/tree/master/sonarqube-azuresql) I used before. Somehow, each time I need this template, something has changed underneath and I get to [fix the template](https://rajbos.github.io/blog/2018/08/12/self-signed-certificate-on-sonarqube-server). This time the download URL for the SonarQube installer was changed as well as a new version got released. This has now been included in the template: because it is open source, I could find the places that needed to be updated and send in a [pull request](https://github.com/Azure/azure-quickstart-templates/pull/5313) to Microsoft with the fix. I love open source! Such a pleasure to find an issue, look at the code and present a fix to the repository maintainer!

![SonarQube logo](/images/2018_08_12_SonarQube.png)

You can follow the usual steps from the ARM template: download and install the Java Development Kit on the SonarQube server, restart the SonarQube service and you're up and running with the **server side**.

## Things to know for next time
There are a couple of things that you need to think of when starting an installation yourself. The ARM template is already a great help in it, but you need to think of some other things. Those are mostly client  side, so on the agent.

### Bring a valid certificate 
As noted [before](2018-08-12-self-signed-certificate-on-sonarqube-server), the template uses a self signed certificate, which will not work with Azure DevOps: the tasks from the marketplace need a valid certificate that it trusts for the connection with the server. Therefore you need to provide a valid certificate and setup a DNS entry to match the URL in the certificate.

### Download or install the SonarQube extension
Go to the [marketplace](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarqube) and download or request installation in your Azure DevOps subscription.

### The 'Run Analysis Task' has java as a requirement
This was a gotcha that I forgot this time: the `Run Analysis Task` has a demand requirement that it needs Java (specifically the Java Runtime Environment 8.0) **on the agent**. This also means that you cannot run it on a hosted agent : those do not have the JRE installed! Only the JDK is installed, which doesn't add support for the `java` demand. I raised an [issue](https://github.com/Microsoft/azure-pipelines-image-generation/issues/315) on the hosted agent with a request for it.

### Building on a new agent?
When you have a new agent you could install [Visual Studio Community edition](https://visualstudio.microsoft.com/downloads/) on it, that will provide you with the `msbuild` capability on the agent. This does **not** give you the tools to run the unit tests on the server, which is needed for the `Run unit test` task, which will provide SonarQube with the necessary information it needs to do, well basically, anything! You can install a licensed Visual Studio Enterprise on it, but then you need to update that license every once in a while. You probably don't want that, because of the occasional error it will give you, for which you need to login to the server.

To help fix this, you can use the [Visual Studio Test Platform Installer](https://www.nuget.org/packages/Microsoft.TestPlatform) task to install all the tools VSTest needs to run.

### Want CSS analysis from SonarQube
Out of the box, SonarQube can scan your CSS files for issues with over 180 available [rules](https://github.com/racodond/sonar-css-plugin#available-rules). To do this, the agent needs to have [Node.js](https://nodejs.org/en/download/) installed. This is already available on a hosted agent, but you cannot use that yet because of the dependency on JRE! 

### SonarQube CSS issue on large solution
Currently there is an [issue](https://community.sonarsource.com/t/sonarqube-post-processing-fails-with-unknown-reason/1798/6) on SonarQube with larger solutions or CSS files. The process seems to run out of memory somewhere. In the Azure DevOps Build log you'll see these as the last steps being logged:  
```
INFO: Quality profile for cs: Sonar way
INFO: Quality profile for css: Sonar way
INFO: Quality profile for js: Sonar way
INFO: Quality profile for xml: Sonar way
INFO: Sensor SonarCSS Metrics [cssfamily]
WARNING: WARN: Metric 'comment_lines_data' is deprecated. Provided value is ignored.
INFO: Sensor SonarCSS Metrics [cssfamily] (done) | time=1937ms
INFO: Sensor SonarCSS Rules [cssfamily]
```

For now the recommended fix is: do not use the CSS analysis, which isn't great, but better then the alternative: currently the `Run Analysis Task` just hangs until the maximum runtime of your build has been reached. Al that time, your build server will run at 100% CPU (if you have 1 CPU available, 2 CPU's got me 50% utilization)!
It took me quite some searching around to find this one, so it's good to document it here. 

The current fix is to start the analysis task with a parameter that redirects the CSS files to a non-existing analyzer:  
`d:sonar.css.file.suffixes=.foo` or do that globally for your entire SonarQube server via the settings on the CSS analysis there (which would be easier if you have multiple projects with this issue). 