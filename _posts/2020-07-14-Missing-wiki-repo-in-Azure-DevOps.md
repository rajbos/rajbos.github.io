---
layout: post
title: "Missing wiki repo in Azure DevOps"
date: 2020-07-14
---

Today someone in the Azure DevOps Club [slack](https://teamservices.club/) asked a question about finding the repo from the default wiki in Azure DevOps.
This used to be available if you knew what to do, so you could clone the repo and add pages programmatically for example.
Weirdly enough, we couldn't find how to get the repo to be visual so we could use it.
In this case, the person asking the question wanted to add branch policies on the wiki repo so they can enforce Pull Requests on incoming changes.
Of course, I was intrigued and started to search: this functionality was always there before, so surely this will still be available?

![Picture of a dog (Pugg) with 'stress'](/images/2020/20200714/matthew-henry-2Ts5HnA67k8-unsplash.jpg)
##### <span>Photo by <a href="https://unsplash.com/@matthewhenry?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Matthew Henry</a></span>)

## TL;DR
Short version: it is not available anywhere, but you can 'guess' the correct URL and clone it:
`git clone https://dev.azure.com/<organization>/<project>/_git/<name of wiki>.wiki`

## Wiki types
In Azure DevOps there is a distinction between two ways to setup your wiki:
1. The default (old) way of creating a wiki. It is a Git repo under the covers
1. Publish one or more repositories as a wiki. You can find more documentation [here](https://docs.microsoft.com/en-us/azure/devops/project/wiki/provisioned-vs-published-wiki?view=azure-devops?WT.mc_id=DOP-MVP-5003719)

## History
If you created a wiki a couple of years ago, you have the first wiki type. You could get the git URL to clone the repo and when you made changes to it, the repository would become visible on the Repos overview. This is no longer the case.

Currently when you create a new team project, you get the option to choose between the two types, although it is not very clear to see the difference between the two.
##### Note: I find the two types very confusing for the user and there is not a clear way to use them the same way. It would be better if a Project Admin could choose to include the repository in the normal overview or not. If the team using it is mature enough to use it as a normal repository, then why limit its use?

### Current Wiki creation
When you create a new project and navigate to the wiki page, you are now greeted with this screen. Already confusing and the [Learn more](https://docs.microsoft.com/en-us/azure/devops/project/wiki/provisioned-vs-published-wiki?view=azure-devops?WT.mc_id=DOP-MVP-5003719) link tries to make the difference more clear, but doesn't really make it clear it will always be a repo underneath.
![New project screen](/images/2020/20200714/20200714_01_NewProject.png)

I mean, if you need this large a matrix to try and make the differences clear, while under the covers it is the same setup, why not make your product easier to use?  
![Difference matrix screenshot from the docs](/images/2020/20200714/20200714_02_Docs.png)

## Searching for the repo
Testing things out, I created a new team project [Demo] and created a new project wiki for it.
Then I started searching for the wiki in the repos overview, but it only shows the default, empty project repository, not the wiki repo:

![Azure Repos dropdown that doesn't show the wiki repo, only the default](/images/2020/20200714/20200714_04_ReposDropdown.png)

If you go to the wiki, it shows the name of the wiki:  
![New wiki created with wiki name highlighted](/images/2020/20200714/20200714_03_ProjectWiki.png)

Even the dropdown or extra button (the three dots) doesn't some more information. You **can** find the git URL for cloning you need, but not how to get to the repository to set up branch policies for example...

### REST API
Azure DevOps has an awesome REST API you can use to automate almost everything in Azure DevOps, so let's see what it returns.

If you update the URL in your browser, you can test the API with normal GET request without setting up to much stuff. Go to `https://dev.azure.com/raj-bos/Demo/_apis/git/repositories` (so _organization_/_project_/_apis/git/repositories) and you get a list of repositories.
![](/images/2020/20200714/20200714_05_API_ReposCall.png)

##### Note this does not include the wiki repo, only the default empty repo with the same name as the project.

### Include Hidden repositories
If you include the query string `includeHidden=True` as can be found in the [API docs](https://docs.microsoft.com/en-us/rest/api/azure/devops/git/repositories/list?view=azure-devops-rest-5.1&WT.mc_id=DOP-MVP-5003719), you see that the wiki repo is visible:

![](/images/2020/20200714/20200714_06_API_ReposCall_Hidden.png)

Conclusion: it is a repo, but a hidden one!

I've searched and tested some options, but I didn't manage to [update](https://docs.microsoft.com/en-us/rest/api/azure/devops/git/repositories/update?view=azure-devops-rest-5.1&WT.mc_id=DOP-MVP-5003719) the repo and make it not hidden anymore.

Finding some really old posts and a GitHub issue that requested the hidden repo to be visible (that got redirected to a UserVoice request that was closed due to inactivity 😧), I figured that this old URL might still be working... And luckily it is!

# The fix
If you check the name of your wiki repository, you can enter it in the URL of a normal repository (use the repo selection dropdown first for the correct URL to appear for easy changing):
`https://dev.azure.com/<organization>/<project>/_git/<name of wiki>.wiki`

![Wiki repo visible](/images/2020/20200714/20200714_07_WikiRepo.png)
##### Note that the dropdown still doesn't show the wiki repo: it never will currently

The most amazing part: the UI will now remember the last repo you have viewed, so if you use the menu to navigate to branches, it will enable you to set branch policies. You can add the repo to the URL here by hand as well of course, if need be.

Hopefully the Azure DevOps team improves on this omission (in my opinion) soon.

# Summary
So, in conclusion: if you can't find the wiki repo in Azure DevOps, you now have a way to get to it, even when the UI doesn't give you an option for it.
