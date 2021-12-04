---
layout: post
title: "dev.to entry: Using GitHub Actions to setup a Marketplace"
date: 2021-12-04
---

This post is for sharing my dev.to entry for the [2021 GitHub Actions Hackathon](https://dev.to/devteam/join-us-for-the-2021-github-actions-hackathon-on-dev-4hn4). This entry shows how I have setup the workflow(s) for the [GitHub Actions Marketplace](https://devopsjournal.io/actions-marketplace/). I wanted to have a long form post detailing the steps and reasoning behind each the setup as an entry point for people building these automations.

![GitHub + dev hackathon banner](/images/20211204/20211204_dev_to_hackathon.jpg)


## Workflow:
The starting workflow for this setup can be found [here](https://github.com/rajbos/actions-marketplace/blob/main/.github/workflows/get-action-data.yml). This workflow goes through all repositories in a user or organization and checks if they contain action definitions. If so, it adds the information about the action and the repository it lives in to a data file that then can be used. In this case the data is used to display an Internal GitHub Action Marketplace so our organization users. We lock our main organization down so that only the actions in our internal marketplace can be used as is a common [best practice](/blog/2021/02/06/GitHub-Actions-Best-Practices.html).

```yaml
jobs:
  get-action-data:
    runs-on: ubuntu-latest

    steps:
    - uses: devops-actions/load-available-actions@v1.2.12
      name: Load available actions
      id: load-actions
      with: 
        PAT: ${ { secrets.PAT } }
        user: ${{{ github.repository_owner }}}

    - name: Store json file
      run: echo '${{ steps.load-actions.outputs.actions }}' > 'actions-data.json'
          
    - name: Upload result file as artefact
      uses: actions/upload-artifact@v2
      with: 
        name: actions
        path: actions-data.json
   
    - name: Upload json to this repository
      uses: rajbos-actions/github-upload-action@v0.2.0
      with:
        access-token: ${{ secrets.PAT }}
        file-path: actions-data.json
        owner: ${{ github.repository_owner }}
        repo: actions-marketplace
        branch-name: gh-pages
```

## Workflow steps
Below I listed the steps in the workflow that do the actual work.

### Load available actions from an organization
I created the [load-available-actions](https://github.com/devops-actions/load-available-actions) action just for this purpose. It needs a token to access the GitHub API and will load all repositories it can find from either the user or the organization you give it. It loops through all the repos, scans for either an `action.yml` or `actions.yaml` in the root of the repository and adds the information to the output of this step so that it can be used later on in the workflow.

### Store the outcome of the previous step as json
We store the output of the `load-available-actions` action in a file so we can upload it more easily to both the artefacts for this run (handy for testing and validation) and to the GitHub Actions Marketplace repo.

### Upload the json as an artefact for easy testing
To view the results in the workflow run, I upload the json file as an artefact so I can download and check it if needed.

### Upload the json to the GitHub Actions Marketplace
This is the important step for later usage of the data: store it inside the repository that holds the Internal GitHub Marketplace.
For this I use this [GitHub Action](https://github.com/LasyIsLazy/github-upload-action) where I have added the option to upload the files into a branch: Since the GitHub Pages website from this repo runs on a `gh-pages` branch, I needed to upload the file in the same branch. 

#### Open Source FTW!
Actions have to be Open Source to be able to use them by default (you can use private repos, but that is a bit more work), So if you miss something, you can start a conversation with the maintainer (use issues or discussions if they have that enabled) and even send in a [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) to propose the fix! The upload-action was missing some features that I needed for this project. I have added the following features:
* [Support upload to a branch](https://github.com/LasyIsLazy/github-upload-action/issues/2) 
* [Support GHES](https://github.com/LasyIsLazy/github-upload-action/issues/3)

# Internal GitHub Actions Marketplace
You can read more information about the Internal GitHub Actions Marketplace I created in this [blog post](/blog/2021/10/14/GitHub-Actions-Internal-Marketplace.html). The goal is to give our users a place where they can find the supported actions internally, since we block the use of public actions in our production organization.
![Image of the Actions Marketplace](/images/20211014/20211014_Marketplace.png)

## Next steps:
Next to prettifying the marketplace and adding search, I want to add more information about the actions being used inside of our production environment. This way my users can see examples of their usages and I can easily find the implementations in case there is something wrong with the action, like a security vulnerability or newer features being implemented.

Loading the information is done by another action that loads all repositories' workflow files and outputs a list of all the actions in use in them, with the information of which workflow uses with action and version of it. The action can be found in [devops-actions/load-used-actions](https://github.com/devops-actions/load-used-actions).