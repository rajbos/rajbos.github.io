---
layout: post
title: "Configuration as Code for the GitHub platform"
date: 2022-03-12
tags: [Configuration as Code, CaC, GitHub, Platform, User configuration, Teams configuration]
---

I am slowly diving into 'Configuration as code' for the GitHub Platform: all the things you want to automate with as few steps as possible, making big impact. Some of these things also fall under 'GitOps' in my opinion: if you store it into a repo and on changes you make, the automation will make it happen.

The plan is to have this post as a central starting point for people searching to achieve a similar setup. There are loads of people who blog on how to make this happen and what works for them, but often there is no actual implementation they can share. I want to give the you the examples and give you (a copy of) the code used as well.  
##### Note: Since most of these items need to be running in a separate org, I created them on my [robs-tests org](https://github.com/robs-tests/).

# Scenario:1 Automate user onboarding and repository creation
For on of our trainings we invite all trainees into and organization and create teams and repositories for them. Doing this with the UI is cumbersome and error-prone. We want to automate this process where someone can edit a yaml file, lint it and through a pull request approve it so that you always need another person to verify the incoming changes. After merging a workflow starts that make the new situation happen. 

The steps that I want to have are as follows:
1. Add new users and teams to the users.yml file
1. Create a PR
1. The workflow pull_request.yml workflow checks if:
   * The user file is valid yaml
   * The users is a valid GitHub handle
   * The user is already a member of the organization
1. After merging, the user-management.yml workflow runs and:
   * Create the team if needed
   * Add the user to the org
   * Create repository attendee-<userhandle>
   * Add the user to the repo
   * Add the user to the team
   * Add the team to the repo

Link to repo: [robs-tests/user-test-repo](https://github.com/robs-tests/user-test-repo)

## Step 1: define a yaml structure and parse it
In this example I want to start a simple structure, parse it, and then loop through the results. You can do this in any format you want. I thought of doing this in json for example, but that gives you a lot of overhead with all the extra double quotes and it is a bit harder to read. It would be easy to link a user to the wrong team for example. I knew I can parse yaml with a library, and that is what I went with: it will be compact, no extra characters around the content. Since for our trainings we usually have a max of 20 people in the group, the entire team and their users will fit on the screen without scrolling.

### yaml format:
This is the format I settled on for now: there is a list of teams and in each team there is a list of users.
```yaml
teams:
  - name: team01
    users: 
      - rajbos
      - Maxine-Chambers
```
Reading that from parsing the yaml gives me two loops to create: for each team and then for each user, do 'x'.

## Step 2: define the way you want to build your workflow
For most languages there will be an library available to parse the yaml, so it becomes a choice on what you would like to use for the automation. It depends on what your team already knows and how easy you want to be able to test this. These days I skip having a hard to manage setup and go to something really simple: [github-script](https://github.com/actions/github-script). This is a JavaScript Action that you can give your own script file and it will execute that for you. Inside your script you then get access to the GitHub contexts with authenticated clients and calls for all the API's you need. You can even run it with an [access token](/blog/2022/01/03/GitHub-Tokens) from a GitHub App (since we only use the organization level API's here, this will work).

[github-script](https://github.com/actions/github-script) also helps with having your code in JavaScript already: if you later want to make this a building block and make an action out of it, you are ready to go!

## Step 3: the PR workflow
In the [PR workflow](https://github.com/robs-tests/user-test-repo/blob/main/.github/workflows/pull_request.yml) I want to verify that:
* the yaml file is valid yaml
* the handles in the file are valid GitHub handles (we sometimes get e-mail addresses or typos in the handles)

```yaml
{% raw  %}
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 14
          
      - run: npm install yaml
      - uses: actions/github-script@v5
        name: Run scripts
        with: 
          github-token: ${{ secrets.GH_PAT }}
          script: |  
            const yaml = require('yaml')
            
            const repo = "${{ github.repository }}".split('/')[1]
            const owner = "${{ github.repository_owner }}"
            const userFile = "users.yml"
            
            const script = require('${{ github.workspace }}/src/check-pr.js')
            const result = await script({github, context, owner, repo, userFile, yaml})
            console.log(``)
            console.log(`End of workflow step`)
{% endraw  %}
```

In this example you see that we are:
* checking out the repository
* setup node
* so that we can install a node package that can parse the yaml
* then we use the `github-script` action to execute the script
* load the file `check-pr.js` that will do the work
* we pass in the info needed for the script to have all the context it needs

In the `check-pr.js` file you can see that we are:
* loading the contents of the yaml file in the current branch: `github.rest.repos.getContents({owner, repo, path, ref})`
* get the list of current teams: `let existingTeams = await getExistingTeams(owner)`
* parse the content of the yaml file: `const parsed = yaml.parse(content)`

And then we can loop through each element in the arrays:
```
  for each team:
    for each user in team:
       check if user exists
```

Verifying if a user exists can be done with a call to this API: https://api.github.com/users/${userHandle}
Checking if that user then already is a member of the org can be done with a call to this API: https://api.github.com/orgs/${orgName}/members/${userHandle.login}

## Step 4: the user-management workflow
When the PR is merged to main, another workflow executes: `user-management.yml`. This has the same setup: install the npm packages, load the script and run it.

From `load-users.js`:
``` js
// send an invite to the user on the org level:
await addUserToOrganization(user, organization)

// create a new repository for this user:
const repoName = `attendee-${user.login}`
await createUserRepo(organization, repoName)

// give the user admin acccess to the repo:
await addUserToRepo(user, organization, repoName)

// add the user to the team for the day of the training:
await addUserToTeam(user, organization, team)

// add the team to the repo (so that the rest of the team can help with PR's):
await addTeamToRepo( organization, repoName, team)
```

# Final thoughts
With this setup, you now have a complete example how you can use GitHub Actions to automate the process of adding users to an organization and preparing things like teams and repositories for them. You can build on top of this with for example:
* a setup that has a folder structure that defines the hierarchy of teams and users
* each folder could then have different code owners that defines who needs to approve the PR (give the team itself self-service on who to add)
* add more properties to the `users.yml` in case you need it