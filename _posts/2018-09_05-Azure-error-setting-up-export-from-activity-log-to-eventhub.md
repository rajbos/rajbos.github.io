---
layout: post
title: "Azure error setting up export from Activity Log to Event Hub"
date: 2018-09-05
---

While working to setup an export from Activity Log to an Event Hub I got no response on a save action. This took some time to figure out why this happened, so I thought it could be helpful for someone else.

## Issue when saving
When saving the export setting via this blade:  
![](/images/2018_09_05_Export_activity_log_failure_setup.png)

I got this error:  
![](/images/2018_09_05_Export_activity_log_failure_setup_notification.png)

After scratching my head a little I checked the browsers console log:  
![](/images/2018_09_05_Export_activity_log_failure_setup_consolelog.png)

Well, what do you now! Apparently the resource provider `microsoft.insights` hasn't been registered yet! Would have been a nice message inside of the Portal itself, but at least now I can fix it!

## The fix using the portal
Go to your subscriptions, pick the correct one and navigate to resource providers:  
![](/images/2018_09_05_Export_activity_log_failure_setup_register.png)

Register the `microsoft.insights` provider and save the export option again. Problem solved!

## The fix using PowerShell
You can also fix this via PowerShell, as you can read on [Pascal Nabers](https://pascalnaber.wordpress.com/2017/05/30/fixing-the-subscription-is-not-registered-to-use-namespace-microsoft-xxx/) blog.
