---
layout: post
title: "GDBC: 48 hours in the live of a team member"
date: 2019-06-18
---

Last weekend we got the opportunity to organize the Global DevOps Bootcamp [link](www.globaldevopsbootcamp.com) and it was a blast!

![GDBC Logo](/images/20190618/2019-06-18_01_GDBC_Logo.png)
 
Thanks to [René van Osnabrugge](https://twitter.com/renevo), [Marcel de Vries](https://twitter.com/marcelv) and [Mathias Olausson](https://twitter.com/molausson) for coming up with the idea to create GDBC and sticking with the team to get this idea of the ground!  
Without them and our sponsors ([Xpirit](www.xpirit.com), [Solidify](https://solidify.se/), [Microsoft](www.microsoft.com)) we could not have started with the event!

# Team work!
To set everything up we send out a call to everyone who helped last year and also to their friends. In the end we had a team with around 15 members, each picking up tasks they could handle (or try something new!). Without all that countless effort of them we would not have been able to pull this off! 

# The week leading up to GDBC
During the last few months, we had a Monday call at 9:00 PM with the entire core team and of course René, Marcel and Mathias. In it, we discussed the progress, challenges we where facing and asking for help if needed. On and off there where more people involved (special mentions for [Sofie](https://xpirit.com/xpiriter/sofie-wisse/) and [Niels](https://xpirit.com/xpiriter/niels-nijveldt), who supported us heavily in the last week!!!). Usually we spend half an hour to an hour keeping each other up to date.

![GDBC Core Team](/images/20190618/2019-06-18_02_CoreTeam.png)  

We all do have day jobs to feed our families, so we actually worked as much as we could during the regular working days and then switched to GDBC when we could. For most of us that meant as soon as the kids or our partners where asleep. I've seen a lot of input, commits and feedback after midnight, so everyone was fully committed to this cause. 

We lived the event through [Slack](www.slack.com), where the whole team would communicate with everyone involved: from sponsors, core team to the local venue organizers.

# Wednesday and Thursday
Although we got a sponsorship from [Microsoft](www.microsoft.com), our funds where limited, so we started provisioning all the infrastructure we needed for the event on Wednesday. I will dive into that setup later on, but you can see my explanation here: 
<iframe width="900" height="506" src="https://www.youtube.com/embed/VPKNvE9Lnpk?list=PLCnpc4jNC9lBPR65GtrXYMXyge4VKll9l" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>  
  
## Azure DevOps Pipelines:  
![Azure DevOps Pipelines](/images/20190618/2019-06-18_40-pipelines.png)  
  
## Resources for Azure Subscription 1:  
![Azure Resources for subscription 1](/images/20190618/2019-06-18_41_Azure.png)  
  
This didn't go as easy as we hoped, luckily we anticipated throttling, availability issues of resources in the Azure regions we needed, etcetera, so we had plenty of time to do so. I will blog about the lessons we learned here separately and update this post with a link to it. Fortunately we had four different Azure Subscriptions to use so we could spread the load!  

As most of our infrastructure got available, we enabled the venue organizers to pick on of the teams available for them and start testing our infrastructure end-to-end with it. We already did that with some specific demo venues, so we got some confidence that this would mostly work. We needed their feedback, specifically because there is no place to test on, then production!

# Thursday call
On Thursday we had an extra call: around 24 hours before the event would start, so we could cross the t's and dot the last i's. There where some last minute challenges that some of us where facing, like the flaky connection that had issues with the way the Parts Unlimited website now used the connection strings and a call to [Azure DevOps](dev.azure.com) that wasn't tested with 1300 team projects :smile: .

## Firewall rules for challenge 
To handle the firewall rules changes I've spend the rest of the evening with [Jakob](https://twitter.com/jakobehn) testing and updating all the SQL servers that we had provisioned so that the challenge could work.  
![](/images/20190618/2019-06-18_03_FlakyConnections.png)  

## More teams needed!
During the day an organizer checked their setup and asked us for more teams! They checked the participants registrations, did the calculations and where worried they would not have enough resources to place everybody in the group size they had in mind. Only other options was making the team bigger. We had been discussing that we would communicate a stop on any changes, but decided to help this organizer out. We communicated the stop on changes a couple of minutes later to prevent us from scrambling at the last minute with changes.

![Azure extra resource groups](/images/20190618/2019-06-18_04a.png) ![Azure DevOps extra team projects](/images/20190618/2019-06-18_04b.png)  

## A teams is missing!
During the call that evening another organizer pinged us letting us know that he missed team-05 out of the 16 teams we provisioned for them. In Azure the resource group and the team users where created, but the team project was not available in Azure DevOps. As they also indicated they had sold out all the tickets, we needed to fix this. So I planned in a new run for that venue as well. 

## If it hurts, do it more often
It is really true: if it hurts, do it more often. Especially in a DevOps team, do the things that hurt more often you'll get good at it and you have the change to automate them! I already pressed René on this last year: we needed to have pipelines setup for as much as we could, so we wouldn't be locked to a specific developer and their laptop to kick off updates. Since we where creating a lot of stuff, these would also take up to hours of runtime before they'd be finished, so this wasn't helpful. 
This meant that I had to setup pipelines for everything I did in Azure, otherwise René would not stop bothering me this year to do so, as he should! :kissing_heart:! Him, [Jasper](https://xpirit.com/xpiriter/jasper-gilhuis/) and [Sofie](https://xpirit.com/xpiriter/sofie-wisse/) spend their time setting up a pipeline for Azure DevOps, so we had that part automated from front to back.

That meant that I could run through these steps in **15 minutes**:
* Update the database with teams we needed to create or update
* Create everything for them in Azure
* Create everything for them in Azure DevOps
* Kick off their CI/CD pipelines, so the web shops would be deployed
* Update their App Services to set up the correct DNS entries and SSL Certificates

# 48 hours: running the infrastructure for the event
After having a late night on Thursday I had trouble getting a sleep. The following morning I was up at 5:30 AM still rushing with excitement: This was the big day! Last year was phenomenal, hopefully this year would be as awesome as then! I checked the last results for the pipelines that where running to verify that every resource we needed was in place (all green!).

My oldest son (9 years old) had a presentation to give at his school and he wanted to practice it one more time, so I spend the hours before school with him so he could do so. After that I drove to the office to check in with the team there, for the final checks. I left at 4:00 PM to be home early, spend that time with the kids until they where a sleep and went to bed at 9:15 PM tried to sleep for some hours. My alarm clock woke me at 10:45 PM: time to login and join the Call Bridge we set up for it in Microsoft Teams! 

During the first checks my youngest son (4 years old) woke up and I tried to get him back to sleep. He needed a hug an a stuffed animal to keep him company.

![](/images/20190618/2019-06-18_00_SRE.png)

## 11 PM: Christchurch New Zealand starts the event!
There was a venue in Christchurch that would start the event officially and we decided to be online for them to see if everything was running as expected and offer help if needed. They had to go through the keynote presentations first, select the teams and then start logging in to the challenges website with their account we created. 
The team that decided to be on stand by was me, [René](https://xpirit.com/xpiriter/rene-van-osnabrugge/) and [Michiel](https://xpirit.com/xpiriter/michiel-van-oudheusden/).

### Btw: the challenges has been open sources under the Creative Commons - Non Commercial license [here](http://www.gdbc-challenges.com/).

We already pinged them to let them know we where available and asked them to keep us up to date on how the first hours went.

![Christchurch attendees where arriving](/images/20190618/2019-06-18_05_Christchurch.png)

The keynote was finished at 12:00 AM and we watched the infrastructure with hawk eyes! And ... everything worked! Crazy thing was that some organizers in Mexico and Redmond where actively testing with one of their teams, so they where on the scoreboard! Luckily [Geert](https://xpirit.com/xpiriter/geert-van-der-cruijsen/), [Niels](https://xpirit.com/xpiriter/niels-nijveldt) and [Chris](https://xpirit.com/xpiriter/chris-van-sluijsveld/) left us documentation in our wiki on how to remove them.   

![Christchurch communication](/images/20190618/2019-06-18_06_StartEvent.png)  

The teams in Australia where running by then and still everything look great on our end. Besides looking for issues there wasn't really anything to do but check the social media channels and respond there as well (we got sponsoring from [Walls_io](http://twitter.com/walls_io) to host a tweet wall [here](https://walls.io/gdbc2019)). 

## 2:00 AM Crashing team members!
At 2:00 AM both René and Michiel really needed to go to bed and sleep to be worth anything in the morning. I was still rushing with excitement and stayed online if anything came up. I managed to do that until 4:00 AM:   
![Last call](/images/20190618/2019-06-18_07_LastCall.jpg)  

So I messaged that to the venue organizers:   
![Sleepy time](/images/20190618/2019-06-18_06_SleepyTime.png)  

Gave a last status update to the team: 
![Status update](/images/20190618/2019-06-18_06_StatusUpdate.png)  
And went to bed, to find my youngest son laying in my side of the bed! Seems like he needed more than just a hug and a stuffed animal to hug and my wife had laid him in our bed.

# 2019/06/15 Global DevOps Bootcamp (CEST)
I actually managed to sleep until 6:30AM, even with the youngest kid taking up all the available space in bed (my side only :grinning:!). Quick shower and off to the office:  
![Brushing my teeth](/images/20190618/2019-06-18_08_FirstCall.jpg)

In Hilversum we planned to set up the Command Center / War Room for the event. Everything was planned around this because we knew from last years that West-Europe and the America's would take up the most resources and chatter to handle. Luckily for us: [Jasper](https://xpirit.com/xpiriter/jasper-gilhuis/) had taken it upon himself to host our own venue there. As usual, our hospitality team has the perfect setup to host a venue like this.

At the office, we have a [Ripple maker](https://www.drinkripples.com/) to print on your cappuccino's and [Jesse](https://xpirit.com/xpiriter/) needed a laptop to upload new GDBC images for it, so I helped him out with them:  
![Coffee first](/images/20190618/2019-06-18_09_WakingUp.jpg)  

We had 10 colleagues from Xpirit in the office to help during the day with receiving guests, proctoring the teams and running the venue in Hilversum. 

## 9:30 AM Started the day with attendees arriving
![Arriving attendees in Hilversum](/images/20190618/2019-06-18_10_Keynote.jpg)

## 10:00 AM Keynote started
We started the keynote in Hilversum! After a welcome note from René, Marcel and Mathias it was time to learn something about DevOps and SRE from [Niall Murphy](https://twitter.com/niallm), Director of Engineering for Azure Cloud Services and Site Reliability Engineering.  
![Keynote started](/images/20190618/2019-06-18_11_Keynote.jpg)  

We later found out his reaction about speaking in front of 10.000 attendees:  
![Response Niall Murphy: Wow.](/images/20190618/2019-06-18_15.png)

## We kept monitoring during the keynote:   
![](/images/20190618/2019-06-18_12.jpg)
##### Image courtesy by Jesse Houwing, find more [here](https://photos.google.com/share/AF1QipPseUvWsleanD5I5-CHhIOfy5XEUdW8qVwMTPtoUhJ9VDbBvfgzch1rKIqNhiQYBg?key=SlNkclJGTWo3MEVpcmNPb2E1SURhTXVzS01IZkFB)

## And during the rest of the day  
![](/images/20190618/2019-06-18_13.jpg)
##### Image courtesy by Jesse Houwing, find more [here](https://photos.google.com/share/AF1QipPseUvWsleanD5I5-CHhIOfy5XEUdW8qVwMTPtoUhJ9VDbBvfgzch1rKIqNhiQYBg?key=SlNkclJGTWo3MEVpcmNPb2E1SURhTXVzS01IZkFB)
![](/images/20190618/2019-06-18_14.jpg)
##### Image courtesy by Jesse Houwing, find more [here](https://photos.google.com/share/AF1QipPseUvWsleanD5I5-CHhIOfy5XEUdW8qVwMTPtoUhJ9VDbBvfgzch1rKIqNhiQYBg?key=SlNkclJGTWo3MEVpcmNPb2E1SURhTXVzS01IZkFB)

## Closing off in Hilversum with part of the team
At 4:00 PM we closed the venue in Hilversum and send our own attendees home.  
Some of us decided to stay at the office for a while and help the rest of the teams in the America's that where still busy with their day. We needed to stay around our laptops and decided to get some pizza delivered instead of going to a restaurant. After the pizza we all drove home to check our feeds from there.    
![Pizza time](/images/20190618/2019-06-18_28_PizzaTime.jpg)  

## 9:20 PM Closing off
I stayed online for a while at home until I could no longer. [Niels](https://xpirit.com/xpiriter/niels-nijveldt) volunteered to shut down the lights and man the fort until the last venue was done. My hero! After 7 hours asleep in 48 hours I really needed to get some sleep!!!  
![Closing off](/images/20190618/2019-06-18_29_LateNight.jpg)   