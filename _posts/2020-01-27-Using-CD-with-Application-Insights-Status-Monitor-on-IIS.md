---
layout: post
title: "Using CD with Application Insights Status Monitor on IIS"
date: 2020-01-27
---

Recently I found an IIS hosted web application that we couldn't instrument with Application Insights. As it is running in IIS,
it is possible to start monitoring it with Application Insights through the `Web platform Installer`. You can find how to do that
for example [here](https://www.c-sharpcorner.com/article/configure-an-iis-server-to-use-application-insight/).

Installation and configuration is rather straightforward.

![Photo of serene clouds](/images/2020/20200127/dominik-schroder-FIKD9t5_5zQ-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@wirhabenzeit?utm_medium=referral&amp;utm_campaign=photographer-credit&amp; utm_content=creditBadge"  target="_blank" rel="noopener noreferrer" title="Photo by Dominik Schröder"> <span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"> <title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span> <span style="display:inline-block;padding:2px 3px">Photo by Dominik Schröder</span></a>

What this post is about, is the files you need to take care of when you are deploying your web application with a Continuous Deployment
pipeline, as we where doing. In that case you'll find, that the connection with the Application Insights instance keeps getting lost.

Figuring out what was happening took some time and meticulously checking before and after of directories and file contents.

# Solution for the disconnect
After taking care of the default settings in the `ApplicationInsights.config` (instrumentation key) and `web.config` (handlers),
we found out that we needed to include the binaries in the bin folder that the Status Monitor sneakily added to our application directory:

![](/images/2020/20200127/20200122_binaries.png)

After adding these files (for example in an internal NuGet package) and including them during our deployment, the Status Monitor now stays
connected and sending telemetry to you Application Insights instance.
