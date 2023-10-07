---
layout: post
title: "Azure Active Directory Authentication Issue with .NET Core"
date: 2020-04-23
---

Today I faced an issue with Azure Active Directory authentication that was interesting enough to not this down for later reference 😁.

# AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application

I've got this issue in our (new) web application:
![Error message from Azure Active Directory](/images/2020/20200423/20200423_01_Issue.png)

With the help from this [blogpost](
https://www.koskila.net/aadsts50011-the-reply-address-does-not-match-the-reply-addresses-configured/) from Antti I've learned that the url you've entered to redirect to after the authentication is done, has to match **exactly** with the URL you send in with the Authentication Request itself.

To verify your own setup, go to the App Registration Setup and find the URL you are using.
![Error message from Azure Active Directory](/images/2020/20200423/20200423_02_AppRegistration.png)
I my case, we where using OpenIdConnect middleware that listens on a specific url for the callback that you can specify yourself (so you can match it with the App Registration). To make it clear where we are coming from, I'm using `signin-microsoft`.

# OpenIdConnect .NET Core middleware
In the image below you can find the place where we configure this callback path (we load it from the configuration here). Do note that the middleware doesn't want the root path here, so `/signin-microsoft` will do the trick in this case.

![Configuration settings in .NET Core](/images/2020/20200423/20200423_03_NET_Core_Settings.png)
