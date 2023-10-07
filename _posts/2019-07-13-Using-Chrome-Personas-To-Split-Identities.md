---
layout: post
title: "Using Chrome Personas to split identities"
date: 2019-07-13
---

As a consultant, I get to work at a lot of different settings and environments. For most of my customers these days, that means working on my own laptop and in the cloud with SaaS application.

Logging in to all those customers can be a messy thing: I've seen people having a identity picker in Azure (or any other Azure Active Directory backed system) that they have to **scroll** through to get to the identity they want to use 😱. Seriously!

**Note**: It did get better in the last years, previously you actually had to log out and in as a different identity to make this work, but still... we can do this better!

![Hero image](/images/2019/20190713/jesse-orrico-unsplash.jpg)
##### <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@jessedo81?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from jesse orrico"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Jesse Orrico on Unsplash</span></a>

## Solution

I have a helpful way of keeping all those personas separately from each other, with some additional benefits.

First and foremost, I do this to keep everything nice and tidy: separating them helps my mind in compartmentalizing the status and context of the tasks that I am doing.

# Chrome Personas
I have use Chrome personas for several years to accomplish this, after learning this feature was available in FireFox and Google had copied that functionality. It is a feature that lets you separate parts of your browser into it's own (hosted) process and keep everything in that compartment. I noticed that Chrome does this with:
* Browsing history
* Tab history
* Plugins
* Stored Passwords

### Benefits
So by doing this, I can separate my personas and with it my identity! I make a new persona for every customer that I get to (and others for personal account separation). I let Chrome store the URLs, tabs and passwords that I need for that customer, and when I leave, I just remove the persona from my system!

In each persona I have logged in to different Azure accounts for example, together with different Azure DevOps accounts, Office365 logins and other services that I need (tooling, CRM's, other SaaS offerings). This saves a lot of switching.

Some note's to this:

* I don't sync the personas currently, as I mainly use my 1 laptop), but you can if you want to. This is a persona by persona setting.
* Any account information that I need for later is stored inside of a [KeePass](https://keepass.info/) file backed up in my Office365 OneDrive folder.

## Cool! Now how do you do this?
To get started, click on the User circle on the top right. You get a flyout with all you persona's. Mine is quite long:
![Persona's fly out in Chrome](/images/2019/20190713/2019/20190713_01_MyPersonas.png)

Noticed the persona `Faebook`? I wanted a persona with my FaceBook account in it, to prevent my personal account leaking around everywhere when I don't want to. I use that product only on my phone for family stuff, so I did not want to login to it on any of my persona's. Unfortunately **you cannot renamed** them (can't find it in the UI anyway)!

### Manage people

Click on 'manage people' to open a window where you can create new accounts and delete existing ones:
![](/images/2019/20190713/2019/20190713_03_PersonasAdmin.png)

Notice that you can use a lot of different icons and images to link to your persona. I usually use the companies color for my customers persona and something else for personal stuff.

Now you can use the new persona. Notice how it opens a new Chrome window that's also separated on the taskbar? That means you can pin it!

My most active accounts are always within reach.
![Windows Taskbar with the different personas](/images/2019/20190713/2019/20190713_02_Taskbar.png)

## Edge Dev
You can do the same thing in [Edge Dev](https://developer.microsoft.com/en-us/microsoft-edge/?WT.mc_id=DOP-MVP-5003719), since the functionality is in the [Chromium](https://www.chromium.org/Home) underpinnings that both Edge Dev and Chrome build on top off.

I wanted to use Edge Dev for this because of one big benefit:
![Open link in different personas in Edge Dev](/images/2019/20190713/2019/20190713_04_OpenAsInChrEdge.png)
This means that you no longer have to copy and paste links into a different browser/persona window to use a link! You can just use the build in functionality.

The main reason I haven't started moving my personas there is listed below in the Downside section below. I was a little disappointed by this and got sidetracked with other stuff. Writing about this is getting me to think about doing it again...

## Downside
The only real downside I have with this setup, is that Chrome does not let me **pin my main persona** (the one that I did not create) to the taskbar. Edge Dev has the same issue, so I suspect that this stems from the Chromium underpinnings.

### Main persona
The main persona seems to be the one that you logged in with to Chrome: I use that as my Gmail account and let that persona sync across other devices (iPad and iPhone). It is the user account on Googles back-end, so to say.

### The issue with the main persona
The main persona is attached to the first Chrome pin on the taskbar. When you switch to that persona in Chrome, suddenly it is updated with the image for that persona:
![Taskbar with main persona icon filled in](/images/2019/20190713/2019/20190713_05_Taskbar2.png)

Note the difference with the screenshot before, when that persona was not loaded. Notice the 6th icon here? It was empty before:
![](/images/2019/20190713/2019/20190713_02_Taskbar.png)

When you try to pin that persona, it's pinned as the default process! There is no way to have that persona pinned on the taskbar. If you close that session, the icon is clear again. If you click on it **it will open the last opened persona**!

## Help me out
If you have a way to fix this (If have even tried to mess around in `C:\Users\RobBos\AppData\Roaming\Microsoft\Internet Explorer\Quick Launch\User Pinned\` with manual shortcuts, but none of it worked), please reach out!

That would solve the only issue that I have with this setup: it could be complete by fixing this!

## Update: also tested with launching Chrome manually
After a tip from [Jasper](https://twitter.com/jaspergilhuis) I tried to see if I can launch Chrome.exe from the commandline with the correct persona. You can do so by providing it an extra parameter:
`.\chrome.exe --profile-directory="Profile 1" `
Maybe this can be included in a shortcut and launch it that way?

To see how Chrome names the personas, you can check your user directory here: `C:\Users\RobBos\AppData\Local\Google\Chrome\User Data\Guest Profile`

Or look in the registry editor:
![Registry editor window with Chrome settings open](/images/2019/20190713/2019/20190713_06_ChromeManually.png)

I've tried them all before finding that the Default profile is indeed called.... the Default profile! Unfortunately does the same thing.
I also found to extra personas that might have been deleted at some point. After launching them, they are also visible again in the Chrome UI!

By the way, storing the shortcut like this on the desktop and launching it does work. But I don't like to switch to the desktop each time I want to launch into this profile.