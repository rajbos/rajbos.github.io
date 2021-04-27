---
layout: post
title: "GitHub and Azure DevOps: best of both worlds"
date: 2021-04-23
---

Ever since Microsoft acquired GitHub we have been looking at how this will play out in the long run with their Azure DevOps offering. We've seen a lot of people move from the Azure DevOps team to GitHub by looking at their LinkedIn or other social network updates, so it only makes sense to wonder about the future. We know that several **very large** teams inside Microsoft are using Azure DevOps, together with some really large customers, which means Azure DevOps will stick around for a long time and will still receive regular updates to its functionality. Azure DevOps has a very strong offering, from 'everything in one suite' to mix and match with third party tools, to a good hosting model (data sovereignty is a big thing for us Europeans) and excellent Azure support with even integrated billing on the marketplace. 

GitHub on the other hand is the largest dev-community in the world, with some [56 million plus](https://octoverse.github.com/) developers on it. If you want to entice developers to work at your company, doing so with the tools they already know and love is an excellent selling point. GitHub is made by developers, for developers. This also gives them a lot of information from open source communities into their activity, languages used and even a great host of information they can pull from the open source code stored on the platform. Their now even hosting [security advisories](https://github.blog/changelog/2019-05-23-maintainer-security-advisories/) and enable scanning for vulnerability patterns in your codebase with [CodeQL](https://github.blog/2021-03-16-using-github-code-scanning-and-codeql-to-detect-traces-of-solorigate-and-other-backdoors/). 

# Exploring best of both worlds
In this post I wanted to share what are the strengths of both offerings and explain what parts I'd use of each of them and why. In my opinion both products have some unique features that the other doesn't have (yet), so using the right tool for the right job is only logical from that.

I've split things up in the following sections:
* Source control
* Work tracking
* Pipelines
* Artifacts
* Security features

# Source control
In the basis, source control on both platforms is very similar: Azure DevOps still has [TFVC support](https://docs.microsoft.com/en-us/azure/devops/repos/tfvc/what-is-tfvc?view=azure-devops&WT.mc_id=DOP-MVP-5003719), but I really don't recommend using that at all: Git is the standard these days and for good reasons (that I'll skip over for this post 😁).  
Both platforms have branch tracking and protection system, a good CLI to work with, so choosing what to use here is comes down to the extra features on top of the basics. That is where GitHub has the better options in my opinion because it offers these features:
* GPG commit signing
* [Branch protection rules](https://docs.github.com/en/github/administering-a-repository/managing-a-branch-protection-rule) with GPG commit signing
* Out of the box security features like code scanning

## GPG Commit signing
Commit signing is an extra layer of security on top of basic authentication. Without using commit signing it is rather easy to make some code changes for you, commit them locally to the repository and then push them upstream. I've automated parts of this lots of times know, so I know how easy it is to create. Running the software on you machine, scanning the repos and adding some malicious stuff to your projects is rather easy and you would not even know that it was happening right under your nose 😄. What's even worse, I could even run this on my own machine and push in code changes with **your** email address and user name attached to it. The configuration in Git is just meta data that is not verified anywhere in the chain: GitHub only checks if the user pushing the changes has write access to the repository and then lets the changes in. This is of course the standard for all source control systems using Git.

With [commit signing](https://www.gnupg.org/gph/en/manual/x110.html), you need to sign the commit with your private key that only you should have. By default, that key can only be used together with a passphrase (you can create it without a passphrase, but that would defeat its purpose). Adding the passphrase means that when you sign the commit, you have to type in the passphrase. There is no way to automatically fill in the passphrase for you (that I know of). This also means you cannot sign the commits automatically, which means someone cannot spoof your signage on your behalf.

The server side (GitHub in this case) will store the public part of your GPG key that they use to verify the signed commits: those are made by users with GPG signatures AND those signatures have been verified with their accompanying public key. This enables you to lock down the repository or specific branches in the repository to only allow verified commits.  
![Screenshot of GitHub.com showing a verified commit](/images/20210423/20210423_VerifiedCommit.png). 

## Security features



# Work tracking

# Pipelines

# Artifacts

# Security features