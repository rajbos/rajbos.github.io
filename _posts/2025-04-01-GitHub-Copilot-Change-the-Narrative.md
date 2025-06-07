---
layout: post
title: GitHub Copilot - Change the Narrative
date: 2025-04-01
tags: [GitHub, GitHub Copilot, Generative AI]
---


TL;DR: 
1. Changing the narrative on GitHub Copilot from focus on engineers and productivity to focus on a sturdy (DevOps) foundation to be able to go faster.
2. Next frontier: the rest of our organization 

# Premise: current narrative is not helping
In my opinion we need to shift the narrative on enabling engineers to use GitHub Copilot. Currently there is a lot of focus on the engineers that can produce code easier and faster using GitHub Copilot. That leads to companies thinking they finally found a way to create 10x engineers. And even engineers are hyping this up with stories around “vibe coding” with AI: they jump on their keyboards with a prompt and accept every suggestion that is there and then run the application to figure out if their initial problem was solved or not. Eventually this path leads to disappointment: either the code does not work as hoped, or there was crucial information missing and the AI took a wrong turn somewhere. Even worse: we have seen Generative AI following the “scouting rule” where it starts to clean up after itself, changing code that did not need to be changed at all! This can lead to impact in other places in the codebase that can introduce new bugs. Even worse with all the "vibe coding" stories, we see engineers that are not even testing their code before pushing it to production. This is a recipe for disaster and will lead to a lot of frustration and disappointment in the long run.

![Picture of a confused engineer scratching their head surrounded with question marks](/images/2025/20250401/20250607-Confusion.png)  

We also tend to focus on the wrong metrics to see if the use of GitHub Copilot has an impact. I explained more in my follow up blogpost [GitHub Copilot & Productivity](/blog/2025/06/07/Copilot-and-productivity) on this topic. Focusing just on productivity is not the right way to go in my opinion. Let alone that we are not able to define what that even is.

# Better narrative: focus on having a sturdy (DevOps) foundation 

![Picture of a sturdy DevOps foundation to support the engineer](/images/2025/20250401/20250401-DevOpsFoundation.png)  

Instead I recommend to focus on enabling engineers to work on laying the **foundation** to be able to roll out their applications faster and with more **trust** that their application works as intended. I’ve always been a DevOps person and I firmly believe in having the basic principles in place: 
- Automated pipelines and testing
- Everything as code or configuration
- More eyes principle in place
- Enough testing in place to have trust
If a deployment fails for any reason, a new test should be added to the pipeline to prevent it from happening again. 
- Continuous monitoring and feedback loops

Only when a large portion of these fundamentals are in place, can a team of engineers roll out their changes faster, as for example the testing is in place to be able to rely on their deployments. Note that this can be achieved in multiple ways, for example with unit, regression, or integration testing. Use what works for your application. 

Generative AI like GitHub Copilot can help to put these foundations in place and works really well for those kind of supporting system. I see a lot of users only focus on coding with Copilot, not knowing it can do so much more: I’ve created all sorts of scripts, pipelines, and even Splunk queries with Copilot and it works really well if you understand how to prompt for the right things. 

I see GitHub Copilot as an enabler to give teams the time to get their foundation in order. Since the normal tasks are sped up, the extra time can be spent on initiatives to improve the things that often get pushed to the bottom of the backlog, or at least pushed out of the sprint. I recommend teams always embed these types of technical debt and either include it in their way of working, or specially carve out time in every sprint to improve it. I’ve seen successful teams always having a focus on 10% of their time on technical debt fixing as part of their sprint. 

With the foundation in place teams can actually deliver value faster, with increased trust, and with fewer issues in production. 

# Next level of enlightenment: team efforts

![Image of adding value to the end user](/images/2025/20250401/20250401-Value.png)  

After that we can actually start to think at the other things our teams do. On average an engineer is already lucky if they can focus on writing some code for a period of around two hours a day: [ActiveState's 2019 Developer Survey](https://www.activestate.com/wp-content/uploads/2019/05/ActiveState-Developer-Survey-2019-Open-Source-Runtime-Pains.pdf). The rest of the time is spend on preparations, discussions, architectural work, documentation, etc. And then there are always teams that spend most of their day in meetings, sometimes even overlapping and in parallel during their day. It’s always amazing to see how some organizations have made meeting more important then actual creative work like coding!

The next shift that I see happening is to the way work flows to engineers. We’re constantly busy with describing the changes we want to make to the application, and have to translate user requests into actionable descriptions. From that we need to make sure all team members understand these changes as well as the impact on the application. Teams are working with different stakeholders and perhaps a product owner that funnels the work to the team. 

In my opinion we now need to focus on enabling roles like product owners to send in better scoped work. Then review the incoming work descriptions by an engineer that has expertise on the application to add the finishing touches. 

When the incoming work has enough clarity AI can be used to suggest the changes translated into code changes. The next iteration of tools like GitHub Copilot has already been announced with project Padawan (blogpost [here](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/)), where Copilot can try to suggest the changes on its own, rerun all the tests in the pipeline, and reiterate if needed. When the tests succeed and the changes have been implemented, it will submit a pull request for final review. 

# Conclusion
There will always be work for highly skilled engineers, and yes, I think they will become more of an orchestrator in the future of AI agents that can produce large parts of the work. The engineers will be in charge making sure there is enough trust in the system to proceed with the next steps. It is crucial to then have a good way in place to train new engineers to be proficient in the tools and processes that are in place and understand the impact that changes will have onto the applications they work on. Ignoring to train new engineers will lead to a lot more (downstream) issues and frustration by both the engineers and their stakeholders. Embracing the new way of working will lead to a more efficient way of working, and ultimately to a better experience for the end users of the applications we build.