---
layout: post
title: "Making the case for GitHub's Secret scanning"
date: 2023-01-22
tags: [GitHub, GitHub Actions, Secrets, Secret scanning, Security, GitHub Advanced Security, Advanced Security, DevSecOps]
---

After scanning the GitHub Actions Marketplace for the security of those actions (read that post [here](/blog/2022/09/18/Analysing-the-GitHub-marketplace)) I was curious to see what happens if I'd enable [Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) on the forked repositories. I regularly teach classes on using GitHub Advanced Security (where secret scanning is part of) and I always tell my students that they should enable secret scanning on their repositories. I even have a [course on LinkedIn Learning about GitHub Advanced Security](https://www.linkedin.com/learning/github-advanced-security/github-advanced-security?autoplay=true) in case you want to learn more about it.

## What is GitHub Secret Scanning?
[Secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) is part of the GitHub Advanced Security offering if you have a GitHub Enterprise account, but for public repos it is free to use (and enabled by default). GitHub scans the repository (full history) and issues and pull requests contents to see if it detects a secret. The detection happens based on a set of regular expressions shared by GitHub's secret scanning partners (over 100 and counting). If a secret is detected, GitHub will notify the repository owner as well as the secret scanning partner. Depending on the context (public repo or not for example), the secret scanning partner can decide to revoke the secret immediately, which I think most partners do.

This functionality is so good and fast, that I routinely post my GitHub Personal Access Tokens to GitHub issues during my trainings, to show the power of secret scanning. Usually I already have an email and a revoked token before I finish explaining what is happening in the background.

![Photo of a woman holding her index finger to her mouth in a 'sst' manner](/images/2023/20230122/kristina-flour-BcjdbyKWquw-unsplash.jpg)  
#### Photo by <a href="https://unsplash.com/@tinaflour?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kristina Flour</a> on <a href="https://unsplash.com/photos/BcjdbyKWquw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>.  
  

## Analyzing the actions repositories.
In my GitHub Actions marketplace scan, I have the repositories of 14k actions forked into an organization, so I can enable secret scanning and see what I get back from secret scanning. Since all Action repositories on the marketplace are public, any secret that is found has been found before, so I expect all these secrets to already have been revoked before.

Overall results: Found [1353] secrets for the organization in [1110] repositories (out of 13954 repos scanned). Here is a top 15 of most found secrets to see what is being found:  

## Secret scanning alerts

|Alert type|Count:|
|---|---|
|GitHub App Installation Access Token | 692 |
|Azure Storage Account Access Key | 155 |
|GitHub Personal Access Token | 120 |
|Amazon AWS Secret Access Key | 50 |
|Plivo Auth ID | 40 |
|Amazon AWS Access Key ID | 40 |
|Google API Key | 34 |
|Slack API Token | 31 |
|Slack Incoming Webhook URL | 27 |
|Atlassian API Token | 22 |
|Plivo Auth Token | 16 |
|GitHub SSH Private Key | 12 |
|Amazon AWS Session Token | 12 |
|HashiCorp Vault Service Token | 11 |
|PyPI API Token | 10 |

With all the news recently about credential leaking and malicious actors using these secrets to do bad things, I think it is very important to enable secret scanning on your repositories! Having this data really shows the power of GitHub and its secret scanning partners.

## Analyzing the results
I wanted to get these results to get a feel for the amount of things secret scanning would find. I my opinion, the maintainers of these actions have a high level of understanding Git and GitHub, so you'd expect a relative low number of secrets being found. Still, 1110 repositories out of 13954 repos is 7.9% off all repos where secrets have been found. This shows how easy it is to accidentally commit secrets to a repository. Even in my own repos, a secret was found (a GitHub Personal Access Token even) that I accidentally committed in an environment file! And that while I teach people on these things! 

I think this is a good number to show to my students and customers to make the case for enabling secret scanning on their repositories. Even folks with a high level of understanding, will still make mistakes and [secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) will help by finding them for you, every time you make a change to your repository.