---
layout: post
title: "Use GitHub Actions with a private runner to deploy to IIS"
date: 2020-11-24
---

Recently I got asked if you could use GitHub Actions to deploy to an IIS web application which of course I had to test :grin:.

# TL;DR It runs the same as you would with a PowerShell script 

![GitHub Actions Logo](/images/20201124/actions.png)

## Example
For testing this I used an example application in this [repo](https://github.com/rajbos/dotnetcore-webapp/) (you can find the actions there as well). It's based on the following dotnet command:
``` shell
dotnet new webapp
```

### Flow
Since this is a .NET Core application, the workflow for GitHub Actions has these steps:
1. Checkout the repo
1. Set the correct .NET Core version
1. dotnet build
1. dotnet publish
1. deploy to IIS
1. Run a smoketest
1. Run the webtests (added as an extra example, keep on reading for more info)

You can find that workflow [here](https://github.com/rajbos/dotnetcore-webapp/blob/main/.github/workflows/dotnetcore-iis.yml). 💡 If you want to see the workflow for pushing the application to an [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service?WT.mc_id=AZ-MVP-5003719), check the `dotnetcore.yml` file next to it.

### Setup
For running the IIS commands I've used the most simple example, other command line options will work as well:
1. Stop the website (or the entire webserver in this case)
1. Overwrite all files
1. Start the website again
Using WebDeploy or a [remote PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/learn/remoting/running-remote-commands?view=powershell-7.1&WT.mc_id=DOP-MVP-5003719) session will work as well. Find more explanation on remoting in this [blogpost](https://devopsjournal.io/blog/2020/03/29/Deploy-locally-on-Windows-Azure-DevOps) as well.

### Action
The actual actions that 'deploy' the application are as follows.
``` yaml
- name: Deploy to IIS
      run: |
        iisreset /stop
        Copy-Item ./dotnetcorewebapp/* C:/inetpub/wwwroot/dotnetcore-webapp -Recurse -Force
        iisreset /start
```
##### Note: running these steps requires Admin level access rights, so you'll need to run the self-hosted runner with that access level. This stems from the **AppExec** commands that it fires that require that level of access (still an unfortunate thing).

### Private GitHub Action Runner
To enable the deployment of the application on a Windows box, you'll have to use a [private GitHub action runner](https://docs.github.com/en/free-pro-team@latest/actions/hosting-your-own-runners/about-self-hosted-runners) since the cloud hosted runners will not have access to that machine (they shouldn't!). You can install them like a normal runner like for example Azure DevOps. Luckily the list of URL's you need to add to your proxy/allow list is a lot shorter than the [Azure DevOps](https://devopsjournal.io/blog/2020/04/16/Run-Azure-DevOps-Agent-Behind-a-proxy) list.

The runner runs on demand or as a Windows Service and will periodically open a long polling connection to GitHub, asking if there is work to do. The connection is always outgoing and on port 443.

Installing a runner can be done from a repository, team or organization level from the website. Go to "Settings" --> Actions and scroll down to Self-hosted runners:  
![Screenshot of the self-hosted runners view](/images/20201124/20201124_01_SelfHostedRunners.png)  

Adding a runner is made very easy, all the steps are listed right in the screen, even including the temporary token it uses for a one time authentication process:  
![Screenshot of the steps to add a self-hosted runner](/images/20201124/20201124_02_AddingARunner.png)


## Bonus
The next question that came up was if you could run a Selenium WebTest (as I call that type of end-to-end test) with such a runner and if that would also work with a hosted runner. Long story short: it just works.

In both [workflows](https://github.com/rajbos/dotnetcore-webapp/blob/main/.github/workflows/) I've added the last step 'Run Web Test' that runs the unit tests in the [WebTest](https://github.com/rajbos/dotnetcore-webapp/blob/main/dotnet-core-webapp.webtests/UnitTest1.cs) project that use a Selenium Driver to talk to the installed Chrome instance on the runner. You can find all the preinstalled software on the hosted runner [here](https://docs.github.com/en/free-pro-team@latest/actions/reference/specifications-for-github-hosted-runners#supported-software).

![Screenshot of webtest output](/images/20201124/20201124_03_WebTest.png)