---
layout: post
title: "GitHub Codespaces creation with the CLI"
date: 2022-01-26
tags: [GitHub, Codespaces, CLI]
---

This one took me some time to figure out, so I wanted to have something for the next time I need it :-).
I needed to create repos for a team and then create a codespace for them. I already was using the [GitHub CLI](https://github.com/cli/cli) for my automation, so I wanted to use it as well to create the codespace. The documentation states that you can call [gh codespace create flags](https://cli.github.com/manual/gh_codespace_create) and you are good to go.

Well, this command in the CLI works **differently** then you might think: First of, most of the commands work and pickup the repo that you are currently in. This command does not: you need to pass in the `-r` parameter and specify the repo using the `<owner/repo>` notation. 

Next up is the `-m` parameter to specify the machine you want to have as the compute option for the Codespace. In the [REST API](https://docs.github.com/en/rest/reference/codespaces) you do not need to specify this parameter and it will give you the type of machine in the response:

``` json
"machine": {
    "name": "standardLinux",
    "display_name": "4 cores, 8 GB RAM, 64 GB storage",
    "operating_system": "linux",
    "storage_in_bytes": 68719476736,
    "memory_in_bytes": 8589934592,
    "cpus": 4
},
```

The help for the CLI command doesn't give any hints as well. 

So, I tried to be smart and send in this json as the value, thinking they've missed that wrapper in the CLI. That fails with no extra information, probably due to some wrong string escaping on my end.

Then I entered 'standardLinux' as the value, thinking this will never work, since I want to create it with a certain `size`, and all flavors are Linux based....

This is then the response:
``` shell
 gh codespace create -b main -s -r "globaldevopsbootcamp/team01" -m "standardLinux"

error getting machine type: there is no such machine for the repository: standardLinux
Available machines: [basicLinux32gb standardLinux32gb premiumLinux largePremiumLinux]
```

Finally some hints of the expected values! (even better: these are the expected values 😄).

Here you can see how those values match to a machine type:

![Screen shot of the UI options how they work towards the values from the commandline: they match! The sequence from top to bottom in the UI match the sequence of the command line response](/images/2022/20220126/20220126_UI_Options.png)

# Tips
1. Keep in mind that the API for Codespaces is still in beta.
1. Do note that for automating these API calls you cannot use a GitHub App: the scope for the Apps is not available (yet?). You can make this work with an OAuth App or a Personal Access Token (PAT).