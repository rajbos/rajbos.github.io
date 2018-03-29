---
layout: post
title: "DevOps and Telemetry: Supporting systems"
date: 2018-03-22
---

**Note** This is part 2 in a series of posts about DevOps and the role of telemetry in it. In part one I described the reasoning behind the series and explained how I started with logging (usage) telemetry for a SaaS application. You can read part 1 in the series [here](2018-03-14-DevOps-and-Telemetry-Insights-into-your-application).
In this post I want to explain about the next step: logging information about the systems that support the application: servers, database, storage and anything that comes with that.

## Series overview
* [Part 1](2018-03-14-DevOps-and-Telemetry-Insights-into-your-application) - My journey with telemetry and starting with logging
* Part 2 - Supporting systems and how to gather that information (this post)
* Part 3 - ?

![Dashboard example](/images/20180329_03_Dashboard.png)

# Telemetry on supporting systems:

For a SaaS application running on an [Azure Web Service Plan](https://docs.microsoft.com/azure/app-service/azure-web-sites-web-hosting-plans-in-depth-overview), you can use a lot of components, so I'll focus on stuff I have used in the past and are most commonly used:
* App Service Plan
* Sql Database
* Blob Storage
This should be enough to give a broad overview of the standard monitoring options. 

## Available information from Application Insights
I'll start at the point from the previous post where I added [Application Insights](https://docs.microsoft.com/azure/application-insights/app-insights-overview) to the application: I had (request) telemetry available from that, with visibility into all calls to depending services. From this, I started creating a dashboard to bring all this information together in one view, so that it could be shared with the team responsible for building and running the application.

## Database
One example of the additional telemetry data that I got from Application Insights was for the Azure Sql Database that was used. Thanks to Application Insights, you'll get the following (very handy!) information:
* Query duration
* Number of times a query has been run against the database
* Where that query has been called from (e.g. in your application code) 
Some of this information is also visbible from the Azure Sql Database itself, but I think Application Insights provides nicer reporting on it.  
This came in very handy when searching for performance issues throughout the application. I made this information available in a separate dashboard to be used for hunting down those issues, because I didn't need them for the operational overview that I made sure to have always visible on a seperate screen.  
*Note:* some of this information is also available from [Query Insights](https://docs.microsoft.com/azure/sql-database/sql-database-query-performance).

![Query Performance Insights](/images/20180329_QueryPerformanceInsights.png)

### Database Transaction Units (DTU)
Next up is the standard database telemetry that Azure allready logged for us: the most interesting parts are database size, maximum database size and even more important: DTU measurements! For a more in dept explanation about DTU's, check Microsofts explanation [here](https://docs.microsoft.com/azure/sql-database/sql-database-what-is-a-dtu). 

Picking a good service tier for your database can be tricky and depends heavily on you useage patterns. If you have spikey traffic (think long running transactions or daily ETL tasks), you can consider changing the database tier up front or over provisioning (can be costly). Ofcourse, you can think of other tactics to prevent running into the Max DTU for your service level, like caching (always tricky!), offloading heavy writes & updates to a different storage mechanism (or sticking it in a queue!).

![DTU](/images/20180329_02_DTU.png)

Anyway: make sure to test with a respresentitave load before running it in production! Seeing a chart link above is not great in production.  
Changing the service tier is possible, but you really do not want to do this during a long running transaction. This will only make your performance issue last longer :-).

## Blob Storage
On blob storage you'll want to start with monitoring these metrics: Ingress (traffic **into** the storage account, so uploads), Egress (traffic **out of the** storage account, so downloads). Next up will be the latency and number of requests.  
Depending on the layout of your storage account, you might want to digg deeper in the used 'folders' or 'containers' inside of the storage account. I had once a multitenant SaaS application that billed the tenants for (parts of) the used storage, so I talked to the storage api to get file and size measurements per tenant. To start retrieving that information, you can look [here](https://docs.microsoft.com/rest/api/storageservices/blob-service-rest-api).   

## Next up:
The next post in this series will be: 'Part 3 - Supporting of the support systems'. I think it could be helpful to have a (start of) a list of items I started tracking that come up when checking the support systems like blob storage and SSL certificates. Sometimes these parts of the system are forgotten, until it is to late! I'll dive into that in the next post.

I'll update this post with a link when Part 3 is available. 