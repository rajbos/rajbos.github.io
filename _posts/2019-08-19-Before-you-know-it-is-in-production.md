---
layout: post
title: "Before you know, it is in production"
date: 2019-06-19
---

When I am working on something, usually software, I know from experience that a simple tool to test something out (e.g. a POC, Proof of Concept), can be in production in no-time.
That is when I start to focus on everything we start to ignore:
* don't write unit tests, it is only a POC;
* we don't need to make this resilient, it is only to proof this will work;
* just name the project yyyyMMddd.TestProject.exe, we will never need to find it again, if this works;
* we don't need to make this scalable yet, we'll figure that out in the future.

I am just as guilty of this, hence this post for later referral :smile::

## Guilty as charged!
![The Cause of this](/images/2019/20190619/20190619_08_TheCauseOfThis.png)

# Case in point
Recently I was a member of the core team for running the infrastructure for [Global DevOps Bootcamp](https://www.globaldevopsbootcamp.com).
![GDBC Logo](/images/2019/20190618/2019-06-18_01_GDBC_Logo.png)

When we started, Jasper Gilhuis was trying to automate everything we needed to create the accounts and pages for the venues in Eventbrite (read more about his experience [here](https://jaspergilhuis.nl/2019/06/18/global-devops-bootcamp-write-up-registration-process/)) and he could not find an API for making the venue organizers a Co-admin in our Eventbrite event.

We needed this because we wanted to have the venue organizers have visibility into their registered attendees and be able to send them in-mails from the platform. First we created the global event and added the local venues as a sub-event. Then we wanted to add their accounts as a co-admin. Do check out Jasper's post for the why's behind this setup.

# Every tool is a hammer
I believe that every tool is a hammer: even if you know you should do this, you know you can do it with your tool: before you know it, you are hammering in a nail with a phone (check YouTube, it happens!).

![Image of Adam Savage's book: every tool is a hammer](/images/2019/20190619/20190619_01_Every_tool_is_a_hammer.jpg)

## Selenium is on of my hammers
Seeing that the Eventbrite API was not able to do what we wanted, and that the flow in the website didn't seem that hard, I made a new console application for this to use Selenium to click through the website. My first contribution to GDBC this year! As this was a tool to help with the Eventbrite automation, this ended up in the Eventbrite repository.

![First commit in GDBC repository](/images/2019/20190619/20190619_02_FirstCommit.png)

# We need to store some state!
After a while we needed to store the state of the venue registrations: which venues where already mailed and checking into our Slack channel, etc.? We tried to do this with a Table in an Azure Storage Account, but found out the hard way that you need to update the full document, otherwise you will only see the columns you just updated: the rest *will be gone*. So, us having a lot of experience with SQL server used the tool we knew that would work Azure SQL (another hammer!). Switching to that immediately triggered me to start with Entity Framework to make the communication as easy for me as could be (hammertime!).

![GDBC Db Context project added](/images/2019/20190619/20190619_03_DBContext.png)

# We need to show the venues on the website!
A team member asked to use the data we had to update the website and show the locations, registration urls and the number of venues on our main ([website](https://www.globaldevopsbootcamp.com)). Since this was already in the ConsoleApp, I added this as an extra startup action: Run the application like this and it will update a blobstorage container with the latest version of a data file that the website could then use to show the data 👇.

``` c#
ConsoleApp.exe -exp
```

Since I did not want to run this application by hand but every night, I found ... another tool to do so!

![Azure DevOps Venue Update Pipeline](/images/2019/20190619/20190619_04_VenueUpdatePipeline.png)

# Provisioning Azure Resources

After a couple of weeks we needed to start rolling out Azure Infrastructure (for more information, check out this [YouTube video](https://www.youtube.com/watch?v=VPKNvE9Lnpk&list=PLCnpc4jNC9lBPR65GtrXYMXyge4VKll9l&index=7&t=2s) where I explain what we did. All the resources we needed to create had a link back to the venue and teams that where in the database.... And so I added just another startup action to the tool to start running the steps to provision everything in Azure, based on the information in the database. Can you see where this is going???

# Startup actions for when you want to run the tool locally
Initially this started out to be a tool so me or Jasper could run it locally, see all the Eventbrite screens fly by (later headless) and then do some other actions where added.

Today, this looks like this (what a mess!):
![Startup actions of the executable](/images/2019/20190619/20190619_05_Actions.png)
I wanted to have multiple options for the user to choose from and be able to run action 2 first and if that was executed correctly, run action 3 next.

# Running the action in a pipeline
After I added more and more actions for the tool to do, I needed to make it run inside of a pipeline, read some parameters that where passed in and then close the application. For this I always fall back to the [Mono.Options NuGet package](https://github.com/xamarin/XamarinComponents/tree/master/XPlat/Mono.Options).

This is way those settings look like today:
![Mono actions of the executable](/images/2019/20190619/20190619_06_Actions.png)

So is this still the same application!? Unfortunately, it is... 😲. Every decision in this application was a combination of:
* YAGNI (You ain't going to need it),
* This is just to run once,
* Lets make this work quickly

In the end, it got the job done, as it is included in every stage of our main provisioning pipeline:

![Massive Azure Pipeline](/images/2019/20190619/20190619_07_MassivePipeline.png)

# Conclusion

1. Even if it is just a tool to test: write the code and name things like it will end up in production.
1. Every tool is a hammer and will be used as a hammer a some point.

![Adam Savage One day build](/images/2019/20190619/20190619_02_AdamSavageOneDayBuild.jpg)
### Check out the video from this one day build on [YouTube](https://www.youtube.com/watch?time_continue=3&v=G7MDrUG4cws)
