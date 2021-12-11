---
layout: post
title: "Maturity levels of using GitHub Actions"
date: 2021-12-11
---

I've been discussing using GitHub Actions in a secure way for a while now, and I got a question on how to improve your usage of actions. I wanted to capture that info in an easy to follow set of steps, so here we go:

1. Default demo examples: version pinning or by branch
2. Review the source code and trust the publisher / action
3. SHA hashes
4. Fork the repo and take control
5. Dependabot for actions
6. github-fork-updater
7. Internal marketplace
8. Request actions process


I'll go over each of these below and give some more context. With that you should be able to determine where you or your company is at this scale. I'd love to what your next step will be, so please let me know on [Twitter](https://twitter.com/RobBos81)!

## 1) Default demo examples: version pinning or by branch
This is currently where all the demos start: use version pinning (now required) or by branch: 

``` yaml
    - uses: actions/checkout@v1
    - uses: actions/checkout@main
```
The engine and UI now force you to use one of these ways, or fail to start the workflow or save it.

The first line is referencing a version which was used to publish the action as a release. You can find all the released version in the action repository itself: [link](https://github.com/actions/checkout/releases). Often the release will have release notes and a list of the commits that made it to the new release. Actions should be following [semantic versioning](https://semver.org/) which means that you can use `v2` to always use the latest compatible version with v2. So if the publisher releases v2.14.17, the runner will use that version. 

The second line references a specific branch in the actions' repository. 

For both options, the runners will download the entire repository by calling either git checkout (if git is installed on the runner) or downloading the status of the repository as a tarball. The [runner is open source](https://github.com/actions/runner), so you can follow along with the steps it is taking.

The issue with using both, is that you are pulling in arbitrary code from the internet! Even if you follow [best practices](/blog/2021/02/06/GitHub-Actions), you should look at what the action is doing for you. GitHub as no documented process for publishing an action or a security check on them: anyone can set up a public repository with the right content and then everyone can use it. Very helpful to get started fast, but security is not part of that picture!

### Why is this first level so bad?
As I said, the methods above always use a version of the action as is. The branching method uses whatever was pushed last to that branch. So even if you have just reviewed it and start using it, a newer version might just have been pushed to that branch. This happens **without you knowing of** it at all! Anything can happen between you reviewing it and you using it. A vulnerability in a package the action is using might be found, or the maintainer decides to export all environment variables to their own server. Or maybe even the maintainer hands over the code to a third party so they can do the maintenance. You never know, but might be using an action in production that is not what you intended.

For version pinning the same principle applies: you might even pin a specific version, say v2.1.4 and think you're now safe: you are not! The version of a release comes from a [git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging). Git tags can be reused! They are flexible by design, so the maintainer cant tag code and push that as v2.1.4. Then, even months later decide to add some code, maybe introduce a vulnerability and reuse the same tag! Then the runner will download the version of the repository **as it is with that tag** linked to it and you are running code in your workflow that you never intended.

## 2) Review the source code and trust the publisher / action
The first step in being better at using actions in a secure way is to review the source code: know what the action will be doing on your behalf! The repo is open source, so go to the repo:

![Screenshot of where to find the action repository link](/images/20211211/20211211_Marketplace.png)  

Did you know you can even use the action call it self to find the repo? The uses statement can be partially copied behind github.com to have the direct link to the repo! So this `uses: actions/checkout@v1` becomes this `github.com/actions/checkout`!

Now find the `action.yml` in the root and find it's entry point under `runs`, for example the checkout action: 

``` yaml
runs:
  using: node12
  main: dist/index.js
  post: dist/index.js
```

The `using` indicates that this action runs under node, so it is JavaScript based. This can be compiled TypeScript, so the next step is to look for the entry point and how it got there. Often you find a `src` folder and the TypeScript files in there (*.ts). Usually the starting file is then `main.ts` or `index.ts`.

In this case we see a `main` property that indicates the starting point when this action starts, so `index.js` in the `dist` folder. This already is a good change this action is build with TypeScript. You often can find where it actually starts by checking the `packages.json` file. For this action we find `"main": "lib/main.js" in there, so we can find where it actually starts 😄. For TypeScript the file names just have the `.ts` extension.

We also have a `post` definition here, which means that part of the action will also run at the end of a run:

![Screenshot of the post step execution](/images/20211211/20211211_PostStep.png)  

To summarize, there is no verification or security label before someone can use an action, so you need to do your own due diligence! 
Check what the action is doing and make an informed decision if you can trust the action. 

## 3) SHA hashes
Now that you have reviewed the actions' source code, you need to make sure you always use that specific version of the action. This is where the SHA hashes come in. Each git commit gets its own unique SHA hash, based on the contents of the commit. That SHA hash is unique! Generating the same SHA hash with different contents is possible, but very hard to do. Having the contents of the repo as a prespecified setup (with an 'action.yml' file for example), makes it very unlikely that you will get the same SHA hash for different code. That means we can use the SHA hash to indicate a specific version of the action we will use. The runner will detect the SHA hash and use that to checkout the actions repository at runtime.

![](C:\Users\RobBos\Code\Repos\GitHub\rajbos.github.io\images\20211211\20211211_SHA_short.png)

![](C:\Users\RobBos\Code\Repos\GitHub\rajbos.github.io\images\20211211\20211211_SHA_complete.png)



## 4) Fork the repo and take control
## 5) Dependabot for actions
## 6) github-fork-updater
## 7) Internal marketplace
## 8) Request actions process


``` yaml
```