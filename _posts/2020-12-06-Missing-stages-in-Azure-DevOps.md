---
layout: post
title: "Missing stages in Azure DevOps YAML Pipelines"
date: 2020-12-06
---

# Alt. title: approval to an environment blocks the whole pipeline
Sometimes you find out about something and feel rather stupid. This one is one of the reasons YAML pipelines often feel like you need a magic incantation to get things working the correct way. Since this took me way to long to figure out, I'm writing about it here to hopefully safe someone else a lot of time (probably my future self 😁). I have bumped into these incantations before: using different CI/CD systems seems to make me forget them 🤔.
![Stupid image of a T-Rex statue](/images/2020/20201206/dan-meyers-dj2tR9dS3e8-unsplash.jpg)
##### <span>Photo by <a href="https://unsplash.com/@dmey503?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Dan Meyers</a> on <a href="https://unsplash.com/s/photos/stupid?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>

## The premise
I was working on a multi-stage pipeline in Azure DevOps using YAML files. In the beginning I only had the Build part of my pipeline to build the solution. Wanting to deploy it, I added [deployment](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs?view=azure-devops?WT.mc_id=DOP-MVP-5003719) phases to my setup. To get them working, I made the mistake to see them as specific [jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema%2Cparameter-schema&WT.mc_id=DOP-MVP-5003719). [TLDR: the are not]:

``` yaml
jobs:
 - job: Build
   steps:
     - task: SomeTask

 - deployment: DeployTest
   displayName: Deploy to test
   environment: Test
   dependsOn: Build

 - deployment: DeployUAT
   displayName: Deploy to UAT
   environment: UAT
   dependsOn: DeployTest
```

You can see that I needed to add [dependsOn](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/conditions?view=azure-devops&tabs=yaml&WT.mc_id=DOP-MVP-5003719) to get the to work sequentially: not doing this would trigger all jobs at the same time (and subsequently fail the deploys, since the artifacts where not available).

## Missing stages
Looking back, the first clue was that I didn't get multiple stages in any overview page:
![Pipeline runs overview with only one stage visible](/images/2020/20201206/20201206_01_MissingStages.png)

My confusion came from this screen and not making the connection.
The different 'stages' of my pipeline where showing here, so why not in the overview page?
![Job overview showing multiple jobs](/images/2020/20201206/20201206_02_MultipleJobs.png)

## Finding a solution
Skipping the confusion part (I assumed I must have done something wrong or Azure DevOps changed something since I last checked), I continued with adding [approvals](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/environments?view=azure-devops#approvals&WT.mc_id=DOP-MVP-5003719) to the environments my 'stages' where creating.

## Environment approval blocks all jobs
Running the pipeline with an approval on one of the [environments](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/environments?view=azure-devops&WT.mc_id=DOP-MVP-5003719), blocked the **whole pipeline**! Not just the job targeting that specific environment, as I was expecting.
![Environment approval blocks all jobs](/images/2020/20201206/20201206_05_ApprovalBlocksAllJobs.png)
Searching the web, I came across other people having sort of the [same issue](https://stackoverflow.com/questions/57321733/checks-approvals-for-a-deployment-job-are-blocking-the-entire-stage), like for example this [uservoice](https://developercommunity.visualstudio.com/idea/673881/dont-block-the-entire-stage-when-checks-approvals.html). An almost two year old feature request to prevent this scenario from happening?!? Surely this is not happening in Azure DevOps?

Eventually it was this [Stack Overflow answer](https://stackoverflow.com/a/60810101/4395661) that finally pushed me in the right direction...

## Some more hints: Stage picker when starting a pipeline
I learned about a [new feature](https://docs.microsoft.com/en-us/azure/devops/release-notes/2019/sprint-162-update#skipping-stages-in-a-yaml-pipeline?WT.mc_id=DOP-MVP-5003719) that lets you pick the the stages to run when starting a pipeline run:
![Pick stages to run on starting a pipeline manually](/images/2020/20201206/20201206_03_StagesToRun.png)
This leads to this message, not making it that much more clear (oh hindsight):
![Message: Configuration is only available for multi-stage pipelines.](/images/2020/20201206/20201206_04_StagesToRun.png)

# The fix
This is where I felt stupid, shocked and reinforced the 'magic incantation' part of the [YAML pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started/pipelines-get-started?view=azure-devops#define-pipelines-using-yaml-syntax&WT.mc_id=DOP-MVP-5003719)...
The jobs relate to the same jobs in a [classic pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started/pipelines-get-started?view=azure-devops#define-pipelines-using-the-classic-interface&WT.mc_id=DOP-MVP-5003719) and you need to wrap them in stages to have an actual multi-stage pipeline!

``` yaml
stages:

- stage: Build
  jobs:
  - job: Build
    steps:
    - task: SomeTask

- stage: DeployTest
  jobs:
  - deployment: DeployTest
    displayName: Deploy to test
    environment: Test

- stage: DeployUAT
  jobs:
  - deployment: DeployUAT
    displayName: Deploy to UAT
    environment: UAT
```

Now, the pipeline overview actually shows the correct number of stages:
![](/images/2020/20201206/20201206_06_CorrectStagesDisplayed.png)

And the approval works as planned:
![Approvals only blocking the right stage](/images/2020/20201206/20201206_07_ApprovalsTheRightWay.png)

So: wondering why an approval on an environment is blocking your whole pipeline? Or wondering why you only see one 'stage' indicator in the pipeline runs overview? Know you know how to fix it.

# Request:
Found this page with mostly the same searching around I was doing? Please let me know! Finding out these posts help someone else really makes my day. That also makes me feel less stupid 😁.
