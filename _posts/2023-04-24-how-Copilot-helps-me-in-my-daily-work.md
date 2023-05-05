---
layout: post
title: "How Copilot/AI helps me in my daily work"
date: 2023-04-24
tags: [GitHub, Copilot, AI, Generative AI, Code Generation]
---

During an innovation day at work, I needed to generate extra code and a new application. I wanted to check out the newly released [Deployment Protection Rules](https://github.blog/2023-04-20-announcing-github-actions-deployment-protection-rules-now-in-public-beta/) that can help you with protecting when a job in GitHub Actions can roll out your application to an environment.

Deployment protection rules need a new GitHub App that can be triggered when an environment is targeted. That App can then run its own checks and report back the status to GitHub with a callback webhook. 

To get started I needed a new GitHub App that can receive the webhook from GitHub. Since I already have an [Azure Function App](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview?WT.mc_id=AZ-MVP-5003719) up and running, I thought to add another HttpTrigger function to it, so I could log the payload and learn from that (the payload is not documented yet).

![AI generated code with the prompt](/images/2023/20230421/craiyon_generating_code.png)  
###### Image generated with [Craiyon.ai](https://www.craiyon.com/) using the following prompt: `sketched photo with some realism of an AI generating code`.  

# Usual flow
Normally I would start with searching for the things I need: some documentation for hosting an endpoint to receive the webhook payload, search for creating an app to handle the user login, etc. This can easily take days tinkering around to get things to where it is good enough for a POC. Instead, I used AI tools to help me, and had things up and running in a few hours.

# Step 1: Create a new Azure Function
I knew I needed an HttpTrigger and was about to search for it's declaration, when I remembered I was already testing out GitHub Copilot for Chat, which is in [technical preview](https://github.com/features/preview/copilot-x) so I cannot say to much about it. I asked Copilot to write the function definition for me and sure it enough: it proposed the right code, including logging of the incoming payload. Using that code I could publish the function and configure it as a webhook from a new GitHub App.

![Screenshot of the Azure function log, showing the deployment_callback_url](/images/2023/20230421/20230424_FunctionLog.png)  
The logs show that payload sends in the normal information you would expect, like the context for the trigger (in this case `workflow_dispatch` was triggered by my user account) and the callback URL that can be used to report back the status of the check. The callback has the following form: `https://api.github.com/repos/{OWNER}/{REPO}/actions/runs/{RUNID}/deployment_protection_rule`.

That means it uses a well defined url, so I can just call that as the GitHub App for testing to see if it works. I've configured the Deployment Protection Rule with my new GitHub App based on an existing workflow (Copilot still helped here left and right), and tested it in a workflow to call the callback url.

# Step 2: Create a new node.js app for user configuration
An important part for my setup with the GitHub App will be to have the user configure settings for their environment. So that means I need to have a way to host an app that can do the OAuth flow with GitHub and store the settings in a database. 

I'm not a JavaScript developer who knows exactly how to get started, but I do have AI tools that can help me with that. The easiest option I have and that is free to use, is the [Bing integration in Edge](https://www.bing.com/new). Here is my prompt: `How can I get started with a simple webapplication based on node that uses GitHub authentication for the user to login and then retrieve information as that user`:
![Screenshot of the prompt and the result](/images/2023/20230421/20230421_01_prompt.jpg)  

Here is a part of the resulting app:  
![Screenshot of the npm code](/images/2023/20230421/20230421_04_app-definition.png)

It even had the steps in there to store the configuration settings from the GitHub App in the .env file. I could just copy that example and add the code to the app. 

![Screenshot of the .env setup and the login using the 'passport' library](/images/2023/20230421/20230421_02_prompt.png)  

There was an error running the app locally, but I could just copy the error message and search for it following the same conversation on Bing. The first result was the right answer, so I could just copy that again (`npm install express-session`) and add it to the app.

![Example of the error](/images/2023/20230421/20230421_03_error.png)  

You can see the working redirect for the user authentication below:
![Screenshot showing the authorization of the app using GitHub login for my user and App against my localhost:3000 app.](/images/2023/20230421/20230421_05_login.png)  

## Generated code
The generated was not perfect: it picked up some things from the code it was trained on that can be improved. GitHub Copilot should prevent this kind of security issues when generating code, but I used Bing's AI to generate this part of the code.

This proves the point that even when using AI to help you generate code, setting up security pipelines is still very important. Luckily GitHub has made Advanced Security features available for free for public repos, allowing me to scan the code using CodeQL:

![Screenshot displaying a CodeQL alert on the cookie for the user being send back to the server in plain text](/images/2023/20230421/20230424_CodeQL_results.png)  

If you want to learn more about GitHub Advanced Security, then check out my LinkedIn Learning Course on it: [LinkedIn Learning](/blog/2022/10/19/LinkedIn-Learning-GHAS).

I could then use the generated code to get started, and improve it to make it more secure using the security tools available as well. 

# Conclusion
And with that, most of my setup (the new Azure Function and the new node.js app) was done with me writing minimal amount of code, and still getting everything to work as I wanted. 

Do be aware that I have enough experience with these topics to both know what to look for, and how to spot / find / debug errors in my code. I'm sure that if I was a beginner, I would have had a lot more questions and would have needed to do a lot more research to get to the same result.

I'm really excited to see what the future holds for Copilot and AI in general. I'm sure it will help me and many others to get more done in less time.
