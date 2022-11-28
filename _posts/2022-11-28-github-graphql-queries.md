---
layout: post
title: "Examples for calling the GitHub GraphQL API (with ProjectsV2)"
date: 2022-11-28
---

Recently we had to call the GitHub GraphQL API for creating a new GitHub Project (with V2). Since this can only be done with the GraphQL API, we had to figure out how to do this. We found little bits and pieces of information, but no complete example. So we decided to write one ourselves. I hope this helps you as well.

## ProjectsV2 GitHub GraphQL API
The new GitHub Projects simply do not have a REST API at the moment, so you are forced to use the GraphQL API. As an extra challenge, the GraphQL API requires a [new set of ID's for these calls](https://docs.github.com/en/graphql/guides/migrating-graphql-global-node-ids).

## Logging in
If you are not careful, then the first hurdle will be to login with the right scopes. I'm going to use the GitHub CLI in this post, but you will need to make sure you have the right scopes for this with manual API calls as well. Logging in with just the normal `gh auth login` call is not enough in this case. Add the `project` scopes to your call:

``` powershell
gh auth login --scopes "project"
```

## Getting the new ID's
Now we can start making the calls to the GraphQL API. Since this API with ProjectsV2 needs the new ID's, make all calls like this to get the new ID's:

``` powershell
# powershell:
$response = $(gh api graphql -H "X-Github-Next-Global-ID: 1" -F query=$query | ConvertFrom-Json)
```

Now we can call the API with the current login to get the new ID for this login:
    
``` powershell
$query = "query { viewer { login, id } }"
$response = $(gh api graphql -H "X-Github-Next-Global-ID: 1" -F query=$query | ConvertFrom-Json)
```

Need to get the ID from an organization? Use this query:
``` powershell
$query="query { organization(login: ""$organizationName"") { id, name } }"
```

## Working with ProjectsV2
Now we can start loading the existing projects for an organization:
``` powershell	
$query="query { organization(login: ""$organizationName"") { projectsV2(first: 100) { edges { node { id } } } } }"
```

And we can create a new project:
``` powershell
$query="mutation (`$ownerId: ID!, `$title: String!) { createProjectV2(input: { ownerId: `$ownerId, title: `$title }) { projectV2 { id } } }"    
```

If you want to see the full script, you can find it [here](https://github.com/rajbos/github-graphql-examples).