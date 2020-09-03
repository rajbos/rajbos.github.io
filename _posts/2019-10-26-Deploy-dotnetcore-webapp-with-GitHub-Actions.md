---
layout: post
title: "Deploy .NET Core web application using GitHub Actions"
date: 2019-10-26
tags:
 - ".NET Core"
 - "GitHub Actions"
 - "Web"
---


I wanted to try out using [GitHub Actions](https://github.com/features/actions) to deploy a .NET Core web application to Azure. Microsoft already has some actions available to accomplish this, so this should be rather straightforward 😄. I haven't really played with GitHub Actions yet, so this should be rather informative 😁.
Usually I do this using [Azure DevOps](https://dev.azure.com), so this will be a nice way to check the other side of the fence.

![Hero image](/images/20191026/emre-karatas-Ib2e4-Qy9mQ-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@emrekaratas?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Photo by Emre Karataş"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Emre Karataş</span></a>

## Starting off
For starters, I want to have a small web application that would be similar to something I could already have running in a regular Azure App Service with a CI/CD pipeline in Azure DevOps. To create something I used these steps:

* Create a new repository on GitHub [link](https://github.com/rajbos/dotnetcore-webapp).
* Clone it to a local folder on my laptop
* Move into the new directory
* Run `dotnet new webapp`
* Update the `.gitignore` file
* Commit the first version of the code
* Push into the remote on GitHub

For testing how the new application worked and if it could be run I used these commands:
```powershell
dotnet restore
dotnet build
dotnet run
```

## GitHub Actions
To get started with [GitHub Actions](https://github.com/features/actions) (do scroll on that site, or you will miss a lot of good stuff!) I had to join the Beta program and from then on I had an 'Actions' tab available on all my repositories. Note: the beta for GitHub Actions ends somewhere in November 2019.

Clicking on 'Actions' on a repository on GitHub analyzes your repo and proposes a starter yaml file to use, based on the code they found in the repo. On mine, they correctly found some .NET code:  
![After click 'Actions' on a repository on GitHub](/images/20191026/01_After_clicking_actions_on_a_repo.png)  

There are a lot of actions available already, as are other setup possibilities to get you started, regardless of your stack:  

![Other setup possibilities](/images/20191026/02_Other_setup_possibilities.png)

The yaml file that you create is a set of actions to run after each other (some parallelization is possible) and is called a **workflow**.

## .NET Core set up
I picked the suggested setup since it matched the .NET Core project I wanted to deploy into Azure. You can see that there are steps to set up the Action runner with the tooling it needs to build a .NET Core project and then we start a `build` with the dotnet commands.   

![yaml file](/images/20191026/03_yml_file.png)  

After saving the yaml file it will be committed to your repository and this will kick off a run, since it the trigger for this 'workflow' is `on: push`. You can see the commit ID that is associated with the push, as well as the branch and the account that pushed the changes:  

![After saving the yaml file](/images/20191026/04_After_saving_the_yml.png)  

## First run
![After saving the yaml file](/images/20191026/05_First_run_result.png)  

The first run I start reported an error. See the screenshot below for the message detail. This is already a good start: it clearly states what is wrong, as well as where! I am running the latest [].NET Core 3.0](https://dotnet.microsoft.com/) bits on my machine and the default yaml template uses the 2.2 version! I naively changed that to use `3.0`, but that run failed as well: you need to use the full SDK version, so `3.0.100` did the trick.  

![Error message detail](/images/20191026/05a_Error_Message.png)  

First working run result: nice and fast!  

![Complete run](/images/20191026/06_Complete_Run.png) 
Also some things that stand out: the GitHub site doesn't automatically show new runs on pushes and you cannot get back to the list of runs to switch to a previous run for example: you can click the 'Actions' tab again to start on the top-level of the 'Workflows' overview: it is possible to have multiple workflows in the same repository (handy!). The rest of the UI does look great though! 

## Publishing to Azure App Service
To be able to publish the web app to an Azure App Service I create a new App Service on an existing App Service Plan. I found some [documentation](https://azure.github.io/AppService/2019/08/10/Github-actions-for-webapps.html#add-the-app-service-action) on using GitHub actions from the App Service team, so I tried that out first. The examples are specific to running a docker container on the App Service, or a Java, Javascript or Python application.  Surely, this will work for .NET Core as well? 

To prepare your repo, download the publish profile for the App Service and store it in a [GitHub Secret](https://help.github.com/en/github/automating-your-workflow-with-github-actions/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables). Here is some strange UI as well: I used the secret name from the documentation I was following and it contained a dash between the words. This is not a valid secret name, so GitHub will show you an error. Adding the correct name (I changed it to an underscore) shows a green notification. This UI can be confusing: which message belongs to which values? Maybe the could add the secret name that you where trying or at least a timestamp to it?  

![Secret storing error double message](/images/20191026/07_Secret_storing_error_on_the_name_with_a_dash.png)  

Just adding this step in the yaml file ran the workflow again and indicated a warning: this space is moving so fast as it is just a couple of months old! The warning states that the action I am using is already deprecated: I need to use a different one!
```
##[warning]This action is moved to azure/webapps-deploy repository, update your workflows to use those actions instead.
```
To bad this warning doesn't include a link to the correct repository. Luckily the name of the action is also its path after GitHub.com: [https://github.com/azure/webapps-deploy](https://github.com/azure/webapps-deploy). Scrolling through the repository shows even more example yaml files to use! For .NET Core the example can be found [here](https://github.com/Azure/actions-workflow-samples/blob/master/asp.net-core-webapp-on-azure.yml). 
##### Do note that this also adds a publish step: I forgot that one initially!

By now my mail application has caught up as well: on each failed run, GitHub sends you an email message to make sure you know something is not right 😄. 
##### Do note you can change that behavior on your profiles [settings](https://github.com/settings/notifications), but not on a per project basis.     
![Failed run email message](/images/20191026/08_Failed_run_email_message.png)  

# Complete workflow
By now I have the current workflow that is running as I want it to:  
``` yaml
name: .NET Core

on: [push]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - name: Setup .NET Core
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: 3.0.100
    
    # dotnet build and publish
    - name: Build with dotnet
      run: dotnet build --configuration Release
    - name: dotnet publish
      run: |
        dotnet publish -c Release -o dotnetcorewebapp 
    - name: 'Run Azure webapp deploy action using publish profile credentials'
      uses: azure/webapps-deploy@v1
      with: 
        app-name: dotnetcorewebapp19 # Replace with your app name
        publish-profile: ${{ secrets.publish_profile }} # Define secret variable in repository settings as per action documentation
        package: './dotnetcorewebapp' 
```

And with that setup I have my first successful run!  

![Successful run](/images/20191026/09_Succesful_run.png)  

You can now browse to the website and see if it is running:  

![Website is running](/images/20191026/10_Website_running.png)  

To be really sure, the files now exist in the Kudu editor:  

![File exist in Kudu editor](/images/20191026/11_Kudu_files_exists.png)  

# Summary
There you go, a complete example of setting up your first GitHub Actions Workflow for pushing a .NET Core application into an Azure App Service. The set of actions I used also has options for deploying to a [deployment slot](https://docs.microsoft.com/en-us/azure/app-service/deploy-staging-slots?WT.mc_id=AZ-MVP-5003719) as well, witch makes it complete! If this is the first time you use yaml, this can look a bit daunting, but after reading what is happening, I figured everything out as well!

Next up is seeing if we can parameterize this yaml file and deploy to different web applications (for example `staging`) with the same template. That's something for another time!