---
layout: post
title: "Create a GitHub App from a manifest"
date: 2021-12-27
tags: [GitHub, GitHub App, Manifest]
---

At my customer we have the need to create a lot of GitHub Apps. In this specific case we use [GitHub Apps](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app) as an integration point between GitHub and Jenkins: the code is moving to GitHub, and we still want to trigger our existing Jenkins jobs on code changes. We have over a 100 teams in Jenkins, all with their own pipelines. We have a security requirement that teams that connect to their code in a Jenkins pipeline only can see their own code, and not the repos from other teams. That means that each team has to have its own GitHub credential set up for them.

![Image of a LEGO figurine dressed in a space suite with a happy expression](/images/20211227/hello-i-m-nik-kLq9cLl5vbs-unsplash.jpg)
###### Photo by <a href="https://unsplash.com/@helloimnik?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Hello I'm Nik</a> on <a href="https://unsplash.com/collections/3589562/robot-like-figures?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  

I consider it a [bad practice](/blog/2022/01/03/GitHub-Tokens) to use Personal Access Tokens (they have way to much scope, which should improve [in the future](https://github.com/github/roadmap/issues/184)). Instead we use a GitHub App: we can create and install the GitHub App the organization level and give it access to certain repositories. This way we can use the GitHub App to trigger our Jenkins jobs and give it only access to the repositories it need access to.

At the moment there are no API's in GitHub to handle this situation for you: you have to create the App manually, get the credentials and install it in the organization for the repositories that you need the App to have access to. Creating the App has quite a few steps, like setting up a name and a description, adding webhook to trigger, configuring all the permissions you need and the events that belong to those permissions.

Given that we have a lot of teams, this is a repeating task and prone to errors when you follow the internal documentation for setting this up. To improve this, we have created a [manifest](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app-from-a-manifest) that we can use to create the App. 
##### Note: you can also do the same with a request with [request parameters](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app-using-url-parameters).

## Flow
With a manifest, we can use a flow in an internal webapplication that will create the App with all the default settings, get the credentials and store the credentials somewhere safe. Since this flow requires a user to be logged in, we need to give them a webpage that set things up (the manifest) and then redirect to the page on our GitHub environment (Can be Enterprise Cloud or Enterprise Server), that will do the authentication and authorization to check if the user has the rights to setup the App. Unfortunately that is also as far as we can go, since there are no API's to install the App into repositories.

![Overview of the steps in the creation flow](/images/20211227/20211227_Flow.png)  

In the overview above we can see that there are six steps to create the App with a manifest:
1. Send the user to our index page where we setup the manifest (we let them pick the environment this app needs to be created in) and redirect to the GitHub App creation page with the manifest.
1. GitHub handles the authentication and authorization.
1. Redirects the user back to our redirect page (you pass this in with the manifest).
1. Our redirect page loads a specific code from the redirect (this code is only valid for 1 hour).
1. And posts that code back to GitHub to get the App information it just created.
1. We store the AppId and the private key (PEM) for the App somewhere safe, so we can continue with the next steps.

Example files for this flow can be found [here](https://github.com/rajbos/create-github-app-from-manifest). You need to host them on your own server, but redirecting to localhost works just fine. (next step for us will be hosting that in a NodeJS app that can run either locally or be hosted in a Docker container). It also includes a [5 minute video](https://www.youtube.com/watch?v=PAR22TjG6Wg) that explains the whole flow.

## Next steps:
Setting up the manifest is straightforward, but only part of the setup we need. To be able to configure this on the client side (in this case Jenkins), we need to go through the following steps:

* Install the new App in the repositories it needs to have access to (you give it access to those repos from the org level).
* Add then new set of Credentials (AppId + private key) in Jenkins at the correct folder / team level

## Future work:
Following DevOps best practices, we want to setup key rotation for the app's as well. To do this there are also no API's available at the moment, and when you generate a new private key, the old one is revoked immediately 😒.