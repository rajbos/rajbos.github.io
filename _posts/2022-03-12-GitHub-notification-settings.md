---
layout: post
title: "GitHub Notification Settings"
date: 2022-03-12
---

I notice a lot of people getting lost in their GitHub notifications. Here is what you can do to get some control back! The default settings send you emails for everything. A lot of people then create an email rule to move all those emails to a specific folder, which means they will never look at those emails again! With some tweaking you can make the notifications work _for_ you.

If you want to see this in action, watch the video I created:  
<iframe width="560" height="315" src="https://www.youtube.com/embed/eIWzKR465M0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Intro
There are a couple of things at play when using notifications:
* settings for how and where you want to receive the notifications (email, web, etc.)
* reasons for getting a notification

Telling GitHub to send you a notification can happen in a few different ways. You can subscribe to updates, either at the organization level (bad idea: way to noisy), at the repository level or for a specific issue, pull request, discussion. People can also @mention you or a team that you are in, which can then trigger a notification for you.
## Step 1: check you settings on _where_ you want to receive the notifications
Go to [github.com/settings/notifications](https://github.com/settings/notifications)  

### Automatic watching
Under this section you find two options, both of which I would like to control for each organization I am in. Unfortunately you cannot at the moment.  
By default these checkboxes are checked, which means that you will receive notifications for all the repositories you have write settings to. If you are an admin, or like me a trainer: you will get a lot of notifications, so it's often a good idea to turn this off. In my case, I am one of the trainers who use an organization during these trainings and give our trainees a repository **each** to work in. Since we are admins on the org, we would get write access to each repo, meaning a notification for each issue and pull request that happens in it! Given that one of the exercises is to enable Dependabot on a test repository, that is a lot of noise for me!

The other setting in here is for all the teams that you are added to. If your team uses discussions in GitHub to reach out to each other, this setting is often very useful to leave on.
![Notification settings - Automatic watching](/images/2022/20220312/20220312_01.png)  

### Participating and watching
These settings define the medium used for notifying you: email, or through the UI. Since the emails do not work for these (you can use the notifications as a personal backlog if you use the UI and not through mail), if always configure this to only use the UI (web and mobile). For triaging on the go I usually use the mobile app and then the things I really need to work on stay in the notifications list. Every once in a while I go through them and act where needed.  
![Notification settings - Participating and watching](/images/2022/20220312/20220312_02.png)  

### Dependabot alerts
With this setting the places where the notifications from Dependabot alerts ('you have a vulnerable dependency') are visible. You can then still configure it to also send you an email:
* when the vulnerability alert is created
* and / or once a week as a digest

![Notification settings - Dependabot alerts](/images/2022/20220312/20220312_03.png)  

### Actions
With these settings you can tell GitHub how to send you notifications for your workflows. Then you can tune that down a bit to only send notifications for failed workflows. I really wish they will improve this feature so that it cooperates with me looking in the UI to see if I have already watched the workflow fail: often during the creation of the workflow, you are already working in the UI to check the logs and fix them. After a while you find 40 notifications, for all the failed runs you have already looked at. I'd rather only have one notification for each failed run that I have not yet seen.
![Notification settings - Actions](/images/2022/20220312/20220312_04.png]  

### Organization alerts
Not a lot of people will have these rights, but you can toggle of the notifications for when someone creates a [deploy key](https://docs.github.com/en/developers/overview/managing-deploy-keys).  
![Notification settings - Organization alerts](/images/2022/20220312/20220312_05.png)  

### Email notification preferences
With these settings you can pick for which type of event your notifications emails will be send and to which one of your verified email addresses.  
![Notification settings - Email notification preferences](/images/2022/20220312/20220312_06.png)  

### Custom routing
With custom routing you can configure the preferred email address for each organization. For example you could have a single account to login to your personal account and your work organization. Then you might prefer to send the email notifications for your work organization to your work mailbox.  

![Notification settings - Custom routing](/images/2022/20220312/20220312_07.png)  

## Step 2: Tune down the amount of notifications!
On [github.com/settings/notifications](https://github.com/settings/notifications) you can use the filter options to find out why you are getting them: you might be 'following' (called watching) the repo (and thus get a notifications for anything that happens in that repo), or have `subscribed` to specific pull requests or issues.

In the lower left hand side of the notifications view there is a small link 'manage notifications' which will give you this popup:  
![Settings popup](/images/2022/20220312/20220312_08_Settings.png)  

### Watched repositories and subscribed to PR's and issues
With 'watched repositories' and 'subscribed' you can see which repositories you are watching and which pull requests or issues you are subscribed to. Since the watched repositories give the most notifications, you want to start here:

![Watched repositories](/images/2022/20220312/20220312_09_Watching.png)  

Go through the list of repositories and figure out if you really need to be watching for **every** thing that happens in it. Often you want to be notified on participating and @mentions. To turn them off, use the 'Ignore' settings for that repository.
![Watching options](/images/2022/20220312/20220312_10_Watching_options.png)  

The power option here is the 'Custom' setting:  
![Custom watch options](/images/2022/20220312/20220312_11_Watching_custom.png)  
Now you can really configure for what things you want to be notified. So this is somewhere between the 'All activity' and 'Participating and watching' settings in.

# Why did I get this notification?
You can go to the notification and click on it. That will bring you to PR / issue / discussion that was the reason the notification was sent. The UI tries to help you figure out why you are receiving it:  
![Notification reason screenshot](/images/2022/20220312/20220312_12_NotificationReason.png)  

Hope this helps making your GitHub notifications more manageable. If you have any follow up questions, leave them in the comments below!
