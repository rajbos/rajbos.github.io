---
layout: post
title: "Azure Repos Policy Settings Issue"
date: 2020-01-21
---

I ran into an issue where I could not change Azure Repositories Policy settings, even while my account was in the the Project Administrator group. Somehow I could set the policy, but not change it later on! This posts explains how I got here and how I finally found out why this happened. In the end it was a simple fix, only rather difficult to find the reason behind this 😄. 

## Adding an email validation policy
It all started at a new organization where I wanted to make sure that everyone was pushing changes into the repositories connected with their work e-mail address. To do that, you can set up a 'Commit author email validation' policy on each repository. That can be a lot of work if you have a lot of repo's 😀. Fortunately for us, a feature has been added to set those policies on the `project level`. 
##### Side note: you can even set those policies on the company level, but only with the [api](https://jessehouwing.net/azure-repos-git-configuring-standard-policies-on-repositories/).
##### Side note: you can have multiple patterns here as well, just split them with a semicolon in between.

![Adding a policy](/images/20200121/20200121_AddingPolicy.png)

You can see here, that I have set a policy on the `Git repositories` level, easy as that. From now on, everyone that tries to push something into any of these repositories with an email that doesn't match this policy, will get an error telling them to fix the setting. 
##### Side note: find out how to setup the commit email address from the [Git documentation](https://git-scm.com/docs/user-manual#telling-git-your-name).

## Policy Inheritance
The tricky part for me was that these policies are now `inherited` by all the repositories. It's not that clear in the UI what happens with the inheritance: are the settings from the top level extended with the settings on the lower level? I've seen strange things happen here. I'll come back to that later.

You can see how the inheritance looks here:  
![Policy Inheritance](/images/20200121/20200121_PolicyInheritance.png)
Note the highlighted area and the text.

## Blocking Policy Editing
Here is the catch that took me some time to figure out. I wanted to prevent team members to change any of these policies, so that they cannot circumvent them by disabling them. (yes, there is a note to make about trusting your team to do the right thing 😄).

So I created a policy that blocked members of the `Contributor` group from changing the policies. To do that, I set the rights for that group to `Deny`.   
![Blocking Policy Editing](/images/20200121/20200121_BlockingPolicyEditing.png)  

## Result on the organization level
If you go back to the e-mail policy on the top level, you can see that the message here is still the same: the setting is inherited from the project level. Except for that it is now disabled!

![Checking the policy](/images/20200121/20200121_PolicyInheritanceEditingBlocked.png)  

## Cause of the issue
In hindsight, it is clear that this is because my account is also part of the `Contributors` group. `Deny` settings have a higher priority then `Allow` settings! Fixing it was changing the `Deny` setting to `Not set`: that means that the contributors cannot change the settings, but this setting is not as explicit and people with the correct rights can still update policies.

# Policy Inheritance questions
As noted before, it's not clear if the policies are overwritten on the lower level if you set additional data on it. This is not clear from the [documentation](https://docs.microsoft.com/en-us/azure/devops/organizations/security/permissions?view=azure-devops&tabs=preview-page#git-repository-permissions-object-level)  
![Policy Inheritance](/images/20200121/20200121_PolicyInheritance.png)  

For example, you can add an extra domain to use validation. It will get stored and stays in the input if you refresh.
If you remove the initial domain but add a different one, then only that new domain is stored. Is the original rule now active? I need to test this out 😄.
![Policy Inheritance Extended](/images/20200121/20200121_PolicyInheritanceExtend.png)  

If you remove all text from the policy, it will show that it stored an empty value. On refresh, the policy from the top-level has been filled in again!

#### I suspect that the entries at the lower level is additive and the top level value always gets verified.