---
layout: post
title: "My GitHub Actions workflows are not starting"
date: 2022-08-12
---

Some default cave-ats that new GitHub Actions users run into is that their workflows are not being triggered or that the UI to do so is missing. In the beginning everyone starts with the `on: push` trigger but there will come a time that you only want to execute some workflows on the default (main) branch. So you limit the `on: push` trigger to that branch:

``` yaml
    on:
      push:
        branches:
          - main
```

When you follow [best practices](blog/2019/07/10/DevOps-Principles-series) you want to implement a Pull Request based process to prevent a single person from making changes to a repository. That means that you are making your changes to workflows in a feature branch and not in your main branch.

What happens next? See in the steps below. You can start at the top (scheduled run not starting) and then work your way down to the more specific examples. This also represents the order in which a lot of times these questions will occur.

![Photo of a street crossing, taken from above so it is upside down](/images/20220812/sora-sagano-MKE7NKsaBZM-unsplash.jpg)
##### Photo by <a href="https://unsplash.com/@sorasagano?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Sora Sagano</a> on <a href="https://unsplash.com/s/photos/up-side-down?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  

## Scheduled runs not starting
When you add your first schedule for a daily run, you might be surprised that it does not start at the schedule you have set. You might scratch you head and wait for a couple of days, and nothing will happen.

``` yaml
on:
  schedule:
    - cron:  '30 5,17 * * *'
```
The cause of this is that scheduled runs *only* trigger from the default branch (main). Several triggers behave this way, like a Pull Request (+Status) trigger, the issue / label / comment triggers, etc.

So if you have a schedule in your workflow and you are not on the default branch, the workflow will not start. This is a security measure to prevent someone from creating a workflow that runs on a schedule and then creating a pull request to a repository that has a scheduled workflow. The scheduled workflow would then run on the pull request and the attacker could do something malicious. This is a good thing, but it can be confusing when you are just starting out. The solution is to make sure that you are on the default branch when you create your scheduled workflow, so that means that you need to merge in your changes for it to start based on your schedule.

## Manual runs (workflow_dispatch) UI is not visible
This is the common next step when the schedule does not start: you just add a workflow dispatch trigger to the workflow to trigger it manually. But since this is a new workflow that has not existed yet, the UI for it to trigger is not visible! This is the same as creating a new workflow file with this trigger in one go. 

For a manual trigger, *the UI is only available from the default branch*. You can choose which branch to trigger the run from then, and have the inputs available from the default branch. But the file and the trigger has to be on the default branch for the UI to be visible.

![Screenshot of the workflow dispatch UI with the branch selector open](/images/20220812/20220812_Workflow_dispatch.png)

You have two options to proceed and trigger the workflow:
1. Go to the next step and use 'on: push'
1. Trigger the new workflow, from the branch by using the API

### Triggering the workflow with the API
You can trigger a workflow dispatch (as well as a [repository dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch) for that matter) using the UI and even trigger it from a branch.

You need to make an (authenticated) call to the url for your workflow:  
'https://api.github.com/repos/{OWNER}/{REPO}/actions/workflows/{WORKFLOW_ID}/dispatches'  
The workflows actually have an ID under the covers, but you can also use the filename, which is easier to read. So when the workflow is named `get-action-data.yml` and it lives in the repo `rajbos/actions-marketplace` it becomes this url:
`https://api.github.com/repos/rajbos/actions-marketplace/actions/workflows/get-action-data.yml/dispatches`
##### Note: do not include a slash at the end of the url, GitHub's API's do not accept that and will return errors.  


My tool of choice for this is [Postman](https://www.postman.com/product/rest-client/), because I can store my requests in it and it lives in its own window. This makes it super easy to navigate to and hit CTRL+ENTER to trigger the call, which is helpful when you are creating the workflows.

![Screenshot of Postman with a push to the dispatch api](/images/20220812/20220812_Postman.png)

## On: push then?
The last option you have is to just trigger the workflow whenever someone pushed data into the repository. You can decide if that should happen on certain branches but the best tip here is to include a path filter (see the docs [here](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#push)).

``` yaml	
on:
  push:
    branches:
      - main
      - my-test-branch
    paths:
      - 'src/**'
      - '.github/workflows/my-workflow-file.yml'
```  

I often run the workflow on at least my test branch, but then **only** when the relevant files for that workflow have been edited. That usually is the workflow file itself and maybe certain source files in the repo that are used: whenever there is a change in those files: execute the workflow. This is especially helpful during the development of the workflow: if you push a change in it, it is a good change that you want to trigger the workflow 😄.

##### Note that this will not help when you have specific use cases you want to test, like when someone creates a comment, a pull request. There are other ways to deal with that, but that is for another post.