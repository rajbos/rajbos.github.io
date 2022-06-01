---
layout: post
title: "Creating a GitHub Action"
date: 2022-06-01
---

I wanted to describe how my flow usually works for creating a [GitHub Actions](https://docs.github.com/en/actions). People often struggle to think of something to build because they start with an empty canvas: the action itself. That is not how I build up the action. For me the process is as follows:

1. Have a need for something straightforward: like calling the GitHub API in a certain way. 
1. Create a small [github-script](https://github.com/actions/github-script) for it to see if this works.
1. Move from the inline script to an actual script file, since that is easier to debug.
1. Have a fully working script, and realize this could be helpful for others
1. Create a new action repo for it and move the code there
1. Add unit tests to validate everything works
1. Add a local workflow that tests the action
1. Use the action repo in the place where it started, validate it works there as well
1. Publish the action


![Photo of a sign that says: Turn ideas into reality](/images/20220601/mika-baumeister-Y_LgXwQEx2c-unsplash.jpg)
<span class="rTNyH RZQOk">Photo by <a href="https://unsplash.com/@mbaumi?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Mika Baumeister</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a>.
  </span>

## Have a need for something straightforward
I work a lot with GitHub Enterprise server these days, and we have self hosted runners. I wanted to load the number of available runners by trait and alert me when the number of a certain trait is beneath 3. You can call the API at the organization level to retrieve that information: `GET /repos/{owner}/{repo}/actions/runners`.

## Create a small `github-script` for it to see if this works.
With the [github-script](https://github.com/actions/github-script) you get an authenticated GitHub client to use that can make calls to the API. Since this is an organization level API, we need to give it an access token for it to use. Since I like to use a GitHub App for that, I use that to get a token an pass it in.

``` yaml
    # example of loading a token from an GitHub App
    - name: Get Token
        id: get_workflow_token
        uses: peter-murray/workflow-application-token-action@v1
        with:
            application_id: ${{ secrets.APPLICATION_ID }}
            application_private_key: ${{ secrets.APPLICATION_PRIVATE_KEY }}
```

Then I call the API with the client:
``` javascript
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/actions/runners", {
        owner: organization,
        repo
    })
  console.log(`Found ${data.total_count} runners at the repo level`)
        
```
The data object will have the response of the call and I can start working on manipulating it to get the representation I want, like grouping them per label:
``` javascript
const groups: group[] = []
  data.runners.forEach((runner: any) => {
        runner.labels.forEach((label: any) => {
            const index = groups.findIndex((g: any) => g.name === label.name)
            const status = runner.status === 'online' ? 1 : 0
            if (index > -1) {
                // existing group                
                groups[index].counter = groups[index].counter + 1
                groups[index].status = groups[index].status + status
            }
            else {
                // new group
                groups.push({name: label.name, counter: 1, status: status})
            }
    })
  })
```
I can now search for a certain group and alert if the count for that group is less then the number I want.

## Move from the inline script to an actual script file, since that is easier to debug.
The hard part of using the [github-script](https://github.com/actions/github-script) is that it is very hard to debug. Your script is inlined somewhere so you get an error message stating there is a parsing issue with the inline script, which will be something vague like: error parsing ' on line 57.  You can try to count the line number in your inline script and search for it that way, but that is very brittle and just sucks. To improve on this, we can move the entire script into a separate file, which we can then call from the `github-script`:

New file --> Move the code to a separate file. I often save the file in the `.github/workflows` folder since that it is what it is for. Don't forget to checkout the repo since now we need to have the file on disk before we can execute it:
``` yaml
  uses: actions/checkout@v3

  uses: github-script@v5
  with:
    script: |
       const script = require('./path/to/script.js')
       console.log(script({github, context}))
```    
If there are parsing errors, the parsing engine will actually tell you: there is an error in you script.js on line 25. Much better! 

## Have a fully working script, and realize this could be helpful for others
Now that we have a fully working script, with the alerts, I can start thinking about how this could be useful for others. Some people might just want to get the grouped information, some might want to generate alerts. An alert could be a failed workflow, and then use the GitHub notification system to alert the owner. Or the alert might be send into a Teams channel, or a Slack message. Since that could be anything, I want to make only the building block needed to get the info we need. It's then up to the user to figure out what they want to do with it: they can choose to make an alert and then configure where to send it. 

As a good practice, you try to keep your action as minimal as possible. I have actions that only get the data I need, and return it as JSON. What happens with the JSON is up to them. I have cases where I save the JSON back into a repo, or where I load the JSON and then filter it. The point is: leave that up to the user: they can build on you building block.

## Create a new action repo for it and move the code there
Since I determined this might be useful for others, I start creating a new action repository. A good starting point is always the [Typescript template repository](https://github.com/actions/typescript-action). Use it as a template and it will give you the skeleton setup you need. Only thing that currently doesn't work on my Windows machine is the building of it, since the setup they use just fails on Windows. Switching that to `esbuild` does work, so I often convert those calls.

## Add unit tests to validate everything works
Since there is some intelligence in the code, like a function that handles the grouping, I start creating unit tests for that. This way I can test the code locally, which saves me a lot of time. Use .env files to load an access token and you can even execute all the API calls and verify that things work.

## Add a local workflow that tests the action
After validating the unit tests (and integration tests if you use the .env file setup), it is time to test the action inside of an workflow. You can call the local action in a workflow, pass in the needed params and then execute it:

``` yaml
  uses: ./
    with: 
      access_token: ${{ secrets.APP_ACCESS_TOKEN }}
```
We can store the results in a JSON file for example, and pick that up in the next step in the job. Then parse it and validate it contains the data we expect.

## Use the action repo in the place where it started, validate it works there as well
As a final validation I replace the script file in the first step, with a call to this new action. If it still works as expected, it is time for the next step. If not, we can fix it before telling the world about a new action 😉.

## Publish the action
Now it is time to publish the action. We can automate almost everything: creating a release from a tag is where it starts. GitHub Actions use Git Tags for the version number. I use a workflow that is triggered whenever I push a new tag to the repo: that will create the release and add the repo into it.

The only thing is: publishing the action to the marketplace can currently only be done with the UI 😲. There is a checkbox that needs to be set, and that is not available from the API. As a workaround, I create the release from the workflow file, and then push a message into my own Slack channel with a link to the release. I can then follow the link, edit the release and set that checkbox. 

## Tell the world about your new action
A quick shoutout on social media is the least we can do 😄.

### Note:
To see the resulting action at work, and to the source code I used for all the setup, check out this action: [load-runner-info](https://github.com/devops-actions/load-runner-info).