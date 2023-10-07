---
layout: post
title: "Webservice Plan Scaling in Azure Machine Learning Studio"
date: 2019-02-25
---

I recently found that I had a web service plan running for my Machine Learning Studio (MLS) workspace in Azure. I was hosting some test webservices on it from a research session earlier on. The web service plan was not doing anything for me, but I did incur some costs running it. Since the default tier it picks during is already an S1, this can build up if you are paying the subscription yourself.

![](/images/2019/20190225/hero-photo-1508962061361-bcb4d4c477f8.jpg)
##### Photo by [Agê Barros](https://unsplash.com/photos/Yx1ZkifiHto)

Finding that web service plan started by looking at the resourcegroup the MLS workspace was created in.

The Azure Resource Group looks like this:
![](/images/2019/20190225/01-ResourceGroup.png)

You can see the plan, but when you select it you have no extra options. No insights into the cost and no option to scale.

To do any of this, you need to look inside of the workspace in MLS. To find the web services you deployed, open `Web Services`:

![](/images/2019/20190225/02-AzMLS.png)

Here, you can only see the actual deployed services from the experiments you made (I don't have any running here). You still cannot see the web service plan!

## The Trick

To actually find the web service plan and act on it, you need to go to a different interface for Azure ML:
Go to: [https://services.azureml.net/](https://services.azureml.net/) to manage your deployed services, then go to "Plans" and there you can administer your plans.

![](/images/2019/20190225/03-MLS-Plans.png)

Select the plan and click on `Upgrade/Downgrade plan`:
Now, you can actually scale the plan to your needs.
![](/images/2019/20190225/04-MLS-Scale.png)

If you aren't using the service that much, there even is a Free Plan!