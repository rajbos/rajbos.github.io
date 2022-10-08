---
layout: post
title: "Enabling GitHub Actions on Enterprise Server"
date: 2022-10-09
---

When customers start using GitHub Enterprise with Actions and private runners, there are some common gotcha's you can run into. In this post I'm sharing the ones I have encountered so far. Even Dependabot comes along, since that runs on Actions as well for GitHub Enterprise Server.

List of topics:
* First of all: [Don't use self signed certificates on GitHub Enterprise](/2021/05/16/Dont-use-self-signed-certificates-on-GitHub-Enterprise)
* The default actions in will download the binaries from github.com
* Actions org will be cleaned up with each major/minor update
* Mismatches in the settings UI (harder for admins)
* Dependabot runners need to be created
* Log storage is external to the server
* GitHub Connect is mandatory

![Image with the logos of Dependabot and GitHub Actions](/images/2022/20221008/Dependabot-Actions.png)

# The default actions in the /actions organization, will download the binaries from github.com
Be aware that the default actions in the /actions organization (setup-node, setup-go, etc.), will download the binaries they need from [github.com](https://github.com/actions/setup-node/blob/main/src/installer.ts#L140). This means the runner will download those files without any authentication and will be rate limited after 60 downloads/hour/ip-address.
To get around that, you will need to create your own version of these actions and download the releases from something like GitHub Releases or an internal source like Artifactory, or store them as GitHub Releases in a repository.

# Actions org will be cleaned up with each major/minor update
This was not such a pleasant surprise: we have had to customize the default actions, since setup-node and setup-go will download the binaries from github.com (see above). Our runners do not have internet access for security reasons. We have created our own versions of these actions that download the binaries from our internal Artifactory instance and uploaded them to our GitHub Enterprise instance. This worked fine for a while, but when we upgraded from 3.1 to 3.2, the actions org was cleaned up and our custom actions were gone. This was not a problem for us, since we had copies of the source code on several machines, but it was a surprise. So be aware: the entire org gets cleaned up with each major/minor update!

# Mismatches in settings UI: it's all over the place
There are 2 different idioms in the settings, and if you have admin rights (either Enterprise, Org or repo level), you will see both.

1. UI where you make changes and need to scroll down to save them
1. UI where any changes trigger a post back to the server and are stored (and in effect immediately)!

For the second one, here is an example. There is a save button in here, so.... what do you thing will happen if you change the `All repositories` setting in the drop down?
![Screenshot of the 'General actions permissions' on the organization level](/images/2022/20221009/20221009_Settings.png)  
This setting posts back to the server immediately, so the change is stored and in effect immediately! There is a small page reload, but if you are not paying attention, you could miss it. Guess how I turned of GitHub Actions for all users in our Production Environment? I took a bit more then half an hour before users started calling us (my team maintains it), and a check on this page to learn that the setting was changed.... That was not the intention, because I didn't press the save button!

# Dependabot runners need to be created
When you want to enable Dependabot, and it's version updates, you need to do this at several levels: first enable it on the appliance. Then change the settings for the Organization level to allow it to be used. 

Then you can configure it per repo: 
* Enable the Software Composition Analysis (SCA) feature (that's Dependabot starting point)
* Configure the Dependabot.yml file to run with updates
* Be aware that Dependabot runs on actions and uses the default setup action to configure the ecosystem (more below)
* Notice that the Dependabot runs use a specific label to target runners with (more below)
* Create runners for Dependabot to use (more below)

## Dependabot runs on actions
Dependabot for Enterprise Server runs on actions and are visible from the 'Actions' tab for the repo. That way you can monitor their runs. If you enable all the features, then runs will be scheduled. Only until you actually go and check those runs, you'll learn that it is using a 'dependabot' label to target the runner with. This is of course so that you can control where these runs happen, and how many runners can be bothered with these jobs. That way Dependabot runs will not just randomly start hogging all of your runners that are labeled with 'self-hosted'. So, you do need to create runners with that label, before anything starts to happen. 

> Hint: checkout the `Dependabot Version updates` workflow run logs, that magically will appear in the 'actions' tab!  

Because there is no API for Dependabot to monitor it's runs, or a way to see queued runs and alert on them if they are queued for more then 30 minutes (for example), there is no good way to learn about this until you start searching around.

Finding out about this happened because I went looking for the settings and found the stuck in queue workflow run. Looking at the workflow definition told me what I needed to know. This is quite a bit hidden in the docs: if you know where to find it, and dig through 4 different pages of information on enabling Dependabot, then eventually you find [this reference](https://docs.github.com/en/enterprise-server@3.6/admin/github-actions/enabling-github-actions-for-github-enterprise-server/managing-self-hosted-runners-for-dependabot-updates) to it, hidden under step 3. I made a suggestion to make it more clear you need to do this [here](https://github.com/github/docs/pull/21211).

## Dependabot uses a preconfigured workflow definition
This definition pulls down the `setup-node` from your actions organization on the server. If you overwrite them with something custom (as we had to do since our runners are not allowed to download things from the internet), these runs can easily fail (for us they did). I have not found a way to override this workflow file, so you need to make sure this works. We currently are working on setting things up for us, which is halting our adoption of Dependabot at the moment ☹️.

# Log storage is external to the server
GitHub Actions on the SaaS version (github.com) has been created with running on Azure in mind. All of those logs are stored then on cloud storage. Currently Azure Blob storage and AWS S3 Storage is supported. If you cannot push the logs to one of those, there is a [Min.io](https://min.io/) container setup that has the exact API surface of an S3 bucket that can be used, to layer that on top of you own storage solution. You will need to create and configure that storage to be used before you can continue.

# GitHub Connect is mandatory
To be able to use GitHub Actions, you need to have GitHub Connect enabled. This is a feature that allows you to connect your GitHub Enterprise Server instance to GitHub.com. This is needed to be able to use the GitHub Marketplace. I'm not really sure why this is the case, because the runners will use their own internet connection to download the actions from github.com. The only reason I see would be the UI in the workflow editor, that allows you to search the public marketplace for actions. 