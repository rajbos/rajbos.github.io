---
layout: post
title: "Enabling CodeQL on GitHub Enterprise Server"
date: 2023-02-07
tags: [GitHub, CodeQL, Security, GitHub Advanced Security, Advanced Security, DevSecOps, GHES, GitHub Enterprise Server]
---

To enable CodeQL on GitHub Enterprise Server you need to make sure you have GitHub Actions setup and running, including your own set of self-hosted runners. You can read more about that in my previous post [here](/blog/2022/10/09/Enabling-GitHub-Actions-on-Enterprise-Server).    

From that point you can get started to enable CodeQL. Of course, you'll need to have it enabled in your license, and upload that license file to your server as well. Enabling starts at the appliance level, where you need to enable the code scanning and secret scanning features from the management console.

![Photo of all sort of tools hanging on a wall, like hammers, saws, etc.](/images/2023/20230207/barn-images-t5YUoHW6zRo-unsplash.jpg)
#### Photo by <a href="https://unsplash.com/@barnimages?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Barn Images</a> on <a href="https://unsplash.com/photos/t5YUoHW6zRo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>  

The default workflow that CodeQL will propose links to the `github/codeql-action` action, of which a static copy is installed with each Enterprise Server update. This organization is hidden by default, but you can navigate to it with the direct link. The issue here is that these action repos (github/dependabot-action and all repos in the actions org) only have the source code linked and updated with each Enterprise Server update. Since the CodeQL bundle is stored as a release asset, it is missing from the appliance. The bundle contains all CodeQL queries, including the `security-extended` and `security-and-quality` query types.

## Syncing the CodeQL bundle
Normally we'd use the [actions-sync](https://github.com/actions/actions-sync) tool to update the actions on the appliance with the latest version on github.com. Unfortunately that tool does not sync any release assets. For syncing the release assets, we need to download the latest release of the [codeql-action-sync-tool](https://github.com/github/codeql-action-sync-tool).

After downloading the `codeql-action-sync-tool`, you need to make sure you have write access to the `github` organization. By default you do not have it, so you cannot `write` to the release assets or anything else in this org. That means we need to promote the user that will execute the syncing to an owner of the `github` org.   

To do so, you need to call the [ghe-org-admin-promote](https://docs.github.com/en/enterprise-server@3.4/admin/configuration/configuring-your-enterprise/command-line-utilities#ghe-org-admin-promote) command line utility from a remote shell on the appliance:

```bash
ghe-org-admin-promote -u USERNAME -o ORGANIZATION
```

Now we can call the `codeql-action-sync-tool` to download the latest version of the CodeQL bundle and upload it to the `github/codeql-action` repo. This tool will also update the `github/codeql-action` repo with the latest version of the action code.  
You can run it with this command:

```bash
codeql-action-sync-tool sync --force \
 --destination-url https://enterprise-server-url.com
 --destination-token <PAT> \
 --source-token <PAT> # prevents ratelimiting
```

Of course, the machine that is running this will need to have access to github.com, as well as the Enterprise Server. The `--source-token` is optional, but it will prevent you from hitting the rate limit on github.com.  

# Running CodeQL efficiently
Now that we have the CodeQL bundle on the appliance, we can start using it. The first thing you'll notice is that the CodeQL bundle is quite large. The Linux zip file alone is 500Mb, which is quite a lot for a GitHub Action. The release asset appropriate for the OS of the runner is downloaded for each run. If you are using ephemeral runners (which you should!), this means that the CodeQL bundle is downloaded for each and every run. Given that this workflow is configured by default to run on every push, pull request as well as on a schedule (once a week), it can take up quite the bandwidth and thus hammer your appliance.  

![Screenshot showing the different sizes of the release assets, with the Linux tar file being 500Mb](/images/2023/20230207/codeql-action.png)

The action follows the normal setup for GitHub Actions to check for the well known folder `runner.tool_cache`, which is stored in '/opt/hostedtoolcache/'. If it can find the bundle in that folder, it will use that. If it cannot find it, it will download the appropriate release asset.

That means that we can prep our runners by copying the CodeQL bundle to this location. This will prevent the bundle from being downloaded for each run. The folder is used by including the CodeQL bundle release version and date: `/opt/hostedtoolcache/CodeQL/2.12.1-20230120/x64/codeql/codeql`.

Priming that location will significantly lower the download pressure on your appliance, and speed up the execution of the CodeQL workflow.  
