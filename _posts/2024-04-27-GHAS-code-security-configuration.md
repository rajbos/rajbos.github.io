---
layout: post
title: GHAS Code Security Configuration
date: 2024-04-27
tags: [GitHub Advanced Security, GHAS, Code Security, Configuration]
---

GitHub Advanced security has gotten quite a big update in public beta at the moment that helps with the rollout of Advanced Security features across your organization. It is called "Code security configurations" and it allows you to set up a default configuration for some or all repositories in your organization.

![Image of an unlocked door in an enchanted forest. Generated with Microsoft Copilot Designer](/images/2024/20240427/20240427_HeroImage.png)  

# Previous situation
Up to now there where only three options during the rollout:  

1. Enable features for new repos only (organization level setting).
2. Enable GHAS for ALL repos in one go (rather intrusive and needs extensive training up front of all developers).
3. Enable features on a per repo basis (slower and fits a team-by-team onboarding plan) .

So this means either going slow(er) on a team-by-team basis or going fast and enabling everything at once. That last one is not really an option in my opinion, unless you want to alienate a lot of engineers from the security process. I always recommend giving people training and discuss the expectations that you have of what they will need to do / change when you enable Advanced Security. Features like Secret Scanning with Push Protection are of course low hanging fruit, and can be shared internally without to much training: share a very short video of what will be turned on, why you're doing that and the consequences of that (blocking secrets from entering the codebase). Then explain what you expect people to do with these alerts, to prevent them of just ignoring everything that comes in and marking it as "closed with will fix later" and then not doing anything about it.

# New features in the beta
The new features are available on the organization level (not on Enterprise yet) and are called "Code security configurations". This allows you to set up a default configuration for some or all repositories in your organization. This is a great way to set up a default configuration for all repositories in your organization, and then tweak it for specific repositories if needed.

### New policies
It starts having 'policies' that you can deploy to repositories. That matches the administrative terminology that GitHub uses everywhere, so that makes sense. 

Since this is new, you only have the 'GitHub recommended' policies as well as a 'legacy' policy. The legacy policy just contains what settings you had set before to be the default for new repositories.

The GitHub recommended policies will turn on the suggested settings for Dependabot, Secret scanning, and Code scanning. The UI does not really show you what that means at all, and I am very curious to learn what will happen if this recommendation changes in the future. 

During testing this turned out to be enabling the following settings on the repo level:
- Dependency graph
- Dependabot alerts
- GitHub Advanced Security on the repo (will claim license seats)
- CodeQL analysis with the default configuration, so running in the background (not visible in Actions) and non blocking in a pull request
- Autofix for CodeQL is enabled (curious to see how that works with PR's then! Probably follows the Check runs threshold) based on the alert that is generated, but I also would like to see if it annotates the PR at all.
- Secret scanning and Push protection (Great! Low hanging fruit in my opinion)

![Screenshot of the UI showing "GitHub recommended" policies and your own policies](/images/2024/20240427/20240427_01_Configurations.png)  

That least seems like a very sensible default to me, although I wish this would be more visible in the UI. I would like to see a list of what is enabled and what is not, so that you can gauge the consequences are of enabling these features.

### Creating a policy
The screen to create a new policy is a dream. It is very clear and easy to use. The different functionalities (or GHAS 'pillars' as I like to call them) are grouped together for easy understanding, and then you can still enable all the features we had before. The "advanced security" label also nicely shows which of these features will require GHAS licenses for those repos.

![UI showing how to create a new configuration, with grouped blocks for each functionality, like 'Dependency settings'](/images/2024/20240427/20240427_02_NewConfiguration.png)  

Also note at the bottom the flag 'Use as default configuration for newly created repositories'. This is a great way to set up a default configuration for all repositories in your organization, and then tweak it for specific repositories if needed. The dropdown on the right hand side has the option to do this for only new public repos, or only for new private and internal repos. I assume the 'private and internal' option will also include 'public' repos, but I was not sure from the UI, so that could be improved. After testing it proved that this is indeed the case!

### Applying a policy
You can apply policies by filtering the repo overview to the repositories you want to target with the new powerful filter bar that is available in certain places in the GitHub UI. Filter to the repos you want to apply the policy at and then click the 'Apply configuration' button. This will show you the policies that are available and you can select the one you want to apply.

![Screenshot of the UI showing how to apply a policy to a repository](/images/2024/20240427/20240427_02_ApplyConfigurations.png)  

After applying the policy to a repository, the repository admins will be able see that there has been a policy, although this is so subtle that I looked over it the first three times. I can also imagine an update later on in this same spot that lets repo admins choose from internal policies and adopt them easily during on-boarding.

![Screenshot showing the subtle new panel that says "security configuration" with the mention of the policy name](/images/2024/20240427/20240427_04_RepoLevel.png)  

Repo level admins can still make changes to their repo settings and even lower the security settings if they want to. From an organization management standpoint I'm not sure if I like this or not, as this gives repo admins the option to lower our security standard. I would like to see a way to lock down the settings to the organization level, but I can also see that this means locking repo admins out of certain options. On the organization level you will see it when a repo with an applied policy has removed settings so that the repo does no longer match the policy. This information does not show up in the Audit log at the moment, so you will have to keep an eye on the settings yourself. I assume this is one of those things that will be added before this feature goes GA. With that I can at least monitor if the settings are still in place and act on it if needed.

Do note that the setting "private vulnerability reporting" is not part of the policy settings. It is a feature outside of GHAS so I think that is the reason to not include it. As an admin I would like to see this in the policy settings as well, as it is a security feature that I would like to have enabled by default and promote everywhere. It depends of course on the maturity level of the organization, if they have Enterprise Cloud or Server, or maybe have a different internal process for reporting security vulnerabilities. So far I have seen a lot of companies not even having a policy, so having this on by default makes a lot of sense for them in my opinion.

# Limitations
There are at the moment some limitations of using the new policies. This makes sense as it is only a beta, so some updates might come in the future. The limitations are:
- Not available in "User space", so not on your own repos. Which makes sense as this will probably (guessing here) be a paid feature for Teams and higher plans.
- For free organizations it is only available for public repos, but not for private repos. It's great this is free for public repos, it makes it easier to roll this out on all your repos and up your security game!

![Screenshot showing that the policies only work on public repos on a free organization](/images/2024/20240427/20240427_Limitiations.png)  

# Summary
Overall I really like the new way to make it faster to rollout defaults in your organization. I can image creating several policies in the form of level 1 to 3 at your company, and graduating teams from level to level:

Level 1: Basic security settings, like secret scanning and push protection, together with the Dependency Graph and Alerts. It makes sense to enable Code Scanning in here to at least get the alerts, but having a communication plan with your engineers is key here to let them know that alerts will be found, and what we expect them to do with them (or not).  
Level 2: Include Dependabot security updates and start blocking on PR's with the [Dependency-Review action](https://github.com/actions/dependency-review-action) (not part of the policy options by the way).  
Level 3: Also include version updates as well as the CodeQL analysis with blocking alerts in PR's.

This will really be helpful rolling out GHAS features across an organization, as we can roll this out really easily on a team-by-team basis in one go, instead of having to go repo-by-repo.