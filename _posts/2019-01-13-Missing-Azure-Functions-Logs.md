---
layout: post
title: "Missing Azure Functions Logs"
date: 2019-01-13
---

I was testing with our Azure Function and had set the cron expression on the timer trigger to `"0 0 */2 * * *"`, based on the example from the Microsoft [documentation](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer#cron-expressions?WT.mc_id=AZ-MVP-5003719). When I went to the logs a day later, I noticed that some of the runs weren't there!
![](/images/emily-morter-188019-unsplash.jpg)  
<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@emilymorter?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Emily Morter"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Photo by Emily Morter</span></a>

## Missing logs ??
I added a red line were I noticed some of the logs missing.
![](/images/2019/20190113/20190113_01_Every_2_hours.png)

At first, I thought that the trigger wasn't firing, or maybe something was wrong with my cron expression. I tested several other expressions and redeployed the function, but to no avail. 

## The search
Eventually, I found a comment deep down in a [GitHub issue](https://github.com/Azure/azure-functions-host/issues/1534#issuecomment-427922955) that actually pointed me in the right direction!

## Application Insights Sampling
The logs you see in an Azure function are provided by Application Insights. Due to large data ingestion during our testing period (we had the trigger fire every minute to test with), I had enabled **sampling** on the Application Insights instance! That change was made after seeing a bill going upwards of € 500,- during the testing period 😄. 

## Finding the sampling setting
To correct the sampling settings (running once every two hours is significantly less data then every minute!), you need to go to the Application Insights instance.

Go to `Usage and estimated costs` and click on the `data sampling` button:
![](/images/20190113_03_Settings.png)

You can now change the sampling setting:
![](/images/20190113_02_Sampling.png)

Wait for a couple of runs to execute and you can verify that it now shows all the logs again:  
![](/images/20190113_04_Fixed.png)



