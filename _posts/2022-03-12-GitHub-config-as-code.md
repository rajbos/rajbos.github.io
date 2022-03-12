---
layout: post
title: "Configuration as Code for the GitHub platform"
date: 2022-03-12
---

# THIS POST IS CURRENTLY UNDER CONSTRUCTION

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

<div id="code-element"></div>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script>
      axios({
      method: 'get',
      url: 'https://github.com/robs-tests/user-test-repo/blob/e9bfc0ccf936a71b35b6825ff85930df5cc4b9ed/.github/workflows/pull_request.yml#L10-L32'
       })
      .then(function (response) {
         document.getElementById("code-element").innerHTML = response.data;
      });
</script>

Second test:
<div id="code-element2"></div>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script>
      axios({
      method: 'get',
      url: 'https://github.com/robs-tests/user-test-repo/blob/main/.github/workflows/pull_request.yml#L10-L32'
       })
      .then(function (response) {
         document.getElementById("code-element").innerHTML = response.data;
      });
</script>
