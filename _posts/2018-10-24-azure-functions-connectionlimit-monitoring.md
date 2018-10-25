---
layout: post
title: "Azure Functions Connection Monitoring"
date: 2018-10-24
---

Last week I noticed our Azure Function wasn't running anymore and I got a pop-up in the [Azure Portal](https://portal.azure.com) indicating that we reached the limit on our open connections. The popup message contains something like `Azure Host thresholds exceeded: [Connections]` and links to this [documentation page](https://docs.microsoft.com/en-us/azure/azure-functions/manage-connections). The documentation already hints at the usual suspects: HttpClient holds on to the connections longer then you'll usually need. Since the whole Azure Functions sandbox has several hard limits, usage of an HttpClient in the default pattern is a common way to hit the Connection Count limit. The documentation also notes an example for a DocumentClient and SqlClient, although the latter already uses connection pooling.

![Header image](/images/2018_10_24_nick-seliverstov-516549-unsplash.jpg)
<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@slvrstvk?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from NICK SELIVERSTOV"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-1px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M20.8 18.1c0 2.7-2.2 4.8-4.8 4.8s-4.8-2.1-4.8-4.8c0-2.7 2.2-4.8 4.8-4.8 2.7.1 4.8 2.2 4.8 4.8zm11.2-7.4v14.9c0 2.3-1.9 4.3-4.3 4.3h-23.4c-2.4 0-4.3-1.9-4.3-4.3v-15c0-2.3 1.9-4.3 4.3-4.3h3.7l.8-2.3c.4-1.1 1.7-2 2.9-2h8.6c1.2 0 2.5.9 2.9 2l.8 2.4h3.7c2.4 0 4.3 1.9 4.3 4.3zm-8.6 7.5c0-4.1-3.3-7.5-7.5-7.5-4.1 0-7.5 3.4-7.5 7.5s3.3 7.5 7.5 7.5c4.2-.1 7.5-3.4 7.5-7.5z"></path></svg></span><span style="display:inline-block;padding:2px 3px">NICK SELIVERSTOV</span></a>

## Searching around
When searching for this pattern, you can find a lot of examples that show you how the HttpClient does things and how to fix it (declare the client as static so it isn't disposed on every function execution). You can even fin examples from [Troy Hunt](https://www.troyhunt.com/breaking-azure-functions-with-too-many-connections/) and from the [ALM Rangers](https://blogs.msdn.microsoft.com/visualstudioalmrangers/2018/04/03/how-we-checked-and-fixed-the-503-error-and-performance-issue-in-our-azure-function/).

## Monitoring
Since we are using the [Azure Fluent SDK](https://github.com/Azure/azure-libraries-for-net) to retrieve information from an Azure Subscription, and that instantiates several HttpClients inside of it, I wanted to start monitoring the connection count first, to see if it was a gradual ramp up (first time finding it was 24 hours **after** deployment of a change), or something else.

Monitoring would give a better idea overall about the issue and it's part of the DevOps practice: you cannot improve things if you aren't monitoring them first.

## Searching around for monitoring
Since I couldn't directly find how to monitor the connection count, I even opened an [issue](https://github.com/MicrosoftDocs/azure-docs/issues/17205#issuecomment-432484636) on the documentation repository to see if someone could help. Sure enough, someone responded with the location where to find the metric.

Since it took me a lot of searching and overlooking the first selection option, I am documenting the full process here.

## Finding the metric
Of course, the information is only available when you are running [Application Insights](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-overview).

1. Go to the Application Insights instance connected to the Function
1. Go to 'metrics'
1. **Change the resource** from your 'Application Insights' instance to 'App Service' to connect to the App Service that is hosting the function.
1. There is only one 'metric namespace' to choose from, and it is already selected.
1. Select the 'Connections' metric:
![Azure Metrics](/images/2018_10_24_01_Metrics.png)

## Fixing the used connection count
After monitoring we changed the instantiation of the clients we used from the Azure Fluent SDK to static instances and you can see that the connection count has improved a lot:
![Improvement](/images/2018_10_24_02_Metrics.png)
