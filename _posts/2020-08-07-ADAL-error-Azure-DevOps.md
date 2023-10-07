---
layout: post
title: "ADAL error in Azure DevOps API interaction"
date: 2020-08-07
---

Today I encountered an issue while interacting with the [Azure DevOps API](https://docs.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-6.1&WT.mc_id=DOP-MVP-5003719). In the end this is not an issue with the API but with the user authentication and verification of tokens.
Since it took me a while to figure out what was happening, I'm documenting it here.

## Error message 'Failed to obtain an access token of identity ..., The refresh token has expired due to inactivity'
It matched the current project that I was working on: it had been a while since I used that project (and Azure DevOps organization for that matter) last: at least 5 months ago.
The weird thing is, other calls to the REST API where working, using the same Personal Access Token ([PAT](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page&WT.mc_id=DOP-MVP-5003719)) to setup projects, create repositories and other calls.
The script that failed was adding new users from the [AAD](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-whatis?WT.mc_id=AZ-MVP-5003719) to our project, calling this endpoint with a body that holds the full username (`username@domain.tld`) with `Invoke-RestMethod` from PowerShell:
```
https://vssps.dev.azure.com/<<organization>>/_apis/graph/users?api-version=5.0-preview.1"`
```

![Hero image: Person jumping in front of a tree](/images/2020/20200807/stephen-leonardi-wPlzrculha8-unsplash.jpg)
##### <span>Photo by <a href="https://unsplash.com/@stephenleo1982?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Stephen Leonardi</a></span>

### Full error message
```
Microsoft.VisualStudio.Services.Aad.AadAccessSilentException:
GetUserAccessToken: Failed to obtain an access token of identity ea9d0e15-1e40-7030-b823-2612135e0b31. AAD returned silent failure.
Microsoft.IdentityModel.Clients.ActiveDirectory.AdalSilentTokenAcquisitionException:
Failed to acquire token silently as no token was found in the cache.

Call method AcquireToken
Microsoft.IdentityModel.Clients.ActiveDirectory.AdalServiceException: AADSTS700082: The refresh token has expired due to inactivity.
The token was issued on 2020-02-29T21:32:27.8019754Z and was inactive for 90.00:00:00.
Trace ID: << GUID >>
Correlation ID: << GUID >>
Timestamp: 2020-08-06 07:39:38Z
 Microsoft.IdentityModel.Clients.ActiveDirectory.AdalServiceException: Response status code does not indicate success: 400 (BadRequest)
```
The interesting parts are below:
```
Failed to obtain an access token of identity << ID >>. AAD returned silent failure
The refresh token has expired due to inactivity.
The token was issued on 2020-02-29T21:32:27.8019754Z and was inactive for 90.00:00:00.
```

### The cause
From the error there seems to be something wrong with the user we are using for talking to the REST API, but what? Seems like that user hasn't logged on in the last 90 days. It could not be my own account, because I'm using that to verify the projects are created correctly! Is it something with my PAT? I was able to find and add users from the AAD through the UI, so my account seemed fine. I even checked the link with the AAD to make sure nothing had happened with that connection.

#### Finding the user
I'm not sure how to find back the user from the PAT token or that error: searching around in the AAD and Azure DevOps (even using the users API) didn't track back the specific user. If you happen to know a way to do this, please let me know! I've only found that specific Id in the network log of the 'Manage User' functionality in Azure DevOps:

![Manage users pane with network tab open in browser](/images/2020/20200807/2020/20200807_ManageUsers.png)

Luckily it happened to be that I could be using the PAT from two users in this project: either my own, or the one from the service user we created for all the automation. I also happened to have logged the specific PAT Token in my local [KeePass](https://keepass.info/) file that I use for these things. I've even learned to note down the creation or 'valid until' date for them, so I have something to cross reference in case of things like this!

## The fix
After finding the user, the quick fix was easy: log in with that user!

The only long term fix that I can think of will be periodically logging in with that user to the Azure DevOps organization, just to keep that account alive.

This also helps with keeping scheduled builds for that user alive and prevent them from no longer starting. That is another common error people run into with this 90 day period.