---
layout: post
title: "How GitHub Actions versioning system works"
date: 2022-10-19
tags: [GitHub Actions, versioning, SemVer, GitHub, Actions]
---

## TL;DR
* The runner just downloads what you specified, by getting it from the tag
* The runner does not do SemVer at all. It's up to the maintainer
* Even GitHub does not update (or create) all SemVer versions, so @v3 is not necessarily the latest thing for v3!
* The marketplace shows releases, not tags. If the maintainer does not actually release, it's not visible
* It's more secure to use a SHA hash instead of a tag: read more info [here](/blog/2021/12/11/GitHub-Actions-Maturity-Levels)

## Semantic versioning

When using GitHub Actions, the default is to use the Semantic Versions for which the actions where released. Semantic versioning (SemVer) is an industry wide standard of giving meaning to the version number. SemVer always follows this setup:

----------------

MAJOR.MINOR.PATCH

----------------

Given a version number you increment the:
* MAJOR version when you make incompatible API changes
* MINOR version when you add functionality in a backwards compatible manner
* PATCH version when you make backwards compatible bug fixes
Optionally you can use any suffix label you want to indicate special versions like alpha, beta, release candidate, etc:
* 1.2.5-alpha.1
* 1.2.5-RC.1

The goal of using SemVer is that you can then specify what you as a user of a library want to use. You can be very specific and say you want to use version `9.1.4`, but also be less specific and say you want to use version `9.1`. Following SemVer this means you want to use any version that matches the `9.1` MAYOR.MINOR version. This means you will get the latest version of `9.1` that is available. This is very useful when you want to use the latest version of a library, but you don't want to have to update your code every time a new version is released. You can just specify the MAYOR.MINOR version and you will get the latest version of that version. Effectively that means that you're saying `9.1.*`.

If version 9.1.3 is the current latest PATCH version, your package manager will download that version. If version 9.1.4 is released, your package manager will download that version. If version 9.2.0 is released, your package manager will *not* download that version, because it does not match the MAYOR.MINOR version you specified.

The same setup goes for the MINOR version. If you specify version `9`, you will get the latest version of that MAYOR version. This means that you will get the latest version of `9.1` and `9.2` and `9.3` and so on. Effectively that means that you're saying `9.*.*`.

## What the runner does with semantic versioning of using GitHub Actions
The runner that executes GitHub Actions for us is open source. You can check the source code for it [here](https://github.com/actions/runner). If you dive into it, you can find that the runner tries to download the version from the Action you specified:
``` yaml
- uses: actions/checkout@v2     --> will download the repo with TAG = v2
- uses: actions/checkout@v3.1.0 --> will download the repo with TAG = v3.1.0
- uses: actions/checkout@main   --> will download the repo with BRANCH = main
- uses: actions/checkout@e2f20e631ae6d7dd3b768f56a5d2af784dd54791 --> will download the repo with COMMIT = e2f20e631ae6d7dd3b768f56a5d2af784dd54791 (SHA hash)
```
You can find the code with it makes the download link [here](https://github.com/actions/runner/blob/5421fe3f7107f770c904ed4c7e506ae7a5cde2c2/src/Runner.Worker/ActionManager.cs#L1122-L1123). The runner then calls the REST API to download a [tarball of the repo](https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-tar) (or on a non-Windows host the zipfile of the repo).

If the TAG (or branch or SHA hash) you have specified is not available in the repo, the runner will give an error saying it cannot find that version.

## Using SemVer for Actions
Now the interesting thing is what happens if you specify a semantic versioning pattern for an action. For example:
``` yaml
- uses: actions/checkout@v3.1
```

Following semantic versioning, you'd expect that this example would work. Configuring actions with a version (or tag, or hash) is required these days so the runner can find the correct reference to download. That means that the maintainer of the action MUST follow SemVer when releasing their actions, as also described in the [GitHub Actions documentation](https://docs.github.com/en/actions/creating-actions/releasing-and-maintaining-actions#setting-up-github-actions-workflows). If the maintainer does not follow SemVer, the runner will not be able to find the correct version to download.

Now guess again what happens when you specify version `v3.1` for the checkout action. The runner will try to download the repo with TAG = `v3.1`. But that tag does not exist! The runner will then give an error saying it cannot find that version. So the runner does not check for matching versions by itself!
``` yaml
- uses: actions/checkout@v3.1 <-- this will fail!
```
You can find the tags for this action [here](https://github.com/actions/checkout/tags) and see that v3.1 is missing! So even the most used action, does not follow GitHub's best practices!!!

![Image of the 'this is fine' meme](/images/2022/20220918/this-is-fine.jpg)

Even better, the [GitHub Actions Marketplace](https://github.com/marketplace) actually does not show the version from the tags: it only shows the information from Releases in the repo! That means you could be missing out on tags that where not released as a GitHub Release.

Check the tag list versus the release list shown in the marketplace:
![Tag v3 is missing in the marketplace](/images/2022/20221019/20221019_actions_checkout.png)

# Make your GitHub Actions usage more secure
I've been telling people that tags are not secure: the maintainer of the action can update the tag to point to a different commit. That means that your workflow could be using a commit you verified (that should always be step 1!), but all of a sudden the maintainer of the action updates the tag to point to a different commit. That means that your workflow is now using different code, which you did not verify! Read more on becoming more secure with your Actions usage in [this blogpost](/blog/2021/12/11/GitHub-Actions-Maturity-Levels).

The way to fix this and make your setup more secure, is to use the SHA hash of the commit you want to use. That way you can verify the code yourself and you know that the code you're using is the code you verified. Incoming changes can be send as notifications by setting up Dependabot for the `github-actions` ecosystem.

## Summary
We keep telling people to follow SemVer for a reason, but for GitHub Actions the honus is on the maintainer of the action to actually re-tag all matching versions of their action with the correct SemVer version. And apparently, even GitHub doesn't follow along with this.

So when you have a current release `v4.2.5`, you also need to re-tag that commit with the `v4.2` tag, as well as the `v4` tag. This way the runner can find the correct version to download.

Example:
``` yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
    # works, as this is an actual tag in the repo
    - uses: actions/checkout@v3

  job2:
    runs-on: ubuntu-latest
    steps:
    # works, as this is an actual tag in the repo
    - uses: actions/checkout@v3.1.0

  job3:
    runs-on: ubuntu-latest
    steps:
    # does not work, as this is NOT an actual tag in the repo
    - uses: actions/checkout@v3.1
```