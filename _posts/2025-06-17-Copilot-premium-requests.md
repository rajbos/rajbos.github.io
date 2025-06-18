---
layout: post
title: GitHub Copilot Premium Requests
date: 2025-06-17
tags: [GitHub, GitHub Copilot, Generative AI]
---

Some important changes are happening, which means you will need to start paying for the amount of Generative AI you use with GitHub Copilot. This will finally make the end-user think about the monetary cost of executing a request with a Large Language Model, so they realize this stuff is not running for free. In that sense we have been spoiled, so it is time to take up some ownership here for the end-users. This post will give you an overview of what you need to expect and how you can protect yourself from overspending.

# What is Premium Requests for GitHub Copilot ?
Tomorrow the 18th is the date GitHub Copilot [Premium Requests](https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests) will be enforced (see the docs [here](https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests)).

![Screenshot of the different multipliers per model](/images/2025/20250617/20250617_Multipliers.png)

This post gives you an overview to know what you need to expect. Copilot Premium Requests are any request that is made to any model that is not the default (currently GPT-4o and GPT-4.1). Some features against a model will cost 1 Premium Request, some will cost more then 1 Premium Request (using GPT-4.5 will be x50!) and some are less expensive (Gemini 2.0 Flash is the cheapest at 0.25x).

I previously recorded a video on Premium Requests as well, find it [here](https://github-copilot.xebia.ms/detail?videoId=43) if you prefer to learn things that way:  
[![Screenshot of the GitHub Copilot Premium Requests documentation](/images/2025/20250617/20250617_Video.png)](https://github-copilot.xebia.ms/detail?videoId=43)

# What is a premium request
Here is an overview of the main features that will consume a premium request:
- Chatting with a non default model: 1 premium request per 'turn' (every question and answer is a turn)
- Every step in the Coding Agent: 1 premium request. The agent can decide to make multiple steps, and will thus consume a premium request for each step. Note: I hope that the agent will also come with a "max requests" setting, so that you can limit the amount of requests it can make in a single conversation and prevent it from overspending.
- Requesting a Code Review in a Pull Request: 1 premium request
- Agent Mode in an editor: 1 premium request per user initiated request

## Free plan
If you are on a Free plan, even the base model will consume a premium request if you are using the Chat feature. 

## Paid plans
If you are on a paid plan, then you will get a certain amount of premium requests per month. If you go over this amount, you will be charged for the extra requests at $0.04 per premium request. If that request is against a 50x model, then you will be charged $2.00 for that single request! To view the full overview of the different multipliers, see the [documentation](https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests).

This is the table of the different amount of included premium requests per plan:

| Plan                | Premium requests                | Copilot Chat in IDEs            | Code completion                  |
|---------------------|---------------------------------|----------------------------------|----------------------------------|
| Copilot Free        | 50 per month                    | 50 messages per month            | 2000 completions per month       |
| Copilot Pro         | 300 per month                   | Unlimited with base model        | Unlimited                         |
| Copilot Pro+        | 1500 per month                  | Unlimited with base model        | Unlimited                         |
| Copilot Business    | 300 per user per month          | Unlimited with base model        | Unlimited                         |
| Copilot Enterprise  | 1000 per user per month         | Unlimited with base model        | Unlimited                         |

To protect yourself or your users, you can configure a [budget](https://docs.github.com/en/billing/managing-your-billing/preventing-overspending) for premium requests in your user/organization settings. The default is $0.00, but you can set it to any amount you want. If you reach this budget, then all premium requests will be blocked until the next month.

![](/images/2025/20250617/20250618_CopilotBudget.png)

This is now finally available inside of the new Coding Agent session panel as well: 
![Screenshot showing that coding agent ran for 14 minutes and consumed 54 premium request](/images/2025/20250617/20250618_CodingAgent.png)  

# Finding your own usage info as a User
The changes that where made where showing the multipliers to the different models to the users so they can make decisions on which model to use:  
![Screenshot of the different multipliers per model](/images/2025/20250617/20250618_CopilotModelSelection.png)  
This is now visible for at least Visual Studio Code, Jetbrains IDE's, and Visual Studio.
These editors also show the setup for your account:  
![Screenshot of the setup for your account in Visual Studio Code](/images/2025/20250617/20250618_CopilotOverview.png)  
If you look closely, you can even see the progress bar in the middle of the screen showing that I have been using some Premium Requests already. Visual Studio shows it in a slightly different way by using the GitHub Copilot icon in the top right corner:
![Screenshot of the amount of premium requests used in Visual Studio](/images/2025/20250617/20250618_VisualStudioUsed.png)  

To find your own usage information, you can go to your [User --> Settings --> Billing](https://github.com/settings/billing) and then get an overview like this:  

![Screenshot of user usage information showing the cost of your Copilot and Premium Requests usage in the current period](/images/2025/20250617/20250618_UserUsage.png)  

# Analyzing the GitHub Copilot Premium Requests report in your organization / enterprise
Do you need to analyze the GitHub Copilot Premium requests CSV now that they will be enforced? I created a single page application (SPA) with GitHub Spark and GitHub Copilot Coding Agent to display an overview of the Premium Requests CSV that you can currently download (no API yet 😓). 
 
- Can be hosted on GitHub Pages:  GitHub Copilot Premium Requests Usage Analyzer
- Upload the CSV from the enterprise export (Billing and Licenses --> Usage --> Export dropdown right top)
Result can be seen here: 

![Screenshot of top bar information](/images/2025/20250617/20250617_01.png)  

![Screenshot of usage statistics over time](/images/2025/20250617/20250617_02.png)  

![Screenshot of model usage in bars](/images/2025/20250617/20250617_03.png)  

See the repo in action here (click on the link on the right side to use your own data): [https://github.com/devops-actions/github-copilot-premium-reqs-usage](https://github.com/devops-actions/github-copilot-premium-reqs-usage). It's open source, so feel free to contribute or request features!