---
layout: post
title: "Retrieving AppSettings for an App Service with the Fluent SDK"
date: 2018-08-23
---

I am using the [Azure Fluent SDK](https://azure.microsoft.com/en-us/blog/simpler-azure-management-libraries-for-net/?WT.mc_id=AZ-MVP-5003719) to retrieve information about the Azure setup and I wanted to retrieve the AppSettings from an App Service (or function app, or logic app). The simple solution didn't work and 
searching around didn't reveal any information about it. Finding something that did work (initial testing with a different service principle didn't change the results), so here we are...

![](/images/2018_08_23_Research.jpg)
###### Photo by [Osman Rana on Unsplash](https://unsplash.com/photos/Sdk-tXmnplk)

## Expected simple solution
Because all other information I needed came from a WebApp, retrieved by the default call, I expected that loading the AppSettings from the SiteConfig would deliver all settings:

``` c
IAzure AzureConnection = GetAzureConnection();
var webApp = await AzureConnection.AppServices.WebApps.GetByIdAsync(webAppResourceId);

var settings = webApp.Inner.SiteConfig?.AppSettings;
// settings is null because SiteConfig is null
```
Unfortunately, the SiteConfig stays completely empty. As mentioned I checked and tested it with another service principle with more rights, but that wasn't the issue. Searching around on the web didn't yield any new information.

### Research the Http traffic
So next I checked the Http traffic being send to see if the information came back from the HttpCall. [Note: the Fluent SDK is a wrapper around a generated HttpClient against the REST api's]

#### Traffic from the FluentSDK calls
First up was seeing what Http calls where being made. For this I used [Fiddler](https://www.telerik.com/fiddler).

HttpRequests:
```
GET /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroupName}/providers/Microsoft.Web/sites/WebAppName
GET /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroupName}/providers/Microsoft.Web/sites/{WebAppName}/config/web
```
You can see the loading of the WebApp information and next loading of the config for that WebApp.

#### PowerShell
Next I wanted to see if I could load the settings from a different stack, like e.g. PowerShell. Lo and behold, the PowerShell call **did yield AppSettings!!!! WTF?!** 

From PowerShell:
``` powershell
$webApp = Get-AzureRmwebApp -ResourceGroupName $resourceGroup -Name $webAppName
$webAppSettings = $webApp.SiteConfig.AppSettings
```

HttpRequests:
```
GET  /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroupName}/providers/Microsoft.Web/sites/WebAppName
GET  /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroupName}/providers/Microsoft.Web/sites/WebAppName/config/web
POST /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroupName}/providers/Microsoft.Web/sites/WebAppName/config/appsettings/list
POST /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroupName}/providers/Microsoft.Web/sites/WebAppName/config/connectionstrings/list
```
Here you can see the same calls to the WebApp ad the Config, but then all of a sudden there are two **other** calls into the config endpoint! You can see it's loading both the AppSettings and the ConnectionStrings.

Luckily the Fluent SDK is [open source](https://github.com/Azure/azure-libraries-for-net) (hurray for Microsoft!) so I started searching for the class that would handle the json that was being retrieved from the REST call.

## Solution
Searching in the Fluent SDK's source code if eventually stumbled onto a new ManagementClient: the `WebSiteManagementClient`, specifically helps with the settings for those websites!

So the final code came down to this:
``` c#
var WebSiteManagementClient = new WebSiteManagementClient(AzureCredentials) { SubscriptionId = SubscriptionId};
var settings = await WebSiteManagementClient.WebApps.ListApplicationSettingsAsync(resourceGroupName, appServiceName);

var appSettings = settings.Properties;
```