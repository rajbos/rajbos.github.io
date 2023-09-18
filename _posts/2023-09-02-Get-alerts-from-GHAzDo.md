---
layout: post
title: "Get alerts from GitHub Advanced Security for Azure DevOps"
date: 2023-09-02
tags: [GitHub Advanced Security, Azure DevOps, GHAzDo, API, alerts]
---

GitHub Advanced Security for Azure DevOps (GHAzDo) builds on top of the functionality for GitHub Advanced Security and is giving you extra security tools to embed into your developer way of working. It's a great way to get started with security in your Azure Pipelines and Azure repos and I've written about it before in [this blogpost](/blog/2023/05/25/GitHub-Advanced-Security-Azure-DevOps).


# Loading the alerts from the API's

Before starting with the Advanced Security API's you'll need to get the ID for the repository you are working with. You'll need to have the project name and the repository name itself. With that you can make this API call:

``` 
https://dev.azure.com/<PROJECT NAME>/_apis/git/repositories?api-version=7.1-preview.1
```

It will return you the list of repos the token you are using has access to. The repo object will look like this:

``` json
{
            "id": "5e5195e1-1b44-4d4b-9310-5d33ee2c4dc",
            "name": "eShopOnWeb",
            "url": "https://dev.azure.com/raj-bos/3651f6f0-74e5-48d7-8ff9-d62ae2464b1/_apis/git/repositories/5e5195e1-1b44-4d4b-9310-5d33ee2c4dc",
            "project": {
                "id": "3651f6f0-74e5-48d7-8ff9-d62ae2464b1",
                "name": "GHAzDo trial",
                "url": "https://dev.azure.com/raj-bos/_apis/projects/3651f6f0-74e5-48d7-8ff9-d62ae2464b1",
                "state": "wellFormed",
                "revision": 141,
                "visibility": "private",
                "lastUpdateTime": "2023-07-26T18:51:26.227Z"
            },
            "defaultBranch": "refs/heads/main",
            "size": 62610330,
            "remoteUrl": "https://raj-bos@dev.azure.com/raj-bos/GHAzDo%20trial/_git/eShopOnWeb",
            "sshUrl": "git@ssh.dev.azure.com:v3/raj-bos/GHAzDo%20trial/eShopOnWeb",
            "webUrl": "https://dev.azure.com/raj-bos/GHAzDo%20trial/_git/eShopOnWeb",
            "isDisabled": false,
            "isInMaintenance": false
        }
```

From this you need the "id" field of the response. That can then be injected into the next API call:
```
https://advsec.dev.azure.com/<PROJECT NAME>/<REPO NAME>/_apis/AdvancedSecurity/repositories/<REPO ID>/alerts?top=50&orderBy=severity&alertType=3&ref=refs/heads/main&states=1
```

The filtering options determine the response you will get back:

|Param|Description|
|---|---|
|top|The number of alerts you want to get back.|
|orderBy|The field you want to order the results by.|
|criteria.alertType|The type of alert you want to get back. 1 = Dependency, 2 = Secrets, 3 = Code scanning|
|criteria.ref|The branch you want to get the alerts for, only needed when looking at code scanning alerts|
|criteria.states|The state of the alerts you want to get back. 1 = Open, 2 = Closed|

You can also leave the `alertType` away from the url to get all alerts in one go. Do be aware that it will result in a different value for the `alertType` in the response, instead of the numbers listed in the table above:

|Value|Type|
|---|---|
|code|Code scanning alert|
|secret|Secret scanning alert|
|dependency|Dependency alert|
