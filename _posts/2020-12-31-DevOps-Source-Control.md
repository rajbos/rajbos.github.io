---
layout: post
title: "DevOps Maturity Levels - Source control"
date: 2020-12-31
---

One of the first things to get in order when improving your [DevOps way of working](/blog/2020/12/31/DevOps-Maturity-Levels) is having proper version control of your source code. Source code in this case means anything: from application source code that you can build and deploy, to scripts you use to do the deployment. In my opinion: anything around your team that can be saved as text, should end up in source control. 

![Displaying the different States of Enlightenment](/images/20201231/20201231_01_StatesOfEnlightenment.png)

# Source Control in order
I still come across teams that don't have any source control for some parts of their tools, or have ancient systems that don't have support anymore. Or even worse: things live on a specific server, stuffed away beneath someone's desk 😱. If that 'server' fails, everything could be gone. If a copy is stored on someone else's machine, then maybe getting things back in working order is 'just' a few days of diligent work. 

At a previous company something like this happened on Christmas Eve and I was very lucky to only find out about this *after* the holiday period, since someone else had taken up the chore to get a new server (a remarkable feat around the holidays!) AND restore everything back to working order for everyone in the new year. 

## Git: distributed version control
For source control you can pick any tool you like, I'd only recommend it to be Git based and skip the other ones (like SVN, TFVC). Git is the de-facto standard these days: investing in learning it will give you a solid base that can be reused across different organizations. 

One of the reasons Git has become the standard is that it is distributed version control: this means everyone that is using it, has the entire code history on their system (up until the last time they loaded the last changes): you get a local copy to work with. So in the case something happens with the system you labeled 'server': all developers will have a local copy as well. Getting back to a working environment can then be super easy. 

Common offerings for Git (that I have worked with) are GitHub / GitLab / Azure DevOps. Each of these has on premises offerings (meaning you install them in your own network) or hosted versions where the hosting is handled for you. I'd recommend getting a hosted version when using it in production, since those companies can host it a lot better then you can yourself 😁. 

## Git: Getting started
Looking around online gives you a lot of options to get started with Git. You can find the tools and documentations on the [Git Source Control Management](https://git-scm.com/) website where they even host introduction video's to get you [started](https://git-scm.com/video/what-is-version-control) or use GitHub's [training](https://try.github.io/) environment to get started with a hosted solution for free (as long as your code is made available publicly). 

After getting to know how you can work with Git and push changes to a central location, do make sure your team knows about using branches and start using [feature branches](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) to work in isolation. 

Want to know more? Reach out to me with any question you have.