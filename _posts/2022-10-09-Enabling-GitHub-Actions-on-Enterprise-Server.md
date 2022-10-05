---
layout: post
title: "Enabling GitHub Actions on Enterprise Server"
date: 2022-10-09
---

When customers start using GitHub Enterprise with Actions and private runners, there are some common gotcha's you can run into. In this post I'm sharing the ones I have encountered so far.

* First of all: [Don't use self signed certificates on GitHub Enterprise](/2021/05/16/Dont-use-self-signed-certificates-on-GitHub-Enterprise)
* The default actions in will download the binaries from github.com
* Actions org will be cleaned up with each major/minor update

# The default actions in the /actions organization, will download the binaries from github.com
Be aware that the default actions in the /actions organization (setup-node, setup-go, etc), will download the binaries they need from [github.com](https://github.com/actions/setup-node/blob/main/src/installer.ts#L140). This means the runner will download those files without any authentication and will be ratelimited after 60 downloads/hour/ip-address.
To get around that, you will need to create your own version of these actions and download the releases from something like GitHub Releases or an internal source like Artifactory.

# Actions org will be cleaned up with each major/minor update
This was not such a pleasand surprise
