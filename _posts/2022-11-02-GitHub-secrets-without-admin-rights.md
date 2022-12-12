---
layout: post
title: "Working with GitHub secrets without admin rights"
date: 2022-11-02
tags: [GitHub, GitHub Actions, GitHub Secrets, GitHub REST API, GitHub CLI]
---


I was giving a training today on [GitHub Actions](https://github.com/features/actions) and learned something new! One of the attendees asked about being able to read and write to Repository Secrets without having admin rights. I had never tried this before, but it turns out it is possible!

## The premise:
To be able to create actions on the repository you need to have Admin access to the repository: otherwise the UI will not be visible, since it is under the repository settings. For organization level secrets you need Admin access to the _organization_ level.

That also means that team members that do not have Admin access, cannot SEE the repository secrets in the UI. They always had to rely on the examples in other workflow files to see what type of secrets were available. Today I learned that any user with **write** access to the repository can also create, update, and delete a secret. Even if they cannot see it in the UI, they can use the API to manage the secrets. It would be great if GitHub updates the UI to make these kinds of information available to all users that need it (write and maintain). Something similar happens with available GitHub Self-hosted Runners (information is not available for non-admins).

![Photo of a smart phone with the thinking emoji displayed on it](/images/2022/20221102/markus-winkler-wpOa2i3MUrY-unsplash.jpg) 
##### Photo by <a href="https://unsplash.com/@markuswinkler?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Markus Winkler</a> on <a href="https://unsplash.com/s/photos/think?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  

## The solution:
If you have **write** access to the repository, you can use the API to create, update, and delete secrets. You can use the [GitHub CLI](https://cli.github.com/) to do this, or you can use the [GitHub REST API](https://docs.github.com/en/rest/actions/secrets#list-repository-secrets). 

There is also an API for Environment secrets that work the same way: [GitHub REST API](https://docs.github.com/en/rest/actions/secrets#list-environment-secrets).

The GitHub CLI is a great tool to use, since it is easy to use and it is cross-platform. You can install it on Windows, Linux, and Mac. 
For maintaining the repository secrets, there is a native call in the CLI that you can use: [link](https://cli.github.com/manual/gh_secret_list).

```bash	
  # list all secrets for the current repo
  gh secret list
```

For environment secrets there is no native call in the CLI, but you can use the REST API to list the secrets. You can use the following command to list the environment secrets:
    
```bash
    # list the environments on the repository:
    gh api repos/<OWNER>/<REPO>/environments

    # list secrets for that environment:
    gh api repos/<OWNER>/<REPO>/environments/<ENVIRONMENT>/secrets
```

Output of the CLI calls:  
![Screenshot of the output of the CLI calls](/images/2022/20221102/20221102_Secret_Listing.png)  

From then you get options to set (create), delete or update the value of the secret. Retrieving the value of the secret is not possible, since there are no API calls for that, which makes sense since they are _secrets_.

Examples of setting a variable:
``` bash
# Paste secret value for the current repository in an interactive prompt
$ gh secret set MYSECRET

# Read secret value from an environment variable
$ gh secret set MYSECRET --body "$ENV_VALUE"

# Read secret value from a file
$ gh secret set MYSECRET < myfile.txt
``` 

## Figuring out environments and secrets
The environment secrets _can_ be listed by users with write access, and they can _create_ environments directly with the API.

For creating an environment you need to have write access to an repo, and the repo needs to be in an Organization. User space repos do not work with this write API.
``` bash
    # list secrets for that environment:
    gh api repos/<OWNER>/<REPO>/environments/<ENVIRONMENT>/secrets
```

For creating environments in your own user space, you have Admin access so you can use this API call. If you add a body you can the timeout rule, specify protection rules (who needs to approve the job that targets the environment) as well as the deployment branch rule (which branch is allowed to target that environment).
``` bash
 gh api -X PUT /repos/<OWNER>/<REPO>/environments/NEW_ENVIRONMENT
```

Results:  
![Screenshot of the output of 'gh api -X PUT' call to create the environment](/images/2022/20221102/20221102_CreateEnvironment.png)  

If you are invited as a Collaborator to another user's repo, you cannot create environments with the API. Trying to make the call you can get two results:
- 404: Not found (repo is private)
- 403: Forbidden (public repo, but you do not have admin access)

As long as you do have **read** access to the repo, you can list the environments:
``` bash
    # list the environments on the repository:
    gh api repos/<OWNER>/<REPO>/environments
```	

💡 As you have read access to all *public repos*, you can list the environments on any public repo as well. Since this information is already available from the workflow files (and they are public), having the name of the environment is not a big deal. Unfortunately the API returns all there is to know about that environment, including the deployment branch and protection rules. The feedback I got from GitHub is that this is 'by design'. You can get similar information from the [branches API](https://docs.github.com/en/rest/branches/branches#list-branches).

## Closing thoughts:
The only thing that is not available this way is retrieving a list of Organization level secrets: the API calls for that need `admin:org` scope, which a user with write access to the repository does not have by default. That is still a big missing feature, since these kinds of secrets are often used to set some large scope (often read-only) secrets for the entire organization, or to have 1 'team' secret that gets added to the repos that team owns.

So, to list all the Repo secrets you can run:
```bash
gh secret list
```

And for finding the Environments and their secrets: 
```bash
    # list the environments on the repository:
    gh api repos/<OWNER>/<REPO>/environments

    # list secrets for that environment:
    gh api repos/<OWNER>/<REPO>/environments/<ENVIRONMENT>/secrets
```
