---
layout: post
title: "Azure DevOps: enable project functionality"
date: 2021-05-31
tags: [Azure DevOps, REST, REST API, project]
---

Sometimes you spot interesting things online that you *have* to figure out 😎.
This time it was a tweet from Martin Ehrnst:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/AzureDevOps?ref_src=twsrc%5Etfw">@AzureDevOps</a> i&#39;m using your API to create new projects. However, I would like to provision these without services like boards. I cannot find any way to to do this. Doesn't the API support this?</p>&mdash; Martin Ehrnst ☁️ (@ehrnst) <a href="https://twitter.com/ehrnst/status/1395638309515313154?ref_src=twsrc%5Etfw">May 21, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

In Azure DevOps you can enable or disable features on a per-project basis:

![Screenshot of Azure DevOps Settings Overview page on the project level](/images/2021/20210531/20210531_SettingsOverview.png)

After some reverse engineering I found out that you can request and set the state of these features by calling into the API.

# Getting the feature state
`POST: https://dev.azure.com/{ORGANIZATION}/_apis/FeatureManagement/FeatureStatesQuery/host/project/{PROJECTID}?api-version=4.1-preview.1`
Indicating in the body what you want to know. If you only pass in 1 featureId, you only get the state for that single feature.
``` json
{
    "featureIds": [
        "ms.vss-work.agile",
        "ms.vss-code.version-control",
        "ms.vss-build.pipelines",
        "ms.vss-test-web.test",
        "ms.feed.feed"
    ],
    "featureStates": {},
    "scopeValues": {
        "project": "{PROJECTID}"
    }
}
```

# Setting the feature state
You can set the state of a feature by sending in a PATCH request for a single feature. Posting for multiple features in one go doesn't seem to work. This makes sense since the API also does it on a per feature basis.
`PATCH: https://dev.azure.com/{ORGANIZATON}/_apis/FeatureManagement/FeatureStates/host/project/{PROJECTID}/{featureId}?api-version=4.1-preview.1`
With body:
``` json
{
    "featureId": "ms.feed.feed",
    "scope": {
        "userScoped": false,
        "settingScope": "project"
    },
    "state": 1
}
```
Where featureId from the body needs to match the featureId in the URL (find the list in the example above).

# Observations
To bad you cannot pass in these settings through the API when you create a project. At least there is another way to get things working 😄.
