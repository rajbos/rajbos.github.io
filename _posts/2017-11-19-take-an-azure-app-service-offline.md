---
layout: post
title: "Azure App Service - a quick way to take your app Offline"
date: 2017-11-19
---
After searching for the third time on how to do this, I thought it would be time to write about this here 😬. 

If you have an Azure App Service that for some reason should just display a message to the user, indicating that it isn’t available, you can do this. 

I have had several reasons to do this:

single app service host, without a deployment slot and a big db update ( > 10 minutes
db hitting a spending limit and no wish to update the limit
moving dns names and certs between app service plans (were recreated with a better name)
### App_offline.htm
Create or place a new file in your webroot (wwwroot) named “app_offline.htm”. I usually create it using kudu. 
The appservice will see this and online serve this file, as long as it’s there. 
Note: the contents of the file can be anything, including css and images from anywhere else in your wwwroot. 
