---
layout: post
title: "GitHub Copilot Extensions"
date: 2024-09-14
tags: [GitHub, GitHub Copilot, Extensions]
---

GitHub Copilot is a great tool to help you write code. The next phase is starting now by enabling you to write your own extensions for Copilot! This is a great way to extend the capabilities of Copilot to your own needs. You can for example look in your own knowledge store for inforation, or even call into an API to get the information you need. All from within GitHub Copilot Chat itself!

Some examples of this way of working with Copilot are:
- @workspace/@solution - this works inside of your IDE
- @github - this works with the GitHub API and you can ask questions like "get all issues for this repo" or "get all PRs for this repo"

Next to that we are seeing some extensions coming out. There are two types of extensions you can build at the moment;
1. VS Code extensions for Copilot: this is a way to extend the capabilities of Copilot in your IDE and it has access to information in your IDE, like the files you have open. Do note that this extension will only work in VS Code, and in none of the other supported IDE's for Copilot. An example of this type of extension is the `@azure` extension (see (announcement)[https://techcommunity.microsoft.com/t5/microsoft-developer-community/introducing-github-copilot-for-azure-your-cloud-coding-companion/ba-p/4127644]), that allows you to interact with an Azure knowledge base (currently in private preview).
2. GitHub Copilot Extensions: these live somewhere online (where ever you decide to host them) and can be called from within Copilot Chat in any UI that supports it (currently only VS Code and the GitHub web interface on github.com). 

## Writing a GitHub Copilot Extension

Get started to write your own Copilot extension by reading the announcement and the documentation.

insert link to the announcement blogpost

Currenly your GitHub Application needs to be flagged in to be able to use the extension. This is a manual process and you can request access with the information in the announcement.

After creating the GitHub App and being flagged in, you need to configure the App with a public endpoint that will be called by Copilot. This endpoint should be able to handle the requests from Copilot and return the results in the correct format. The easies way to get started is to create a Codespace and use the Codespace URL when you run your solution as the endpoint for your extension:

![Screenshot of the Codespace URL GitHub App](/images/2024/20240914/app settings.png)
The url in the screenshot is the same as the one I am using in the 'Callback URL' setting on the `General` tab of the GitHub App settings.

There are a lot of code examples in the [copilot-extensions](https://github.com/copilot-extensions) organization, like the following:
- Blackbeard extension (talk like a pirate)
- rag extension (impletent 'retrieval augmented generation' to build up your response in several steps)
- function calling extension (retrieve a function from the user prompt, like "what is the weather in Amsterdam")
- GitHub Models extension (use the new models API's to talk to an LLM)
These are fine to spelunk in, but as soon as you want to do something else then adding a system prompt and stream back the LLM response, you will find some very rough edges.

Instead I recommend to go straight for the [Copilot Extension SDK](https://github.com/copilot-extensions/preview-sdk.js) library. At the time of writing this SDK in in early alpha stage, but it solves several issues that you will run into when you start building your own extension. I've been adding some examples to that repository to help you get started.

### Writing the extension code
Using the examples in the SDK repo should get you started. The main things you need are in the `README.md` in the `examples` folder. Run the `npm install` and `npm run watch` commands to get the examples running. Don't forget to make your Codespace port public (so that Copilot can send its messages to it), and to configure the Codespace port URL in the GitHub App settings.

You need to handle a `POST` event into your application, and then return text and a `createDoneEvent` to indicate your response is complete.

If you want to, you can create a `createAckEvent` that will tell Copilot you have received the request and are working on it. It will display that status to the user and is a nice way to let the user know you are working on their request.

After the `acknowledge` event, you can add `createTextEvent("your text here")` to add custom text to the output. What you do next is up to you. There are several options already supported in the SDK:

- Call the GitHub Copilot API with the user prompt and get the response back (limited model options)
- Call into an API you have access to
- Ask the user to confirm something (example later in this post)
- Call into GitHub Models to get a response from an LLM with more model options

## Running the extension server side in a Codespace

screenshot here

## Working with the extension
![Screenshot of invoking the extension by calling @xebia with your prompt. It shows the result of the prompt that indicates it has been written with the 'talk like a pirate' system prompt](/images/2024/20240914/01-Invoking-the-extension.png)