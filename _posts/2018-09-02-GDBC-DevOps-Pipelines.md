---
layout: post
title: "GDBC DevOps pipelines in VSTS"
date: 2018-09-02
---

## Global DevOps BootCamp
In June 2018 I was part of the team behind [Global DevOps BootCamp](https://www.globaldevopsbootcamp.com/) (or GDBC in short). The goal of the boot camp is to create a world wide event where everyone could get a taste of DevOps on the Microsoft Stack. It is an amazing combination between getting your hands dirty and sharing experience and knowledge around VSTS, Azure, DevOps with other community members. This years edition was great, with 75 registered venues worldwide and 8.000 registered attendees! The feedback we've got was wonderful: a true community event where everybody was asking for more!

![](/images/2018/20180902/2018_08_31_Unsplash.jpg)
#### Photo by [rawpixel on Unsplash](https://unsplash.com/)

## Challenges
During the GDBC participants could try to complete 60+ challenges that the GDBC team had created. Those challenges where created by a team of more than 15 people (global organizers and venue organizers helped out), so they had quite a lot of changes during the preparation period. If you want to see and dive into the challenges, you can! The challenges have been open sourced for the community and can be found here: [GitHub/XpiritBV/GDBC2018-Challenges](https://github.com/XpiritBV/GDBC2018-Challenges).
  
The challenges would be created as work items inside a VSTS team, where participants would be assigned to, so they could collaborate on the challenges there. By dragging the work items to the "done" column, they'd indicated that they finished the challenge and received points for it, which they could follow on a leaderboard (more info in this [post](/blog/2018/06/16/GDBC-DevOps-on-the-Leaderboard).  

## Pipelines for the Challenges
Early on, it was decided to save all the challenges in a git repository in VSTS, practicing what we wanted the participants to use (and because we are nerds!).
The challenge definitions where saved as markdown files, with a yaml header to indicate if the challenge was a bonus challenge, if the challenge had additional help available and other properties. In 2017, the team only found out issues with the templates when the organizers ran their scripts to create the actual work items in VSTS.

To help the team with this, I started setting up a build and release pipeline in VSTS. Since there were a lot of moving parts with a complete team helping out, it would be helpful to run several checks during the changes to make sure all challenges where setup correctly.  

Eventually I even created another pipeline to push the changes into a VSTS team, so the challenge maintainers could see the end result as soon as possible. All tThis really helped fixing issues quickly.  

## Pipeline on push
We had a tool available to convert the markdown, read the yaml headers,  parse all links and images in the markdown and eventually create work items from that. After adding additional checks to it, it could be used to check the challenges for completeness.
The tool, some PowerShell scripts, the challenges all had there own git repositories, so we could plug them in their own build pipelines: The tool was .NET core, the challenges would be published as artifacts and the same for the PowerShell scripts. You can see them linked as dependencies in the screenshot below.
![Check challenges from PR](/images/2018/20180902/2018_08_31_Release.png)  
In the environment was just one task: run the checks from the .NET core tooling:
![PR Detail](/images/2018/20180902/2018_08_31_ReleasePR_Detail.png)  
The trigger for this was a pull request (PR) being created for the challenges repository, so the person creating the PR would get an email indicating the level of correctness of the challenges.


## Pipeline to production
After the pull request was checked by the pipeline described above, then merged into master, the second pipeline would be triggered. This time a couple more steps where involved.  

The artifacts where the same:   
![Release to production](/images/2018/20180902/2018_08_31_ReleasePipeline.png)  

The tasks where as follows:  

![Provision stories](/images/2018/20180902/2018_08_31_ReleasePipelineDetails.png)   

1. Convert the markdown file to json  
This is the same tool that does perform the checks and saves a json for easy formatting.
1. Zip up the help directories  
The help needs to be a link to a single file that the participants could request and open when they needed it.
1. Save the zip files into a DropBox share and get unique links for them.
The unique link couldn't be guessed, to prevent anyone from cheating.   
1. Update the database for the scoreboard, with the correct points and help links for the challenges.
1. Clear the test team's sprint from previous versions of the work items.
1. Create new work items based on the new challenge content.

After this pipeline completed, the whole team could check the end result inside of VSTS, by checking the setup for the test team.  

![](/images/2018/20180902/2018_08_31_TestTeamWorkItems.png)

These pipelines helped the team find issues early on, so we could make sure the quality would be where we wanted it to be.

Hopefully this post gives you more insights into some of the work we did to help a team out. If there are parts of this pipeline that you'd want more detail of, please let me know.